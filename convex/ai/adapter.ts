import { geminiAdapter } from "./geminiAdapter";
import { gptAdapter } from "./gptAdapter";

export interface AiProvider {
  generateText: (prompt: string, context?: string) => Promise<string>;
  generateEmbeddings: (texts: string[]) => Promise<number[][]>;
  callFunction: (prompt: string, functions: any[]) => Promise<any>;
}

// Configuration to select the active provider
const activeProvider: string = "gemini"; // Or "gpt"

export const getProvider = (): AiProvider => {
  switch (activeProvider) {
    case "gemini":
      return geminiAdapter;
    case "gpt":
      return gptAdapter;
    default:
      throw new Error("Invalid AI provider selected.");
  }
};
