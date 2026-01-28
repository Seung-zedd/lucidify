import { error } from "@sveltejs/kit";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GOOGLE_GENERATIVE_AI_API_KEY } from "$env/static/private";
import type { RequestHandler } from "./$types";
import { IS_DEV_MODE } from "$lib/utils/env";
import process from "node:process";

export const config = {
  maxDuration: 300,
};

const genAI = new GoogleGenerativeAI(GOOGLE_GENERATIVE_AI_API_KEY);

const SYSTEM_INSTRUCTION = `You are a Cinematic Director. Analyze the provided dream prompt or lucid action. 
Determine the visual category: 'FLY', 'EXPLORE', 'TRANSFORM', or 'NIGHTMARE'. 
Output MUST be a valid JSON object: { "category": string, "refined_prompt": string }.`;

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { prompt, action } = await request.json();
    const input = action || prompt;

    if (!input) {
      throw error(400, "Prompt or action is required");
    }

    const encoder = new TextEncoder();
    const startTime = Date.now();

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
          // 1. INIT
          send("INIT", {});

          // 2. Director Phase (Gemini)
          const model = genAI.getGenerativeModel({
            model: "models/gemini-2.0-flash",
            systemInstruction: SYSTEM_INSTRUCTION,
          });

          const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: input }] }],
            generationConfig: { responseMimeType: "application/json" },
          });

          const { category, refined_prompt } = JSON.parse(
            result.response.text(),
          );

          send("PROGRESS", { message: "Director refined the prompt..." });

          // 3. Veo Generation Phase (AI Studio)
          const apiKey =
            process.env.GOOGLE_AI_API_KEY || GOOGLE_GENERATIVE_AI_API_KEY;
          if (!apiKey) throw new Error("Missing GOOGLE_AI_API_KEY");

          const apiUrl =
            "https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-fast-generate-preview:predictLongRunning";

          const startRes = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": apiKey,
            },
            body: JSON.stringify({
              instances: [{ prompt: refined_prompt }],
              parameters: { sampleCount: 1, aspectRatio: "16:9" },
            }),
          });

          if (!startRes.ok) {
            const errData = await startRes.json();
            throw new Error(
              `AI Studio Kickoff Error: ${errData.error?.message || startRes.statusText}`,
            );
          }

          const startData = await startRes.json();
          if (IS_DEV_MODE) {
            console.log(
              "🚀 [AI Studio] Kickoff Response:",
              JSON.stringify(startData, null, 2),
            );
          }
          const operationName = startData.name;

          // 4. Polling Phase
          const pollUrl = `https://generativelanguage.googleapis.com/v1beta/${operationName}`;
          let isVideoDone = false;
          let videoUrl = "";

          while (!isVideoDone) {
            // Safety Timeout (295s)
            if (Date.now() - startTime > 295000) {
              throw new Error(
                "Generation timed out (limit 300s). Please try again.",
              );
            }

            if (IS_DEV_MODE) {
              console.log(`🚀 [AI Studio] Polling: ${pollUrl}`);
            }

            const pollRes = await fetch(pollUrl, {
              headers: { "x-goog-api-key": apiKey },
            });

            if (!pollRes.ok) {
              const errText = await pollRes.text();
              throw new Error(`AI Studio Polling Failed: ${errText}`);
            }

            const pollData = await pollRes.json();

            if (pollData.done) {
              isVideoDone = true;
              if (pollData.error) {
                throw new Error(
                  pollData.error.message || "Video generation failed.",
                );
              }

              // Extract Video URL
              videoUrl =
                pollData.response?.videoUri ||
                pollData.response?.outputUri ||
                pollData.response?.result?.videoUri ||
                pollData.metadata?.outputUri ||
                "";

              if (IS_DEV_MODE) {
                console.log(
                  "✅ Generation Complete:",
                  JSON.stringify(pollData, null, 2),
                );
              }
            } else {
              send("PROGRESS", { message: "Generating video frames..." });
              // Wait 5 seconds
              await new Promise((r) => setTimeout(r, 5000));
            }
          }

          if (!videoUrl) {
            throw new Error("Failed to retrieve video URL from AI Studio.");
          }

          // 5. COMPLETE
          send("COMPLETE", {
            videoUrl: videoUrl,
            enhancedPrompt: refined_prompt,
          });
          controller.close();
        } catch (err: any) {
          send("ERROR", {
            message: err.message || "Video generation failed",
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
    if (IS_DEV_MODE) {
      console.error("Video Generation Error:", err);
    }
    if (err.status) throw err;
    throw error(500, err.message || "Internal Server Error");
  }
};
