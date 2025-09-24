import { AiProvider } from "./adapter";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Set a default model and embedding model for Gemini
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_EMBEDDING_MODEL = "text-embedding-004";

const geminiAdapter: AiProvider = {
  generateText: async (prompt: string, context?: string): Promise<string> => {
    console.log("Gemini API: Generating text...");
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not found in environment variables");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    const fullPrompt = context
      ? `Based on this context: ${context}\n\nUser's question: ${prompt}`
      : prompt;

    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    return response.text() || "No response from Gemini.";
  },

  generateEmbedding: async (text: string): Promise<number[]> => {
    console.log("Gemini API: Generating embedding...");
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not found in environment variables");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: GEMINI_EMBEDDING_MODEL });

    const result = await model.embedContent(text);
    return result.embedding.values || [];
  },

  callFunction: async (prompt: string, functions: any[]): Promise<any> => {
    console.log("Gemini API: Calling function...");
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not found in environment variables");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      tools: functions,
    });

    const chat = model.startChat();
    const result = await chat.sendMessage(prompt);
    const response = result.response;

    const toolCall = response.functionCalls();
    if (toolCall) {
      return { tool_call: { function: toolCall } };
    }
    return response;
  },
};

export { geminiAdapter };
