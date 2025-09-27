import { v } from "convex/values";

export const documentSchema = {
  sessionId: v.id("sessions"),
  content: v.string(),
  commentIds: v.optional(v.array(v.id("comments"))),
  updatedAt: v.optional(v.number()),
  deletedAt: v.optional(v.number()),
};
