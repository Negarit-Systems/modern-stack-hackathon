import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { authenticatedUser, makePartial } from "../utils/utils";
import { sessionSchema } from "../schemas";
import { api } from "../_generated/api";

// QUERIES
export const get = query({
  args: { take: v.optional(v.number()) },
  handler: async (ctx, { take }) => {
    try {
      const userId = await authenticatedUser(ctx);
      const all = await ctx.db.query("sessions").collect();
      const filtered = all.filter((s) => s.collaboratorIds?.includes(userId));
      return filtered.slice(0, take ?? 20);
    } catch (error) {
      // Return empty array for unauthenticated users
      return [];
    }
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
  },
});

// MUTATIONS
export const create = mutation({
  args: { item: v.object(sessionSchema) },
  handler: async (ctx, { item }) => {
    const id = await ctx.db.insert("sessions", item);
    // Create default document
    await ctx.db.insert("documents", {
      sessionId: id,
      title: "Main Document",
      content: "",
      updatedAt: Date.now(),
      order: 0,
    });

    // Create default whiteboard
    await ctx.db.insert("whiteboards", {
      sessionId: id,
      title: "Main Whiteboard",
      elements: [],
      updatedAt: Date.now(),
      order: 0,
    });
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

export const addCollaborator = mutation({
  args: {
    sessionId: v.id("sessions"),
    userId: v.string(),
  },
  handler: async (ctx, { sessionId, userId }) => {
    const session = await ctx.db.get(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    if (session.collaboratorIds.includes(userId)) {
      throw new Error("User is already a collaborator");
    }

    await ctx.db.patch(sessionId, {
      collaboratorIds: [...session.collaboratorIds, userId],
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
