import { error } from "@sveltejs/kit";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GOOGLE_GENERATIVE_AI_API_KEY } from "$env/static/private";
import type { RequestHandler } from "./$types";
import { IS_DEV_MODE } from "$lib/utils/env";
import { dev } from "$app/environment";
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
    // Dev: 20s, Prod: 180s
    const SAFETY_TIMEOUT = dev ? 20000 : 180000;

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

          send("PROGRESS", { message: "Director refined the prompt..." });

          // 3. Swan Strategy: Veo 3.1 with Imagen 4.0 Fallback
          let mediaUrl = "";
          let mediaType: "video" | "image" = "video";

          const apiKey =
            process.env.GOOGLE_AI_API_KEY || GOOGLE_GENERATIVE_AI_API_KEY;
          if (!apiKey) throw new Error("Missing GOOGLE_AI_API_KEY");

          try {
            // --- VEO VIDEO GENERATION ---
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
              if (IS_DEV_MODE) {
                console.error("🚀 [Veo] Kickoff Failed:", errData);
              }
              throw new Error("Veo Kickoff Failed");
            }

            const startData = await startRes.json();
            const operationName = startData.name;
            const pollUrl = `https://generativelanguage.googleapis.com/v1beta/${operationName}`;

            let isVideoDone = false;
            while (!isVideoDone) {
              // Safety Timeout
              if (Date.now() - startTime > SAFETY_TIMEOUT) {
                if (IS_DEV_MODE) {
                  console.log(
                    `⚠️ [Veo] Timeout (${SAFETY_TIMEOUT / 1000}s) - Falling back to Imagen 4.0`,
                  );
                }
                throw new Error("Veo Timeout");
              }

              if (IS_DEV_MODE) {
                console.log(`🚀 [Veo] Polling: ${pollUrl}`);
              }

              const pollRes = await fetch(pollUrl, {
                headers: { "x-goog-api-key": apiKey },
              });

              if (!pollRes.ok) throw new Error("Polling failed");

              const pollData = await pollRes.json();

              if (pollData.done) {
                if (pollData.error) {
                  if (IS_DEV_MODE) {
                    console.error("❌ Veo API Error:", pollData.error);
                  }
                  throw new Error("Veo API Error");
                }

                mediaUrl =
                  pollData.result?.videoUri ||
                  pollData.response?.videoUri ||
                  pollData.metadata?.outputUri ||
                  pollData.response?.result?.videoUri ||
                  pollData.response?.outputUri ||
                  "";

                if (mediaUrl) {
                  mediaType = "video";
                  isVideoDone = true;
                } else {
                  throw new Error("Video URL not found");
                }
              } else {
                send("PROGRESS", { message: "Generating dream frames..." });
                await new Promise((r) => setTimeout(r, 5000));
              }
            }
          } catch (veoErr: any) {
            // --- IMAGEN 4.0 ULTRA FALLBACK ---
            if (IS_DEV_MODE) {
              console.warn(
                "⚠️ [Swan Strategy] Veo Failed, switching to Imagen 4.0:",
                veoErr?.message || veoErr,
              );
            }
            send("PROGRESS", {
              message: "Switching to high-fidelity visualization...",
            });

            const imagenUrl =
              "https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-ultra:predict";
            const imagenRes = await fetch(imagenUrl, {
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

            if (!imagenRes.ok) {
              const errData = await imagenRes.json();
              if (IS_DEV_MODE) {
                console.error("❌ [Imagen] Failed:", errData);
              }
              throw new Error("Visualization failed completely");
            }

            const imagenData = await imagenRes.json();
            const base64Image = imagenData.predictions?.[0]?.bytesBase64Encoded;

            if (base64Image) {
              mediaUrl = `data:image/png;base64,${base64Image}`;
              mediaType = "image";
            } else {
              throw new Error("Image data not found in response");
            }
          }

          // 5. COMPLETE
          send("COMPLETE", {
            mediaUrl: mediaUrl,
            mediaType: mediaType,
            enhancedPrompt: refined_prompt,
          });
          controller.close();
        } catch (err: any) {
          send("ERROR", {
            message: err.message || "Dream manifestation failed",
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
      console.error("Dream Generation Error:", err);
    }
    if (err.status) throw err;
    throw error(500, err.message || "Internal Server Error");
  }
};
