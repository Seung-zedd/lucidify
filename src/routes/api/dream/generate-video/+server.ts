import { error, json } from "@sveltejs/kit";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GOOGLE_GENERATIVE_AI_API_KEY } from "$env/static/private";
import type { RequestHandler } from "./$types";

const genAI = new GoogleGenerativeAI(GOOGLE_GENERATIVE_AI_API_KEY);

const SYSTEM_INSTRUCTION = `You are a Cinematic Director. Analyze the provided dream prompt or lucid action. 
Determine the visual category: 'FLY', 'EXPLORE', 'TRANSFORM', or 'NIGHTMARE'. 
Output MUST be a valid JSON object: { "category": string, "refined_prompt": string }.`;

export const POST: RequestHandler = async ({
  request,
}: {
  request: Request;
}) => {
  try {
    const { prompt, action } = await request.json();

    const input = action || prompt;
    if (!input) {
      throw error(400, "Prompt or action is required");
    }

    const model = genAI.getGenerativeModel({
      model: "models/gemini-2.0-flash",
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: input }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const response = result.response;
    const text = response.text();
    const { category, refined_prompt } = JSON.parse(text);

    // Simulate Rendering Latency (4s)
    await new Promise((r) => setTimeout(r, 4000));

    // Smart Mocking (Router)
    let videoUrl = "/videos/demo_dream.mp4";
    const lowerInput = input.toLowerCase();

    if (
      category === "FLY" ||
      lowerInput.includes("sky") ||
      lowerInput.includes("wings") ||
      lowerInput.includes("float")
    ) {
      videoUrl = "/videos/demo_fly.mp4";
    } else if (category === "TRANSFORM" || action) {
      videoUrl = "/videos/demo_lucid.mp4";
    }

    if (import.meta.env.DEV) {
      console.log("Director Category:", category);
      console.log("Selected Video:", videoUrl);
    }

    return json({
      success: true,
      videoUrl,
      enhancedPrompt: refined_prompt,
    });
  } catch (err: any) {
    if (import.meta.env.DEV) {
      console.error("Video Generation Error:", err);
    }
    if (err.status) throw err;
    throw error(500, err.message || "The Cinematic Director is unavailable");
  }
};
