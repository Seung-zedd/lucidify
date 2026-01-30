import { error } from "@sveltejs/kit";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GOOGLE_GENERATIVE_AI_API_KEY } from "$env/static/private";
import type { RequestHandler } from "./$types";
import { IS_DEV_MODE, isDevHostname } from "$lib/utils/env";
import { dev } from "$app/environment";
import { generateDreamMedia } from "$lib/server/dream-engine";

export const config = {
  maxDuration: 300,
};

const genAI = new GoogleGenerativeAI(GOOGLE_GENERATIVE_AI_API_KEY);

const SYSTEM_INSTRUCTION = `You are a Cinematic Director. Analyze the provided dream context and lucid action.
Maintain the original character, style, and setting exactly as described in the context.
Output MUST be a valid JSON object: { "category": "string", "refined_prompt": "string" }.`;

export const POST: RequestHandler = async ({
  request,
}: {
  request: Request;
}) => {
  try {
    const { prompt, action } = await request.json();
    if (!prompt || !action) throw error(400, "Prompt and action are required");

    const input = `Original Dream Context: "${prompt}". \nLucid Action to Perform: "${action}". \nVisual Task: Modify the scene to show the action. Maintain the original character, style, and setting exactly.`;

    const encoder = new TextEncoder();
    const startTime = Date.now();
    const url = new URL(request.url);
    const isDevEnv = dev || isDevHostname(url.hostname);
    const SAFETY_TIMEOUT = isDevEnv ? 30000 : 180000;

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
            contents: [{ role: "user", parts: [{ text: input }] }],
            generationConfig: { responseMimeType: "application/json" },
          });

          const { category, refined_prompt } = JSON.parse(
            result.response.text(),
          );
          send("PROGRESS", { message: "Director adapting your dream..." });

          // 2. Visual Generation (No TTS for Lucid)
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
          send("ERROR", {
            message: err.message || "Lucid manifestation failed",
          });
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
