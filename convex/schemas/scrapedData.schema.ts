import { v } from "convex/values";

export const scrapedDataSchema = {
  sessionId: v.id("sessions"),
  title: v.string(),
  url: v.string(),
  content: v.string(),
  insightId: v.id("insights"),
  updatedAt: v.optional(v.number()),
  deletedAt: v.optional(v.number()),
};
