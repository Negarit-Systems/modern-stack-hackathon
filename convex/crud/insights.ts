import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { makePartial } from "../utils/utils";
import { insightsSchema } from "../schemas";

// QUERIES
export const get = query({
  handler: async (ctx) => {
    const items = await ctx.db.query("insights").collect();
    return items;
  },
});

export const getBySession = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, { sessionId }) => {
    const items = await ctx.db
      .query("insights")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", sessionId))
      .collect();
    return items;
  },
});

export const getOne = query({
  args: { id: v.id("insights") },
  handler: async (ctx, { id }) => {
    const item = await ctx.db.get(id);
    return item;
  },
});

// MUTATIONS
export const create = mutation({
  args: { item: v.object(insightsSchema) },
  handler: async (ctx, { item }) => {
    const id = await ctx.db.insert("insights", item);
    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("insights"),
    updates: v.object(makePartial(insightsSchema)),
  },
  handler: async (ctx, { id, updates }) => {
    await ctx.db.patch(id, updates);
  },
});

export const deleteOne = mutation({
  args: { id: v.id("insights") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
