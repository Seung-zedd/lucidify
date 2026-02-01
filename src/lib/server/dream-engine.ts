import {
  GOOGLE_GENERATIVE_AI_API_KEY,
  DEV_GOOGLE_GENERATIVE_AI_API_KEY,
} from "$env/static/private";
import { IS_DEV_MODE } from "$lib/utils/env";
import { GoogleGenerativeAI } from "@google/generative-ai";
import process from "node:process";

export interface GenerationResult {
  mediaUrl: string;
  mediaType: "video" | "image";
  audioUrl?: string;
}

const AMBIENT_FILES = [
  "nature.mp3",
  "space.mp3",
  "city.mp3",
  "horror.mp3",
  "fantasy.mp3",
];

async function matchAmbientSound(
  prompt: string,
  apiKey: string,
): Promise<string> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const instruction = `
      Analyze this dream description: '${prompt}'.
      Select the most appropriate ambient audio file from this list: [${AMBIENT_FILES.join(", ")}].
      
      Apply these strict matching rules for your selection:
      - Use 'space.mp3' if the dream involves: outer space, stars, void, OR flying, sky, aircraft, machines, sci-fi (to match drone/wind textures).
      - Use 'nature.mp3' if: forest, animals, water, grass, calm nature, or temple.
      - Use 'city.mp3' if: urban, cyberpunk, rain, street, or neon.
      - Use 'horror.mp3' if: nightmare, scary, dark, tension, or monster.
      - Use 'fantasy.mp3' if: magic, gods, ethereal, or mystical.

      Return ONLY the filename (e.g., 'space.mp3'). Default to 'fantasy.mp3' if unsure.
    `;

    const result = await model.generateContent(instruction);
    const response = await result.response;
    const text = response.text().trim().toLowerCase();

    // Cleanup: remove markdown or extra text
    const matched = AMBIENT_FILES.find((f) => text.includes(f.toLowerCase()));
    return matched || "fantasy.mp3";
  } catch (err) {
    if (IS_DEV_MODE) console.error("❌ [Audio Match] Failed:", err);
    return "fantasy.mp3";
  }
}

