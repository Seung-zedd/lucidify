import { error } from "@sveltejs/kit";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAuth } from "google-auth-library";
import { Storage } from "@google-cloud/storage";
import {
  GOOGLE_GENERATIVE_AI_API_KEY,
  GCP_PROJECT_ID,
  GCP_LOCATION,
  GCP_GCS_BUCKET_NAME,
  GCP_CREDENTIALS_JSON,
} from "$env/static/private";
import type { RequestHandler } from "./$types";

export const config = {
  maxDuration: 60,
};

const genAI = new GoogleGenerativeAI(GOOGLE_GENERATIVE_AI_API_KEY);

const SYSTEM_INSTRUCTION = `You are a Cinematic Director. Analyze the provided dream prompt or lucid action. 
Determine the visual category: 'FLY', 'EXPLORE', 'TRANSFORM', or 'NIGHTMARE'. 
Output MUST be a valid JSON object: { "category": string, "refined_prompt": string }.`;

// Initialize GCP Auth and Storage
const credentials = JSON.parse(GCP_CREDENTIALS_JSON);
const auth = new GoogleAuth({
  credentials,
  scopes: "https://www.googleapis.com/auth/cloud-platform",
});
const storage = new Storage({ credentials });

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

          // 3. Veo Generation Phase
          const client = await auth.getClient();
          const accessToken = await client.getAccessToken();

          const veoEndpoint = `https://${GCP_LOCATION}-aiplatform.googleapis.com/v1beta1/projects/${GCP_PROJECT_ID}/locations/${GCP_LOCATION}/publishers/google/models/veo-2.0-generate-001:predictLongRunning`;

          const veoResponse = await fetch(veoEndpoint, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken.token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              instances: [{ prompt: refined_prompt }],
              parameters: {
                aspectRatio: "16:9",
                storageUri: `gs://${GCP_GCS_BUCKET_NAME}/videos`,
              },
            }),
          });

          if (!veoResponse.ok) {
            const contentType = veoResponse.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              const errData = await veoResponse.json();
              throw new Error(
                `Veo API Error: ${errData.error?.message || veoResponse.statusText}`,
              );
            } else {
              const errText = await veoResponse.text();
              throw new Error(
                `Veo API HTML Error (${veoResponse.status}): ${errText.slice(0, 100)}...`,
              );
            }
          }

          const veoData = await veoResponse.json();
          if (import.meta.env.DEV) {
            console.log(
              "Veo Initial Response:",
              JSON.stringify(veoData, null, 2),
            );
          }
          let gcsUri = "";

          // 3. Polling Loop (BLOCKING)
          let isVideoDone = false;
          if (veoData.name && veoData.name.startsWith("projects/")) {
            const apiHost = `https://${GCP_LOCATION}-aiplatform.googleapis.com/v1beta1`;
            const pollUrl = `${apiHost}/${veoData.name}`;

            if (import.meta.env.DEV) {
              console.log("Fixed Polling URL:", pollUrl);
            }

            while (!isVideoDone) {
              // Check timeout (55s rule)
              if (Date.now() - startTime > 55000) {
                throw new Error(
                  "Generation timed out (limit 55s). Please try again.",
                );
              }

              // Fetch Status (await is CRITICAL here)
              const pollResponse = await fetch(pollUrl, {
                headers: { Authorization: `Bearer ${accessToken.token}` },
              });

              if (!pollResponse.ok) {
                const errText = await pollResponse.text();
                throw new Error(
                  `Veo Poll Error (${pollResponse.status}): ${errText.slice(0, 100)}`,
                );
              }

              const pollData = await pollResponse.json();

              if (pollData.done) {
                if (pollData.error) {
                  throw new Error(`Veo LRO Error: ${pollData.error.message}`);
                }
                // Extract GCS URI from response
                gcsUri =
                  pollData.response?.predictions?.[0]?.video?.uri ||
                  pollData.response?.outputs?.[0]?.uri ||
                  "";
                isVideoDone = true;
              } else {
                send("PROGRESS", { message: "Generating video..." });
                // Wait 3 seconds (Blocking wait)
                await new Promise((r) => setTimeout(r, 3000));
              }
            }
          } else {
            // Immediate response handling
            gcsUri =
              veoData.predictions?.[0]?.video?.uri ||
              veoData.predictions?.[0]?.uri ||
              "";
          }

          if (!gcsUri) {
            throw new Error(
              "Failed to retrieve video URI from Veo. Check server logs for response structure.",
            );
          }

          // 4. Generate Signed URL
          const bucketName = gcsUri.replace("gs://", "").split("/")[0];
          const fileName = gcsUri.replace(`gs://${bucketName}/`, "");

          const [signedUrl] = await storage
            .bucket(bucketName)
            .file(fileName)
            .getSignedUrl({
              version: "v4",
              action: "read",
              expires: Date.now() + 60 * 60 * 1000, // 1 hour
            });

          if (import.meta.env.DEV) {
            console.log("Director Category:", category);
            console.log("Signed Video URL:", signedUrl);
          }

          // 5. COMPLETE
          send("COMPLETE", {
            videoUrl: signedUrl,
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
    if (import.meta.env.DEV) {
      console.error("Video Generation Error:", err);
    }
    if (err.status) throw err;
    throw error(500, err.message || "Internal Server Error");
  }
};
