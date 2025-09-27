import { v } from "convex/values";

export const commentSchema = {
  sessionId: v.id("sessions"),
  userId: v.string(),
  content: v.string(),
  parentId: v.optional(v.id("comments")),
  resolved: v.boolean(),
  assignedTo: v.optional(v.string()),
  updatedAt: v.optional(v.number()),
  deletedAt: v.optional(v.number()),
};
