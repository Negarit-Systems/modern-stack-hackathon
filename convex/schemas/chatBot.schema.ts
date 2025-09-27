import { v } from "convex/values";

export const chatbotSchema = {
  sessionId: v.id("sessions"),
  userId: v.string(),
  prompt: v.string(),
  response: v.string(),
  updatedAt: v.optional(v.number()),
  deletedAt: v.optional(v.number()),
};
