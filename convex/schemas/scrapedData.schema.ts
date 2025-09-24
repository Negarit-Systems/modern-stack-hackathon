import { v } from "convex/values";

export const scrapedDataSchema = {
  sessionId: v.id("sessions"),
  title: v.string(),
  urls: v.array(v.string()),
  content: v.string(),
  createdAt: v.number(),
  updatedAt: v.optional(v.number()),
  deletedAt: v.optional(v.number()),
};
