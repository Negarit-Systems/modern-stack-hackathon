import { v } from "convex/values";

export const insightsSchema = {
  sessionId: v.id("sessions"),
  topic: v.string(),
  urls: v.array(v.string()),
  uploadIds: v.array(v.id("uploads")),
  status: v.union(v.literal("active"), v.literal("archived")),
  updatedAt: v.optional(v.number()),
  deletedAt: v.optional(v.number()),
};
