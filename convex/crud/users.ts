import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { userSchema } from "../schemas";
import { makePartial } from "../utils/utils";

// QUERIES
export const get = query({
  handler: async (ctx) => {
    const items = await ctx.db.query("users").collect();
    return items;
  },
});

export const getOne = query({
  args: { id: v.id("users") },
  handler: async (ctx, { id }) => {
    const item = await ctx.db.get(id);
    return item;
  },
});

// MUTATIONS
export const create = mutation({
  args: { item: v.object(userSchema) },
  handler: async (ctx, { item }) => {
    const id = await ctx.db.insert("users", item);
    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("users"),
    updates: v.object(makePartial(userSchema)),
  },
  handler: async (ctx, { id, updates }) => {
    await ctx.db.patch(id, updates);
  },
});

export const deleteOne = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
