import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { makePartial } from "../utils/utils";
import { sessionSchema } from "../schemas";

// QUERIES
export const get = query({
  handler: async (ctx) => {
    const items = await ctx.db.query("sessions").collect();
    return items;
  },
});

export const getOne = query({
  args: { id: v.id("sessions") },
  handler: async (ctx, { id }) => {
    const item = await ctx.db.get(id);
    return item;
  },
});

export const getCollaborators = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, { sessionId }) => {
    const session = await ctx.db.get(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    return session.collaboratorIds;
  }
});

// MUTATIONS
export const create = mutation({
  args: { item: v.object(sessionSchema) },
  handler: async (ctx, { item }) => {
    const id = await ctx.db.insert("sessions", item);
    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("sessions"),
    updates: v.object(makePartial(sessionSchema)),
  },
  handler: async (ctx, { id, updates }) => {
    await ctx.db.patch(id, updates);
  },
});

export const deleteOne = mutation({
  args: { id: v.id("sessions") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
