import { v } from "convex/values";

export const documentSchema = {
  sessionId: v.id("sessions"),
  content: v.string(),
  version: v.number(),
  editorIds: v.array(v.string()),
  commentIds: v.array(v.id("comments")),
  createdAt: v.number(),
  updatedAt: v.optional(v.number()),
  deletedAt: v.optional(v.number()),
};
