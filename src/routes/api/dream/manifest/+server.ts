import { error } from "@sveltejs/kit";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "$env/dynamic/private";
import type { RequestHandler } from "./$types";
import { isDevHostname } from "$lib/utils/env";
import { dev } from "$app/environment";
import {
  generateDreamMedia,
  generateAudioGuide,
} from "$lib/server/dream-engine";

export const config = {
  maxDuration: 300,
};

// genAI will be initialized inside the request handler to use the correct environment key
let genAI: GoogleGenerativeAI;

const SYSTEM_INSTRUCTION = `You are a Cinematic Director. Analyze the provided dream prompt.
Determine the visual category: 'FLY', 'EXPLORE', 'TRANSFORM', or 'NIGHTMARE'.
Output MUST be a valid JSON object: 
{ 
  "category": "string", 
  "refined_prompt": "string",
  "hypnotic_script": "string" 
}
The 'refined_prompt' MUST be strictly in English and limited to a maximum of 300 characters to optimize token usage.
The 'hypnotic_script' should be a short, 2-sentence hypnotic induction script strictly in English. Deep, calming, and abstract. Focus on relaxation. Do not describe specific sounds.`;

export const POST: RequestHandler = async ({
  request,
}: {
  request: Request;
}) => {
  try {
    const { prompt, hypnotic_script: clientScript } = await request.json();
    if (!prompt) throw error(400, "Prompt is required");

    const encoder = new TextEncoder();
    const startTime = Date.now();
    const url = new URL(request.url);
    const isDevEnv = dev || isDevHostname(url.hostname);
    const SAFETY_TIMEOUT = isDevEnv ? 150000 : 180000;

    // Quota Splitting: Select the appropriate key strictly based on environment
    const activeGenAIKey = isDevEnv
      ? env.DEV_GOOGLE_GENERATIVE_AI_API_KEY
      : env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!activeGenAIKey) {
      throw error(
        500,
        `Missing API Key for ${isDevEnv ? "Dev" : "Prod"} environment`,
      );
    }

    genAI = new GoogleGenerativeAI(activeGenAIKey);

    if (isDevEnv) {
      console.log("🚀 [Manifest] Request Started", {
        promptLength: prompt.length,
      });
    }

    const stream = new ReadableStream({
      async start(controller) {
        const send = (event: string, data: any) => {
          controller.enqueue(
            encoder.encode(
              `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`,
            ),
          );
        };

        try {
          send("INIT", {});

          // 2. TTS Audio Guide (Start synthesis immediately if we have a script)
          let ttsPromise: Promise<string | null> = Promise.resolve(null);
          if (clientScript) {
            ttsPromise = generateAudioGuide(
              clientScript,
              env.GOOGLE_CLOUD_TTS_API_KEY || activeGenAIKey,
              isDevEnv,
            );
          }

          // 1. Director Phase (In parallel)
          const model = genAI.getGenerativeModel({
            model: "models/gemini-2.5-flash",
            systemInstruction: SYSTEM_INSTRUCTION,
          });

          const resultPromise = model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" },
          });

          const [result, audio] = await Promise.all([
            resultPromise,
            ttsPromise,
          ]);

          const {
            category,
            refined_prompt,
            hypnotic_script: directorScript,
          } = JSON.parse(result.response.text());

          send("PROGRESS", { message: "Director refined the dream..." });

          // If we used a client script, we stay in sync. If not, we use the director's.

          if (directorScript && !clientScript) {
            send("NEW_SCRIPT", { script: directorScript });
          }

          if (audio) {
            send("AUDIO_GUIDE", { audio });
            send("PROGRESS", { message: "Voice synthesis complete." });
          } else if (directorScript && !clientScript) {
            // If we didn't have a client script and we need to narrate the director's script
            const secondAudio = await generateAudioGuide(
              directorScript,
              env.GOOGLE_CLOUD_TTS_API_KEY || activeGenAIKey,
              isDevEnv,
            );
            if (secondAudio) send("AUDIO_GUIDE", { audio: secondAudio });
          }

          // 3. Visual Generation
          const { mediaUrl, mediaType, audioUrl } = await generateDreamMedia(
            refined_prompt,
            (msg) => send("PROGRESS", { message: msg }),
            SAFETY_TIMEOUT,
            startTime,
            activeGenAIKey,
          );

          send("COMPLETE", {
            mediaUrl,
            mediaType,
            audioUrl,
            enhancedPrompt: refined_prompt,
          });
          controller.close();
        } catch (err: any) {
          send("ERROR", { message: err.message || "Manifestation failed" });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err: any) {
    throw error(err.status || 500, err.message || "Internal Server Error");
  }
};
