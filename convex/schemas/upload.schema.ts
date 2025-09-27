import { v } from "convex/values";

export const uploadSchema = {
  sessionId: v.id("sessions"),
  fileName: v.string(),
  fileType: v.string(),
  storageId: v.id("_storage"),
  uploadedBy: v.optional(v.string()),
  url: v.optional(v.string()),
  summary: v.optional(v.string()),
  updatedAt: v.optional(v.number()),
  deletedAt: v.optional(v.number()),
};
