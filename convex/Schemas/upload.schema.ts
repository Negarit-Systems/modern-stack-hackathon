import { v } from "convex/values";

export const uploadSchema = {
  sessionId: v.id("sessions"),
  fileName: v.string(),
  fileType: v.string(),
  storageId: v.string(),
  summary: v.optional(v.string()),
  uploadedBy: v.id("users"),
  createdAt: v.number(),
  updatedAt: v.optional(v.number()),
  deletedAt: v.optional(v.number()),
};
