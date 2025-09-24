import { v } from "convex/values";
import { action } from "../_generated/server";
import { getProvider } from "../ai/adapter";
import { api } from "../_generated/api";

export const handleUserQuery = action({
  args: {
    sessionId: v.id("sessions"),
    userId: v.id("users"),
    prompt: v.string(),
  },
  handler: async (ctx, { sessionId, userId, prompt }) => {
    const aiProvider = getProvider();

    const userEmbedding = await aiProvider.generateEmbedding(prompt);

    const searchResults = await ctx.vectorSearch(
      "uploadEmbeddings",
      "by_embedding",
      {
        vector: userEmbedding,
        limit: 5,
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
      functions
    );

    let finalResponse: string;

    if (aiResponse.tool_call || aiResponse.choices?.[0]?.message?.tool_calls) {
      console.log("AI requested a function call.");
      const call =
        aiResponse.tool_call ||
        aiResponse.choices[0].message.tool_calls[0].function;
      const functionName = call.name;
      const args = call.arguments;

      // Execute the function
      if (functionName === "get_document_summary") {
        const result = await ctx.runAction(api.ai.ai.getSummary, {
          title: args.document_title,
        });

        const finalAiResponse = await aiProvider.generateText(
          `The result of the function call was: ${result}. Now, generate a user-friendly response.`
        );
        finalResponse = finalAiResponse;
      } else {
        finalResponse = "Error: Unknown function requested.";
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
