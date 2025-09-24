import { v } from "convex/values";

export const chatbotQuerySchema = {
  sessionId: v.id("sessions"),
  userId: v.id("users"),
  query: v.string(),
  response: v.string(),
  context: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.optional(v.number()),
  deletedAt: v.optional(v.number()),
};
