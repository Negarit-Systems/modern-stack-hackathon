import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { makePartial } from "../utils/utils";
import { inviteSchema } from "../schemas";

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
    // More direct and efficient way to get a document by ID
    const item = await ctx.db.get(id);
    return item;
  },
});

export const getOneByEmail = query({
  args: { id: v.id("sessions"), email: v.string() },
  handler: async (ctx, { id, email }) => {
    const item = await ctx.db
      .query("invites")
      .filter((q) =>
        q.and(q.eq(q.field("sessionId"), id), q.eq(q.field("email"), email))
      )
      .first();
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

export const updateStatusToAccepted = mutation({
  args: {
    id: v.id("invites"),
  },
  handler: async (ctx, { id }) => {
    const invite = await ctx.db.get(id);
    if (!invite) {
      throw new Error("Invite not found");
    }

    await ctx.db.patch(id, {
      status: "ACCEPTED",
      updatedAt: Date.now(),
    });
  },
});

export const deleteOne = mutation({
  args: { id: v.id("invites") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
