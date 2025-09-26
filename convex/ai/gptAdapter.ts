import { AiProvider } from "./adapter";
import OpenAI from "openai";

// Set a default GPT model and embedding model
const GPT_MODEL = "gpt-4o-mini";
const GPT_EMBEDDING_MODEL = "text-embedding-3-small";

const gptAdapter: AiProvider = {
  generateText: async (prompt: string, context?: string): Promise<string> => {
    console.log("GPT API: Generating text...");
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY not found in environment variables");
    }

    const client = new OpenAI({ apiKey });

    const fullPrompt = context
      ? `Based on this context: ${context}\n\nUser's question: ${prompt}`
      : prompt;

    const response = await client.chat.completions.create({
      model: GPT_MODEL,
      messages: [{ role: "user", content: fullPrompt }],
    });

    return response.choices[0].message?.content || "No response from GPT.";
  },

  generateEmbeddings: async (texts: string[]): Promise<number[][]> => {
    console.log("GPT API: Generating embedding...");
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY not found in environment variables");
    }

    const client = new OpenAI({ apiKey });

    const response = await client.embeddings.create({
      model: GPT_EMBEDDING_MODEL,
      input: texts,
    });

    return response.data.map((item: any) => item.embedding);
  },

  callFunction: async (prompt: string, functions: any[]): Promise<any> => {
    console.log("GPT API: Calling function...");
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY not found in environment variables");
    }

    const client = new OpenAI({ apiKey });

    const response = await client.chat.completions.create({
      model: GPT_MODEL,
      messages: [{ role: "user", content: prompt }],
      tools: functions,
      tool_choice: "auto",
    });

    return response;
  },
};

export { gptAdapter };