export async function generateDreamMedia(
  refinedPrompt: string,
  sendProgress: (message: string) => void,
  safetyTimeout: number,
  startTime: number,
  overrideApiKey?: string,
): Promise<GenerationResult> {
  let mediaUrl = "";
  let mediaType: "video" | "image" = "video";

  const apiKey =
    overrideApiKey ||
    (IS_DEV_MODE
      ? DEV_GOOGLE_GENERATIVE_AI_API_KEY
      : GOOGLE_GENERATIVE_AI_API_KEY);

  if (!apiKey) throw new Error("Missing AI API Key");

  if (IS_DEV_MODE) {
    console.log(
      "🌌 [DreamEngine] generateDreamMedia started for prompt:",
      refinedPrompt.substring(0, 50) + "...",
    );
  }

  try {
    // --- VEO VIDEO GENERATION ---
    // Reverting to 3.1 as the 404 confirmed the version-less string is not recognized by the API
    const modelId = "veo-3.1-fast-generate-preview";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:predictLongRunning`;

    if (IS_DEV_MODE) {
      console.log(
        `🎬 [Veo] Attempting Video Generation with model: ${modelId}...`,
      );
      // Help user verify they are using the correct project's key (safe prefix only)
      console.log(`🔑 [Auth] API Key Prefix: ${apiKey.substring(0, 8)}...`);
    }

    let startRes: Response;
    let retries = 0;
    const maxRetries = 3; // Increased retries

    while (true) {
      startRes = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          instances: [{ prompt: refinedPrompt }],
          parameters: { sampleCount: 1, aspectRatio: "16:9" },
        }),
      });

      // Handle Quota Exhaustion with Exponential Backoff
      if (startRes.status === 429 && retries < maxRetries) {
        retries++;
        // Start with a longer wait (5s) to allow the rolling window to reset
        const waitTime = Math.pow(2, retries) * 2500 + Math.random() * 2000;
        if (IS_DEV_MODE) {
          console.warn(
            `⚠️ [Veo] 429 Quota Exhausted. Retrying in ${Math.round(waitTime)}ms... (Attempt ${retries}/${maxRetries})`,
          );
        }
        await new Promise((r) => setTimeout(r, waitTime));
        continue;
      }

      if (!startRes.ok) {
        const errData = await startRes.json();
        if (IS_DEV_MODE) {
          console.error("🚨 [Veo CRASH] Status:", startRes.status);
          console.error(
            "🚨 [Veo CRASH] Body:",
            JSON.stringify(errData, null, 2),
          );
        }
        throw new Error(`Veo Kickoff Failed: ${startRes.status}`);
      }
      break;
    }

    const startData = await startRes.json();
    const operationName = startData.name;
    const pollUrl = `https://generativelanguage.googleapis.com/v1beta/${operationName}`;

    if (IS_DEV_MODE) {
      console.log("🚀 [Veo] Kickoff Success. Operation:", operationName);
    }

    let isVideoDone = false;
    let pollCount = 0;
    while (!isVideoDone) {
      pollCount++;
      // Safety Timeout
      if (Date.now() - startTime > safetyTimeout) {
        if (IS_DEV_MODE)
          console.log(
            `⚠️ [Veo] Timeout after ${pollCount} polls - Falling back to Imagen`,
          );
        throw new Error("Veo Timeout");
      }

      if (IS_DEV_MODE) {
        console.log(`🔎 [Veo] Polling... (Attempt ${pollCount})`);
      }

      const pollRes = await fetch(pollUrl, {
        headers: { "x-goog-api-key": apiKey },
      });

      if (!pollRes.ok) throw new Error("Polling failed");
      const pollData = await pollRes.json();

      if (pollData.done) {
        if (pollData.error) {
          if (IS_DEV_MODE) {
            console.error(
              "❌ Veo API Error [DONE=true]:",
              JSON.stringify(pollData.error, null, 2),
            );
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
          if (IS_DEV_MODE) {
            console.log("✅ [Veo] Generation Complete! URL:", mediaUrl);
          }
        } else {
          if (IS_DEV_MODE) {
            console.error(
              "🚨 [Veo CRASH] Video URL missing in pollData response. Full dump:",
              JSON.stringify(pollData, null, 2),
            );
          }
          throw new Error("Video URL not found");
        }
      } else {
        sendProgress("Generating dream frames...");
        await new Promise((r) => setTimeout(r, 5000));
      }
    }
  } catch (veoErr: any) {
    // --- FALLBACK TO IMAGEN ---
    if (IS_DEV_MODE) {
      console.error("🔥 [Veo Exception] Message:", veoErr.message);
      console.error("🔥 [Veo Exception] Stack:", veoErr.stack);
      if (veoErr.cause)
        console.error("🔥 [Veo Cause]:", JSON.stringify(veoErr.cause, null, 2));

      console.warn(
        "⚠️ [Swan] Veo Failed, switching to Imagen:",
        veoErr.message,
      );
    }
    sendProgress("Switching to high-fidelity visualization...");

    const tryImagen = async (modelName: string) => {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:predict`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          instances: [{ prompt: refinedPrompt }],
          parameters: { sampleCount: 1, aspectRatio: "16:9" },
        }),
      });

      if (!res.ok) throw new Error(`Imagen (${modelName}) failed`);
      const data = await res.json();
      return data.predictions?.[0]?.bytesBase64Encoded;
    };

    try {
      const [base64, matchedFilename] = await Promise.all([
        tryImagen("imagen-4.0-ultra-generate-001"),
        matchAmbientSound(refinedPrompt, apiKey),
      ]);
      mediaUrl = `data:image/png;base64,${base64}`;
      mediaType = "image";
      return {
        mediaUrl,
        mediaType,
        audioUrl: "/audios/ambient/" + matchedFilename,
      };
    } catch {
      try {
        const [base64, matchedFilename] = await Promise.all([
          tryImagen("imagen-3.0-generate-001"),
          matchAmbientSound(refinedPrompt, apiKey),
        ]);
        mediaUrl = `data:image/png;base64,${base64}`;
        mediaType = "image";
        return {
          mediaUrl,
          mediaType,
          audioUrl: "/audios/ambient/" + matchedFilename,
        };
      } catch {
        // Final Safety Fallback
        mediaUrl = "/images/purple-dream.mp4";
        mediaType = "video";
      }
    }
  }

  return { mediaUrl, mediaType };
}

export async function generateAudioGuide(
  script: string,
  apiKey: string,
  isDevEnv: boolean = false,
): Promise<string | null> {
  try {
    // Construct aggressive SSML for hypnotic pacing
    const ssmlScript = `<speak><prosody rate="0.85" pitch="-2.0st">${script
      .replace(/\./g, '.<break time="1000ms"/>')
      .replace(/,/g, ',<break time="500ms"/>')}</prosody></speak>`;

    const ttsUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;

    // Abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s for complex SSML

    const res = await fetch(ttsUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        input: { ssml: ssmlScript },
        voice: { languageCode: "en-US", name: "en-US-Neural2-F" },
        audioConfig: { audioEncoding: "MP3" },
      }),
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      if (isDevEnv) {
        const errData = await res.json();
        console.error(
          "❌ [TTS] Synthesis Failed:",
          JSON.stringify(errData, null, 2),
        );

        if (errData.error?.status === "PERMISSION_DENIED") {
          console.warn(
            "💡 Hint: Your API key might be an AI Studio key. Cloud TTS needs a GCP API key with 'Cloud Text-to-Speech API' enabled and unrestricted.",
          );
        }
      }
      return null;
    }
    const data = await res.json();
    return data.audioContent;
  } catch (err: any) {
    if (isDevEnv) {
      console.error(
        "❌ [TTS] Request Error:",
        err.name === "AbortError" ? "Timeout" : err,
      );
    }
    return null;
  }
}
