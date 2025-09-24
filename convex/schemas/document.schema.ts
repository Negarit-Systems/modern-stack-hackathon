import { v } from "convex/values";

export const documentSchema = {
  sessionId: v.id("sessions"),
  title: v.string(),
  content: v.string(),
  lastModified: v.number(),
  commentIds: v.array(v.id("comments")),
  createdAt: v.optional(v.number()),
  updatedAt: v.optional(v.number()),
  deletedAt: v.optional(v.number()),
};
