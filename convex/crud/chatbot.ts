import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { authenticatedUser, makePartial } from "../utils/utils";
import { chatbotSchema } from "../schemas";

// QUERIES
export const get = query({
  args: {
    sessionId: v.optional(v.id("sessions")),
  },
  handler: async (ctx, { sessionId }) => {
    const userId = await authenticatedUser(ctx);
    const items = await ctx.db
      .query("chatbot")
      .withIndex("by_session_and_user", (q: any) =>
        q.eq("sessionId", sessionId).eq("userId", userId)
      )
      .collect();

    return items;
  },
});

export const getOne = query({
  args: { id: v.id("chatbot") },
  handler: async (ctx, { id }) => {
    const item = await ctx.db.get(id);
    return item;
  },
});

// MUTATIONS
export const create = mutation({
  args: { item: v.object(chatbotSchema) },
  handler: async (ctx, { item }) => {
    const id = await ctx.db.insert("chatbot", item);
    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("chatbot"),
    updates: v.object(makePartial(chatbotSchema)),
  },
  handler: async (ctx, { id, updates }) => {
    await ctx.db.patch(id, updates);
  },
});

export const deleteOne = mutation({
  args: { id: v.id("chatbot") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
