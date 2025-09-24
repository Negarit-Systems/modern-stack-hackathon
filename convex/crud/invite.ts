import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { makePartial } from "../utils/utils";
import { inviteSchema } from "../Schemas";

// QUERIES
export const get = query({
  handler: async (ctx) => {
    const items = await ctx.db.query("invites").collect();
    return items;
  },
});

export const getOne = query({
  args: { id: v.id("invites") },
  handler: async (ctx, { id }) => {
    const item = await ctx.db.get(id);
    return item;
  },
});

// MUTATIONS
export const create = mutation({
  args: { item: v.object(inviteSchema) },
  handler: async (ctx, { item }) => {
    const id = await ctx.db.insert("invites", item);
    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("invites"),
    updates: v.object(makePartial(inviteSchema)),
  },
  handler: async (ctx, { id, updates }) => {
    await ctx.db.patch(id, updates);
  },
});

export const deleteOne = mutation({
  args: { id: v.id("invites") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
