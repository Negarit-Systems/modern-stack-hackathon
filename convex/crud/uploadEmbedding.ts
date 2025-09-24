import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { makePartial } from "../utils/utils";
import { uploadEmbeddingsSchema } from "../schemas";

// QUERIES
export const get = query({
  handler: async (ctx) => {
    const items = await ctx.db.query("uploadEmbeddings").collect();
    return items;
  },
});

export const getOne = query({
  args: { id: v.id("uploadEmbeddings") },
  handler: async (ctx, { id }) => {
    const item = await ctx.db.get(id);
    return item;
  },
});

// MUTATIONS
export const create = mutation({
  args: { item: v.object(uploadEmbeddingsSchema) },
  handler: async (ctx, { item }) => {
    const newItem = { ...item, createdAt: Date.now() };
    const id = await ctx.db.insert("uploadEmbeddings", newItem);
    return id;
  },
});

export const bulkCreate = mutation({
  args: {
    items: v.array(v.object(uploadEmbeddingsSchema)),
  },
  handler: async (ctx, { items }) => {
    const ids: string[] = [];

    for (const item of items) {
      const newItem = { ...item, createdAt: Date.now() };
      const id = await ctx.db.insert("uploadEmbeddings", newItem);
      ids.push(id);
    }

    return ids;
  },
});

export const update = mutation({
  args: {
    id: v.id("uploadEmbeddings"),
    updates: v.object(makePartial(uploadEmbeddingsSchema)),
  },
  handler: async (ctx, { id, updates }) => {
    await ctx.db.patch(id, updates);
  },
});

export const deleteOne = mutation({
  args: { id: v.id("uploadEmbeddings") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
