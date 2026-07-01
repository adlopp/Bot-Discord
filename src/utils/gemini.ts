import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env.js";

const genAI = new GoogleGenerativeAI(env.geminiApiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

export async function askGemini(question: string): Promise<string | null> {
  try {
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: `Responde esta pregunta de forma clara y concisa en español: ${question}` }],
        },
      ],
    });
    const text = result.response.text();
    return text || null;
  } catch (error) {
    console.error("Error con Gemini:", error);
    return null;
  }
}
