import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { isAuthenticated, makePartial } from "../utils/utils";
import { chatbotSchema } from "../schemas";
import { authComponent } from "../auth";

// QUERIES
export const get = query({
  handler: async (ctx) => {
    await isAuthenticated(ctx);

    const items = await ctx.db.query("chatbot").collect();
    return items;
  },
});

export const getOne = query({
  args: { id: v.id("chatbot") },
  handler: async (ctx, { id }) => {
    await isAuthenticated(ctx);

    const item = await ctx.db.get(id);
    return item;
  },
});

// MUTATIONS
export const create = mutation({
  args: { item: v.object(chatbotSchema) },
  handler: async (ctx, { item }) => {
    await isAuthenticated(ctx);
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
