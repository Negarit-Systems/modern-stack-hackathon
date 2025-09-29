import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { makePartial } from "../utils/utils";
import { documentSchema } from "../schemas";

// QUERIES
export const get = query({
  handler: async (ctx) => {
    const items = await ctx.db.query("documents").collect();
    return items;
  },
});

export const getBySession = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, { sessionId }) => {
    const item = await ctx.db
      .query("documents")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", sessionId))
      .order("asc")
      .collect();
    return item;
  },
});

export const getOne = query({
  args: { id: v.id("documents") },
  handler: async (ctx, { id }) => {
    const item = await ctx.db.get(id);
    return item;
  },
});

// MUTATIONS
export const create = mutation({
  args: { sessionId: v.id("sessions"), title: v.optional(v.string()) },
  handler: async (ctx, { sessionId, title = "Untitled Document" }) => {
    // Get the highest order number
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", sessionId))
      .collect();

    const highestOrder = documents.reduce((max, doc) => Math.max(max, doc.order), -1);

    return await ctx.db.insert("documents", {
      sessionId,
      title,
      content: "",
      updatedAt: Date.now(),
      order: highestOrder + 1,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("documents"),
    updates: v.object(makePartial(documentSchema)),
  },
  handler: async (ctx, { id, updates }) => {
    await ctx.db.patch(id, updates);
  },
});

export const deleteOne = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
