import { json } from "@sveltejs/kit";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "$env/dynamic/private";

export async function POST({ request }) {
  const { message } = await request.json();

  if (!env.GEMINI_API_KEY) {
    return json({ error: "GEMINI_API_KEY is not set" }, { status: 500 });
  }

  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    return json({ text });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}
