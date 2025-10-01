import { v } from "convex/values";
import { action } from "../_generated/server";
import { getProvider } from "../ai/adapter";
import { api } from "../_generated/api";
import { authenticatedUser } from "../utils/utils";

export const getContextBasedResponse = action({
  args: {
    sessionId: v.id("sessions"),
    prompt: v.string(),
  },
  handler: async (ctx, { sessionId, prompt }): Promise<string | string[]> => {
    const aiProvider = getProvider();
    let finalResponse: any;

    // Generate embedding for the prompt to find relevant context
    const userEmbedding = await aiProvider.generateEmbeddings([prompt]);
    const searchResults = await ctx.vectorSearch(
      "uploadEmbeddings",
      "by_embedding",
      {
        vector: userEmbedding[0],
        filter: (q) => q.eq("sessionId", sessionId),
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

    // Get available functions
    const functions = await ctx.runQuery(api.ai.ai.getFunctions);

    // Call the AI provider with the prompt and functions
    const response = await aiProvider.callFunction(prompt, functions);

    // Check if the response contains a function call
    if (response.tool_call) {
      const { name, args } = response.tool_call.function;

      if (name === "generate_research_urls") {
        const { topic, max_urls } = args;
        finalResponse = await ctx.runAction(api.ai.ai.generateResearchUrls, {
          topic,
          max_urls,
        });
      } else if (name === "get_documents_summary") {
        const { document_title } = args;
        finalResponse = await ctx.runAction(api.ai.ai.getSummary, {
          title: document_title,
        });
      } else {
        throw new Error(`Unknown function: ${name}`);
      }
    } else {
      finalResponse = await aiProvider.generateText(prompt, documentContext);
    }

    return finalResponse;
  },
});

export const handleUserQuery = action({
  args: {
    sessionId: v.id("sessions"),
    prompt: v.string(),
  },
  handler: async (ctx, { sessionId, prompt }): Promise<void> => {
    const userId = await authenticatedUser(ctx);
    let response = await ctx.runAction(
      api.functions.ai.getContextBasedResponse,
      {
        sessionId,
        prompt,
      }
    );

    if (Array.isArray(response)) {
      response = response.join("\n");
    }

    await ctx.runMutation(api.crud.chatbot.create, {
      item: {
        sessionId,
        userId,
        prompt,
        response: response,
      },
    });
  },
});


export const handleUserQueryOnChat = action({
  args: {
    sessionId: v.id("sessions"),
    prompt: v.string(),
  },
  handler: async (ctx, { sessionId, prompt }): Promise<void> => {
    let response = await ctx.runAction(
      api.functions.ai.getContextBasedResponse,
      {
        sessionId,
        prompt,
      }
    );

    if (Array.isArray(response)) {
      response = response.join("\n");
    }

    await ctx.runMutation(api.crud.groupChat.create, {
      item: {
        sessionId,
        senderId: "BOT",
        senderName: "🤖AI_Bot",
        content: response,
      },
    });
  },
});