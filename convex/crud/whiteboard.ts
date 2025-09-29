// In convex/crud/whiteboard.ts
import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { whiteboardsSchema } from "../schemas";

export const get = query({
  args: { id: v.optional(v.id("whiteboards")) },
  handler: async (ctx, { id }) => {
    if (!id) return null;
    return await ctx.db.get(id);
  },
});

export const create = mutation({
  args: { sessionId: v.id("sessions"), title: v.optional(v.string()) },
  handler: async (ctx, { sessionId, title = "Untitled Whiteboard" }) => {
    // Get the highest order number
    const whiteboards = await ctx.db
      .query("whiteboards")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", sessionId))
      .collect();

    const highestOrder = whiteboards.reduce((max, wb) => Math.max(max, wb.order), -1);

    return await ctx.db.insert("whiteboards", {
      sessionId,
      title,
      elements: [],
      updatedAt: Date.now(),
      order: highestOrder + 1,
    });
  },
});

export const getBySession = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, { sessionId }) => {
    return await ctx.db
      .query("whiteboards")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", sessionId))
      .order("asc")
      .collect();
  },
});

export const update = mutation({
  args: {
    id: v.id("whiteboards"),
    updates: v.object({
      elements: v.array(v.any()),
      updatedAt: v.number(),
    }),
  },
  handler: async (ctx, { id, updates }) => {
    await ctx.db.patch(id, updates);
  },
});