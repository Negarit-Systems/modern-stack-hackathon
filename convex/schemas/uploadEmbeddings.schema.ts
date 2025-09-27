import { v } from "convex/values";

export const uploadEmbeddingsSchema = {
  uploadId: v.id("uploads"),
  sessionId: v.id("sessions"),
  content: v.string(),
  embedding: v.array(v.float64()),
  updatedAt: v.optional(v.number()),
  deletedAt: v.optional(v.number()),
};
