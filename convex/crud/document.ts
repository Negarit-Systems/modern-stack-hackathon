import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("documents").collect();
  },
});

export const create = mutation({
  args: {
    sessionId: v.id("sessions"),
    title: v.string(),
    content: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("documents", {
      sessionId: args.sessionId,
      title: args.title,
      content: args.content || "<p>Start writing your research...</p>",
      lastModified: Date.now(),
      commentIds: [],
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    documentId: v.id("documents"),
    updates: v.object({
      content: v.optional(v.string()),
      title: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.documentId, {
      ...args.updates,
      lastModified: Date.now(),
    });
  },
});
