import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { authenticatedUser, makePartial } from "../utils/utils";
import { uploadSchema } from "../schemas";

// QUERIES
export const get = query({
  handler: async (ctx) => {
    const items = await ctx.db.query("uploads").collect();
    return items;
  },
});

export const getBySession = query({
  args: { sessionId: v.string() },
  handler: async (ctx, { sessionId }) => {
    const items = await ctx.db
      .query("uploads")
      .filter((q) => q.eq(q.field("sessionId"), sessionId))
      .collect();
    return items;
  },
});

export const getOne = query({
  args: { id: v.id("uploads") },
  handler: async (ctx, { id }) => {
    const item = await ctx.db.get(id);
    return item;
  },
});

// MUTATIONS
export const create = mutation({
  args: { item: v.object(uploadSchema) },
  handler: async (ctx, { item }) => {
    const url = (await ctx.storage.getUrl(item.storageId)) ?? undefined;
    const uploadedBy = await authenticatedUser(ctx);
    const newItem = {
      ...item,
      url,
      uploadedBy,
      createdAt: Date.now(),
    };
    return await ctx.db.insert("uploads", newItem);
  },
});

export const update = mutation({
  args: {
    id: v.id("uploads"),
    updates: v.object(makePartial(uploadSchema)),
  },
  handler: async (ctx, { id, updates }) => {
    await ctx.db.patch(id, updates);
  },
});

export const deleteOne = mutation({
  args: { id: v.id("uploads") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});