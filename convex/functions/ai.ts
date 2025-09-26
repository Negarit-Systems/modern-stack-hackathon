import { v } from "convex/values";
import { action } from "../_generated/server";
import { getProvider } from "../ai/adapter";
import { api } from "../_generated/api";
import { authenticatedUser } from "../utils/utils";

export const handleUserQuery = action({
  args: {
    sessionId: v.id("sessions"),
    prompt: v.string(),
  },
  handler: async (ctx, { sessionId, prompt }): Promise<void> => {
    const userId = await authenticatedUser(ctx);
    const aiProvider = getProvider();

    const userEmbedding = await aiProvider.generateEmbeddings([prompt]);

    const searchResults = await ctx.vectorSearch(
      "uploadEmbeddings",
      "by_embedding",
      {
        vector: userEmbedding[0],
        filter: (q) => q.eq("sessionId", sessionId),
        limit: 5
      }
    );
    console.log("Search results:", searchResults);

    const contextDocs = await Promise.all(
      searchResults.map(async (result) => {
        const doc = await ctx.runQuery(api.crud.uploadEmbedding.getOne, {
          id: result._id,
        });
        return doc?.content ?? "";
      })
    );
    const context = contextDocs.join("\n\n");

    const augmentedPrompt = `Based on the following context, answer the user's question:\n\nContext:\n${context}\n\nQuestion:\n${prompt}`;
    const functions = await ctx.runQuery(api.ai.ai.getFunctions);
    console.log("Available functions:", functions);

    const aiResponse = await aiProvider.callFunction(
      augmentedPrompt,
      functions,
      context
    );

    let finalResponse: string;

    if (aiResponse.tool_call || aiResponse.choices?.[0]?.message?.tool_calls) {
      console.log("AI requested a function call.");
      const call =
        aiResponse.tool_call ||
        aiResponse.choices[0].message.tool_calls[0].function;
      const functionName = call.name;
      const args = call.arguments;

      console.log("Selected Function: ", functionName)
      console.log("Function Args: ", args)

      // Execute the function
      if (functionName === "get_document_summary") {
        const result = await ctx.runAction(api.ai.ai.getSummary, {
          title: args.topic,
        });

        const finalAiResponse = await aiProvider.generateText(
          `The result of the function call was: ${result}. Now, generate a user-friendly response.`
        );
        finalResponse = finalAiResponse;
      } else {
        // fallback to normal response
        finalResponse = await aiProvider.generateText(augmentedPrompt);
      }
    } else {
      finalResponse = await aiProvider.generateText(augmentedPrompt);
    }

    // Save the AI's response to the database
    await ctx.runMutation(api.crud.chatbot.create, {
      item: {
        sessionId,
        userId,
        prompt,
        response: finalResponse,
      },
    });
  },
});
