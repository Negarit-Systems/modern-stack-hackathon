import { v } from "convex/values";

export const commentSchema = {
  documentId: v.id("documents"),
  userId: v.string(),
  parentId: v.optional(v.id("comments")),
  content: v.string(),
  resolved: v.boolean(),
  assignedTo: v.optional(v.string()),
  updatedAt: v.optional(v.number()),
  deletedAt: v.optional(v.number()),
  position: v.optional(v.object({
    y: v.number()
  }))
};