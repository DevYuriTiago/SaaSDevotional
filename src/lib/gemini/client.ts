import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY não configurada no .env.local");
}

export const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
