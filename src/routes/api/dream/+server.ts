import { error, json } from "@sveltejs/kit";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { GOOGLE_GENERATIVE_AI_API_KEY } from "$env/static/private";
import type { RequestHandler } from "./$types";
import { IS_DEV_MODE } from "$lib/utils/env";

const genAI = new GoogleGenerativeAI(GOOGLE_GENERATIVE_AI_API_KEY);

const SYSTEM_INSTRUCTION = `You are the Dream Architect, a master of the subconscious. Your goal is to interpret vague dreams into vivid, cinematic video prompts. 

When a user describes a dream, you must:
1. Provide a poetic title.
2. Offer a psychological interpretation (Barnum effect style - relatable yet profound).
3. Create a detailed, English video generation prompt optimized for Veo or Runway.
4. Extract relevant keywords.

CRITICAL - Dream Guard:
If the dream contains violence, gore, or disturbing content, do NOT block it. Instead, SANITIZE it using beautiful metaphors. For example, replace 'blood' with 'red rose petals', 'monsters' with 'shifting shadows', 'screams' with 'haunting melodies'. Ensure the final output is PG-13 safe and aesthetically pleasing.

[IMPORTANT RULE: VISUAL SAFETY & COPYRIGHT]
When generating the 'video_prompt', NEVER use specific copyrighted character names (e.g., 'Iron Man', 'Pikachu', 'Mario', 'Elsa', 'Mickey Mouse').
Instead, describe them visually using generic terms.
- BAD: "Iron Man flying in the sky"
- GOOD: "A futuristic armored superhero in a sleek red and gold high-tech metallic suit flying in the sky"
- BAD: "Mickey Mouse"
- GOOD: "A cartoon mouse with big round ears wearing red shorts"

The 'video_prompt' must be purely descriptive and safe for AI video generation models.

Output MUST be a valid JSON object with the following structure:
{
  "title": "string",
  "insight": "string",
  "video_prompt": "string",
  "keywords": ["string"]
}`;

export const POST: RequestHandler = async ({
  request,
}: {
  request: Request;
}) => {
  try {
    const { dream } = await request.json();

    if (!dream || typeof dream !== "string") {
      throw error(400, "Dream description is required");
    }

    const model = genAI.getGenerativeModel({
      model: "models/gemini-2.0-flash",
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
    };

    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: dream }] }],
      generationConfig,
      safetySettings,
    });

    const response = result.response;
    const text = response.text();

    if (IS_DEV_MODE) {
      console.log("[Gemini] Response:", text);
    }

    return json(JSON.parse(text));
  } catch (err: any) {
    if (IS_DEV_MODE) {
      console.error("[Gemini] Analysis Error:", err);
    }

    // Handle SvelteKit errors (like the one we throw for 400)
    if (err.status) throw err;

    throw error(500, err.message || "Connection to the dream world failed");
  }
};
