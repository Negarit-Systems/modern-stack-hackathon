import { v } from "convex/values";

export const uploadEmbeddingsSchema = {
  uploadId: v.id("uploads"),
  content: v.string(),
  embedding: v.array(v.float64()),
  createdAt: v.optional(v.number()),
  updatedAt: v.optional(v.number()),
  deletedAt: v.optional(v.number()),
};
