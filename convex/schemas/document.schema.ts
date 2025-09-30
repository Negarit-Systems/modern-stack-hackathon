import { v } from "convex/values";

export const documentSchema = {
  sessionId: v.id("sessions"),
  title: v.string(),
  content: v.string(),
  commentIds: v.optional(v.array(v.id("comments"))),
  order: v.number(),
  updatedAt: v.optional(v.number()),
  deletedAt: v.optional(v.number()),
};
