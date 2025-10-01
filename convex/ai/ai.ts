import { v } from "convex/values";
import { action, query } from "../_generated/server";
import { getProvider } from "./adapter";
import { api } from "../_generated/api";

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
            description:
              "Returns a summary of a documents in the context provided.",
            parameters: {
              type: "OBJECT",
              properties: {
                document_title: { type: "STRING" },
              },
              required: ["document_title"],
            },
          },
          {
            name: "generate_research_urls",
            description:
              "Return URLs for web scraping based on a research topic and document context.",
            parameters: {
              type: "OBJECT",
              properties: {
                topic: {
                  type: "STRING",
                  description: "The research topic to generate URLs for",
                },
                max_urls: {
                  type: "NUMBER",
                  description:
                    "Maximum number of URLs to generate (default: 5)",
                },
              },
              required: ["topic"],
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
    return `The document "${title}" is a comprehensive guide to Convex, a full-stack development platform for building web applications with real-time data sync.`;
  },
});

export const generateResearchUrls = action({
  args: { topic: v.string(), max_urls: v.optional(v.number()) },
  handler: async (ctx, { topic, max_urls = 5 }) => {
    const aiProvider = getProvider();

    // Generate embedding for the topic to find relevant context
    const topicEmbedding = await aiProvider.generateEmbeddings([topic]);
    const searchResults = await ctx.vectorSearch(
      "uploadEmbeddings",
      "by_embedding",
      {
        vector: topicEmbedding[0],
        limit: 5,
      }
    );

    const contextDocs = await Promise.all(
      searchResults.map(async (result) => {
        const doc = await ctx.runQuery(api.crud.uploadEmbedding.getOne, {
          id: result._id,
        });
        return doc?.content ?? "";
      })
    );
    const documentContext = contextDocs.join("\n\n");
    console.log("Document Context in generateResearchUrls:", documentContext);

    // Construct a prompt for URL generation
    const prompt = `Based on the research topic "${topic}" and the following document context: "${documentContext}", generate a list of up to ${max_urls} URLs that would be relevant for web scraping to gather more information on this topic. Return the URLs as a JSON array, e.g., ["https://example.com", "https://another.com"]. Ensure the response is valid JSON.`;

    // Call the AI provider to generate URLs
    const urlResponse = await aiProvider.generateText(prompt, documentContext);
    console.log("URL Response:", urlResponse);

    try {
      // Parse the response as JSON
      console.log(urlResponse);
      // Remove Markdown code block markers if present
      const cleanedResponse = urlResponse.replace(/```json|```/g, "").trim();
      const urls = JSON.parse(cleanedResponse);
      if (!Array.isArray(urls)) {
        throw new Error("Generated URLs must be an array");
      }
      return urls.slice(0, max_urls);
    } catch (error) {
      console.error("Error parsing URL response:", error);
      return [];
    }
  },
});
