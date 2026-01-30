import { error } from "@sveltejs/kit";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  GOOGLE_GENERATIVE_AI_API_KEY,
  GOOGLE_CLOUD_TTS_API_KEY,
} from "$env/static/private";
import type { RequestHandler } from "./$types";
import { IS_DEV_MODE, isDevHostname } from "$lib/utils/env";
import { dev } from "$app/environment";
import {
  generateDreamMedia,
  generateAudioGuide,
} from "$lib/server/dream-engine";

export const config = {
  maxDuration: 300,
};

const genAI = new GoogleGenerativeAI(GOOGLE_GENERATIVE_AI_API_KEY);

const SYSTEM_INSTRUCTION = `You are a Cinematic Director. Analyze the provided dream prompt.
Determine the visual category: 'FLY', 'EXPLORE', 'TRANSFORM', or 'NIGHTMARE'.
Output MUST be a valid JSON object: 
{ 
  "category": "string", 
  "refined_prompt": "string",
  "hypnotic_script": "string" 
}
The 'hypnotic_script' should be a short, 2-sentence hypnotic induction script strictly in English. Deep, calming, and abstract. Focus on relaxation. Do not describe specific sounds.`;

export const POST: RequestHandler = async ({
  request,
}: {
  request: Request;
}) => {
  try {
    const { prompt } = await request.json();
    if (!prompt) throw error(400, "Prompt is required");

    const encoder = new TextEncoder();
    const startTime = Date.now();
    const url = new URL(request.url);
    const isDevEnv = dev || isDevHostname(url.hostname);
    const SAFETY_TIMEOUT = isDevEnv ? 30000 : 180000;

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

          // 1. Director Phase
          const model = genAI.getGenerativeModel({
            model: "models/gemini-2.5-flash",
            systemInstruction: SYSTEM_INSTRUCTION,
          });

          const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" },
          });

          const { category, refined_prompt, hypnotic_script } = JSON.parse(
            result.response.text(),
          );
          send("PROGRESS", { message: "Director refined the dream..." });

          // 2. TTS Audio Guide (Wait for it)
          if (hypnotic_script) {
            try {
              const audio = await generateAudioGuide(
                hypnotic_script,
                GOOGLE_CLOUD_TTS_API_KEY || GOOGLE_GENERATIVE_AI_API_KEY,
                isDevEnv,
              );
              if (audio) {
                send("AUDIO_GUIDE", { audio });
                send("PROGRESS", { message: "Voice synthesis complete." });
              }
            } catch (ttsErr) {
              if (isDevEnv) console.error("❌ [TTS] Failed:", ttsErr);
            }
          }

          // 3. Visual Generation
          const { mediaUrl, mediaType } = await generateDreamMedia(
            refined_prompt,
            (msg) => send("PROGRESS", { message: msg }),
            SAFETY_TIMEOUT,
            startTime,
          );

          send("COMPLETE", {
            mediaUrl,
            mediaType,
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
