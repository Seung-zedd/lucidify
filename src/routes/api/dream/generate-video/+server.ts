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

          // 3. Swan Strategy: Veo 3.1 with Smart Mocking Fallback
          let videoUrl = "";
          const isLucid = !!action;

          const getMockVideoUrl = () => {
            let mockUrl = "/videos/demo_dream.mp4";
            const lowerInput = input.toLowerCase();
            if (
              category === "FLY" ||
              lowerInput.includes("sky") ||
              lowerInput.includes("wings") ||
              lowerInput.includes("float")
            ) {
              mockUrl = "/videos/demo_fly.mp4";
            } else if (category === "TRANSFORM" || isLucid) {
              mockUrl = "/videos/demo_lucid.mp4";
            }
            return mockUrl;
          };

          try {
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
              if (IS_DEV_MODE) {
                console.error("🚀 [AI Studio] Kickoff Failed:", errData);
              }
              throw new Error("Veo Kickoff Failed");
            }

            const startData = await startRes.json();
            const operationName = startData.name;
            const pollUrl = `https://generativelanguage.googleapis.com/v1beta/${operationName}`;

            let isVideoDone = false;
            while (!isVideoDone) {
              // Safety Timeout (90s for Swan Strategy)
              if (Date.now() - startTime > 90000) {
                if (IS_DEV_MODE) {
                  console.log(
                    "⚠️ [Swan Strategy] Veo Timeout (90s) - Falling back to Smart Mocking",
                  );
                }
                videoUrl = getMockVideoUrl();
                isVideoDone = true;
                break;
              }

              if (IS_DEV_MODE) {
                console.log(`🚀 [AI Studio] Polling: ${pollUrl}`);
              }

              const pollRes = await fetch(pollUrl, {
                headers: { "x-goog-api-key": apiKey },
              });

              if (!pollRes.ok) {
                throw new Error("Polling failed");
              }

              const pollData = await pollRes.json();

              if (pollData.done) {
                if (pollData.error) {
                  if (IS_DEV_MODE) {
                    console.error("❌ AI Studio API Error:", pollData.error);
                  }
                  throw new Error("Veo API Error");
                }

                // Search for Video URI
                videoUrl =
                  pollData.result?.videoUri ||
                  pollData.response?.videoUri ||
                  pollData.metadata?.outputUri ||
                  pollData.response?.result?.videoUri ||
                  pollData.response?.outputUri ||
                  "";

                // Fallback: Parse stringified response
                if (!videoUrl && typeof pollData.response === "string") {
                  try {
                    const nested = JSON.parse(pollData.response);
                    videoUrl = nested.videoUri || nested.result?.videoUri || "";
                  } catch (e) {
                    /* ignore */
                  }
                }

                if (videoUrl) {
                  if (IS_DEV_MODE) {
                    console.log("✅ Video URL Found:", videoUrl);
                  }
                  isVideoDone = true;
                } else {
                  throw new Error("Video URL not found in response");
                }
              } else {
                send("PROGRESS", { message: "Generating video frames..." });
                await new Promise((r) => setTimeout(r, 5000));
              }
            }
          } catch (veoErr) {
            if (IS_DEV_MODE) {
              console.warn(
                "⚠️ [Swan Strategy] Veo Phase Failed, using mock fallback:",
                veoErr,
              );
            }
            videoUrl = getMockVideoUrl();
          }

          if (!videoUrl) {
            videoUrl = getMockVideoUrl();
          }

          if (IS_DEV_MODE) {
            console.log("Director Category:", category);
            console.log("Selected Video:", videoUrl);
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
