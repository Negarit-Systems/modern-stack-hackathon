import { v } from "convex/values";
import { action, query } from "../_generated/server";
import { getProvider } from "./adapter";

export const generateEmbedding = action({
  args: { text: v.string() },
  handler: async (ctx, { text }) => {
    const aiProvider = getProvider();
    const embedding = await aiProvider.generateEmbedding(text);
    return embedding;
  },
});

export const getFunctions = query({
  handler: async (ctx) => {
    return [
      {
        functionDeclarations: [
          {
            name: "get_document_summary",
            description: "Returns a summary of a document based on its title.",
            parameters: {
              type: "OBJECT",
              properties: {
                document_title: { type: "STRING" },
              },
              required: ["document_title"],
            },
          },
        ],
      },
    ];
  },
});

export const getSummary = action({
  args: { title: v.string() },
  handler: async (ctx, { title }) => {
    // In a real application, you would perform a database query here
    // to find and retrieve the summary of the document.
    // For this example, we'll return a placeholder string.
    return `The document "${title}" is a comprehensive guide to Convex, a full-stack development platform for building web applications with real-time data sync.`;
  },
});
