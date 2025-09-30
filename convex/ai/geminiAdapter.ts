import { AiProvider } from "./adapter";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Set a default model and embedding model for Gemini
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_EMBEDDING_MODEL = "text-embedding-004";

function getRandomGeminiApiKey(): string {
  const keys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
  ].filter((key): key is string => key !== undefined && key !== null);

  if (keys.length === 0) {
    throw new Error("No GEMINI_API_KEYs found in environment variables");
  }

  const randomIndex = Math.floor(Math.random() * keys.length);
  return keys[randomIndex]!;
}


const geminiAdapter: AiProvider = {
  generateText: async (prompt: string, context?: string): Promise<string> => {
    console.log("Gemini API: Generating text...");
    const apiKey = getRandomGeminiApiKey();
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

  generateEmbeddings: async (texts: string[]): Promise<number[][]> => {
    console.log("Gemini API: Generating embeddings for a batch...");
    const apiKey = getRandomGeminiApiKey();
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not found in environment variables");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: GEMINI_EMBEDDING_MODEL });

    // Convert the array of strings to the required format for batchEmbedContents
    const requests = texts.map((text) => ({
      content: {
        role: "user",
        parts: [{ text }]
      }
    }));

    try {
      const result = await model.batchEmbedContents({ requests });

      // Extract the 'values' array from each embedding object
      return result.embeddings.map(embedding => embedding.values || []);
    } catch (error) {
      console.error("Error generating embeddings:", error);
      throw error;
    }
  },

  callFunction: async (prompt: string, functions: any[], context?: string): Promise<any> => {
      console.log("Gemini API: Calling function...");
      const apiKey = getRandomGeminiApiKey();
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY not found in environment variables");
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: GEMINI_MODEL,
        tools: functions,
      });

      const fullPrompt = context
        ? `Based on this context: ${context}\n\nUser's question: ${prompt}`
        : prompt;

      const chat = model.startChat();
      const result = await chat.sendMessage(fullPrompt);
      const response = result.response;

      const toolCalls = response.functionCalls();
      if (toolCalls && toolCalls.length > 0) {
        const toolCall = toolCalls[0];
        return {
          tool_call: {
            function: {
              name: toolCall.name,
              args: toolCall.args,
            },
          },
        };
      }

      return { text: response.text() || "No response from Gemini." };
    },
};


export { geminiAdapter };
