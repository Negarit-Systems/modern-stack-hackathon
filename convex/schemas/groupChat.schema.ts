import { v } from "convex/values";
import { send } from "process";

export const groupChatSchema = {
  sessionId: v.id("sessions"),
  senderId: v.string(),
  senderName: v.string(),
  content: v.string(),
};
