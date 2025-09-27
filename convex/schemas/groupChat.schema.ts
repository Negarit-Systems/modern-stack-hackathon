import { v } from "convex/values";

export const groupChatSchema = {
  sessionId: v.id("sessions"),
  messages: v.array(
    v.object({
      userId: v.string(),
      content: v.string(),
      mentions: v.array(v.string()),
    })
  ),
  updatedAt: v.optional(v.number()),
  deletedAt: v.optional(v.number()),
};
