import { v } from "convex/values";
import { action, query } from "../_generated/server";
import { getProvider } from "./adapter";

export const generateEmbeddings = action({
  args: { texts: v.array(v.string()) },
  handler: async (ctx, { texts }) => {
    const aiProvider = getProvider();
    const embedding = await aiProvider.generateEmbeddings(texts);
    return embedding;
  },
});

export const getFunctions = query({
  handler: async (ctx) => {
    return [
      {
        functionDeclarations: [
          {
            name: "get_documents_summary",
            description: "Returns a summary of a documents in the context provided.",
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
    return `The documet "${title}" is a comprehensive guide to Convex, a full-stack development platform for building web applications with real-time data sync.`;
  },
});