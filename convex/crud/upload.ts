import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { makePartial } from "../utils/utils";
import { uploadSchema } from "../schemas";

// QUERIES
export const get = query({
  handler: async (ctx) => {
    const items = await ctx.db.query("uploads").collect();
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
    const newItem = { ...item, createdAt: Date.now() };
    const id = await ctx.db.insert("uploads", newItem);
    return id;
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
