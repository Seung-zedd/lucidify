import { error } from "@sveltejs/kit";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GOOGLE_GENERATIVE_AI_API_KEY } from "$env/static/private";
import type { RequestHandler } from "./$types";

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
          send("INIT", { message: "Establishing Neural Link..." });
          await new Promise((r) => setTimeout(r, 800));

          // 2. Director Phase (Gemini)
          const model = genAI.getGenerativeModel({
            model: "models/gemini-2.0-flash",
            systemInstruction: SYSTEM_INSTRUCTION,
          });

          const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: input }] }],
            generationConfig: { responseMimeType: "application/json" },
          });

          const response = result.response;
          const text = response.text();
          const { category, refined_prompt } = JSON.parse(text);

          send("PROGRESS", {
            message: `Director selected theme: ${category}...`,
          });
          await new Promise((r) => setTimeout(r, 1000));

          // 3. Simulation Loop
          const steps = [
            "Constructing Visuals...",
            "Warping Reality...",
            "Finalizing Dreamscape...",
          ];

          for (const step of steps) {
            send("PROGRESS", { message: step });
            await new Promise((r) => setTimeout(r, 1000));
          }

          // 4. Smart Mocking (Router)
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

          // 5. COMPLETE
          send("COMPLETE", {
            videoUrl,
            enhancedPrompt: refined_prompt,
          });
          controller.close();
        } catch (err: any) {
          send("ERROR", {
            message: err.message || "The Cinematic Director is unavailable",
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
