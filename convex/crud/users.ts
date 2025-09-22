import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { userSchema } from "../schema";
import { makePartial } from "../utils/utils";

// QUERIES
export const get = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users;
  },
});

export const getOne = query({
  args: { id: v.id("users") },
  handler: async (ctx, { id }) => {
    const task = await ctx.db.get(id);
    return task;
  },
});

// MUTATIONS
export const create = mutation({
  args: { user: v.object(userSchema) },
  handler: async (ctx, { user }) => {
    const userId = await ctx.db.insert("users", user);
    return userId;
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
