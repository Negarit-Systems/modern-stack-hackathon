import { v } from "convex/values";

export const notificationSchema = {
  userId: v.string(),
  fromUserId: v.optional(v.string()),
  sessionId: v.id("sessions"),
  type: v.string(),
  message: v.string(),
  details: v.optional(v.string()),
  read: v.boolean(),
};