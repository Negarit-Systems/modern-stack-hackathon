import { v } from "convex/values";

export const groupChatSchema = {
  sessionId: v.id("sessions"),
  messages: v.array(
    v.object({
      userId: v.id("users"),
      content: v.string(),
      mentions: v.array(v.id("users")),
      createdAt: v.number(),
    })
  ),
  createdAt: v.number(),
  updatedAt: v.optional(v.number()),
  deletedAt: v.optional(v.number()),
};
