import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { makePartial } from "../utils/utils";
import { commentSchema } from "../schemas";

// QUERIES
export const get = query({
  handler: async (ctx) => {
    const items = await ctx.db.query("comments").collect();
    return items;
  },
});

export const getByDocumentId = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, { documentId }) => {
    const item = await ctx.db
      .query("comments")
      .withIndex("by_documentId", (q) => q.eq("documentId", documentId))
      .order("asc")
      .collect();
    return item;
  },
});

export const getOne = query({
  args: { id: v.id("comments") },
  handler: async (ctx, { id }) => {
    const item = await ctx.db.get(id);
    return item;
  },
});

// MUTATIONS
export const create = mutation({
  args: { item: v.object(commentSchema) },
  handler: async (ctx, { item }) => {
    const id = await ctx.db.insert("comments", item);
    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("comments"),
    updates: v.object(makePartial(commentSchema)),
  },
  handler: async (ctx, { id, updates }) => {
    await ctx.db.patch(id, updates);
  },
});

export const deleteOne = mutation({
  args: { id: v.id("comments") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
