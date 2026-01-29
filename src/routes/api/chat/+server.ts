import { json } from "@sveltejs/kit";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "$env/dynamic/private";
import { isDevHostname } from "$lib/utils/env";
import { dev } from "$app/environment";

export async function POST({ request }) {
  const url = new URL(request.url);
  const isDevEnv = dev || isDevHostname(url.hostname);

  try {
    const { message } = await request.json();

    if (!env.GEMINI_API_KEY) {
      return json({ error: "GEMINI_API_KEY is not set" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(message);
    const response = result.response;
    const text = response.text();

    if (isDevEnv) {
      console.log("[Chat] Response:", text);
    }

    return json({ text });
  } catch (err: any) {
    if (isDevEnv) {
      console.error("[Chat] Error:", err);
    }
    return json({ error: err.message }, { status: 500 });
  }
}
