import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { makePartial } from "../utils/utils";
import { notificationSchema } from "../schemas";
import { api } from "../_generated/api";
import { Id } from "../_generated/dataModel";

const commentSchema = {
  content: v.string(),
  parentId: v.optional(v.id("comments")),
  userId: v.string(),
  assignedTo: v.optional(v.array(v.string())),
};

// QUERIES
export const get = query({
  handler: async (ctx) => {
    const items = await ctx.db.query("notifications").collect();
    return items;
  },
});

export const getBySessionAndUser = query({
  args: { sessionId: v.id("sessions"), userId: v.string() },
  handler: async (ctx, { sessionId, userId }) => {
    const items = await ctx.db
      .query("notifications")
      .withIndex("by_session_and_user", (q: any) =>
        q.eq("sessionId", sessionId).eq("userId", userId)
      )
      .collect();
    return items;
  },
});

export const getOne = query({
  args: { id: v.id("notifications") },
  handler: async (ctx, { id }) => {
    const item = await ctx.db.get(id);
    return item;
  },
});

// MUTATIONS
export const commentNotificationCreate = mutation({
  args: { sessionId: v.id("sessions"), comment: v.object(commentSchema) },
  handler: async (ctx, { sessionId, comment }) => {
    const fromUser = await ctx.runQuery(api.crud.users.getUserById, { id: comment.userId });
    const message = `${fromUser.users?.name || "Someone"} mentioned you in a comment`;
    if (comment.assignedTo) {
      for (const userId of comment.assignedTo) {
        await ctx.db.insert("notifications", {
          sessionId: sessionId,
          userId,
          fromUserId: comment.userId,
          message,
          type: "comment",
          details: comment.content,
          read: false
        });
      }
    }
  },
});

export const replyNotificationCreate = mutation({
  args: { sessionId: v.id("sessions"), comment: v.object(commentSchema) },
  handler: async (ctx, { sessionId, comment }) => {
    const fromUser = await ctx.runQuery(api.crud.users.getUserById, { id: comment.userId });
    const yourComment = await ctx.db.get(comment.parentId as Id<"comments">);
    const message = `${fromUser.users?.name || "Someone"} replied to your comment`;
    await ctx.db.insert("notifications", {
      sessionId: sessionId,
      userId: yourComment?.userId || "",
      fromUserId: comment.userId,
      message,
      type: "reply",
      details: comment.content,
      read: false
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("notifications"),
    updates: v.object(makePartial(notificationSchema)),
  },
  handler: async (ctx, { id, updates }) => {
    await ctx.db.patch(id, updates);
  },
});

export const deleteOne = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
