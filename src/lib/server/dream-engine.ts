import { GOOGLE_GENERATIVE_AI_API_KEY } from "$env/static/private";
import { IS_DEV_MODE, isDevHostname } from "$lib/utils/env";
import { dev } from "$app/environment";
import process from "node:process";

export interface GenerationResult {
  mediaUrl: string;
  mediaType: "video" | "image";
}

export async function generateDreamMedia(
  refinedPrompt: string,
  sendProgress: (message: string) => void,
  safetyTimeout: number,
  startTime: number,
): Promise<GenerationResult> {
  let mediaUrl = "";
  let mediaType: "video" | "image" = "video";

  const apiKey = process.env.GOOGLE_AI_API_KEY || GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) throw new Error("Missing AI API Key");

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
        instances: [{ prompt: refinedPrompt }],
        parameters: { sampleCount: 1, aspectRatio: "16:9" },
      }),
    });

    if (!startRes.ok) {
      const errData = await startRes.json();
      if (IS_DEV_MODE) console.error("🚀 [Veo] Kickoff Failed:", errData);
      throw new Error("Veo Kickoff Failed");
    }

    const startData = await startRes.json();
    const operationName = startData.name;
    const pollUrl = `https://generativelanguage.googleapis.com/v1beta/${operationName}`;

    let isVideoDone = false;
    while (!isVideoDone) {
      // Safety Timeout
      if (Date.now() - startTime > safetyTimeout) {
        if (IS_DEV_MODE)
          console.log(`⚠️ [Veo] Timeout - Falling back to Imagen`);
        throw new Error("Veo Timeout");
      }

      const pollRes = await fetch(pollUrl, {
        headers: { "x-goog-api-key": apiKey },
      });

      if (!pollRes.ok) throw new Error("Polling failed");
      const pollData = await pollRes.json();

      if (pollData.done) {
        if (pollData.error) {
          if (IS_DEV_MODE) console.error("❌ Veo API Error:", pollData.error);
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
        sendProgress("Generating dream frames...");
        await new Promise((r) => setTimeout(r, 5000));
      }
    }
  } catch (veoErr: any) {
    // --- FALLBACK TO IMAGEN ---
    if (IS_DEV_MODE)
      console.warn(
        "⚠️ [Swan] Veo Failed, switching to Imagen:",
        veoErr.message,
      );
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
      const base64 = await tryImagen("imagen-4.0-ultra-generate-001");
      mediaUrl = `data:image/png;base64,${base64}`;
      mediaType = "image";
    } catch {
      try {
        const base64 = await tryImagen("imagen-3.0-generate-001");
        mediaUrl = `data:image/png;base64,${base64}`;
        mediaType = "image";
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
    const ttsUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;

    // Abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const res = await fetch(ttsUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        input: { text: script },
        voice: { languageCode: "en-US", name: "en-US-Neural2-F" },
        audioConfig: {
          audioEncoding: "MP3",
          speakingRate: 0.85,
          pitch: -4.0,
        },
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
