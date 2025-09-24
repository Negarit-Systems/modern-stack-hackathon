import { v } from "convex/values";

export const inviteSchema = {
  sessionId: v.id("sessions"),
  email: v.string(),
  role: v.union(v.literal("editor"), v.literal("viewer")),
  status: v.union(
    v.literal("PENDING"),
    v.literal("ACCEPTED"),
    v.literal("CANCELLED"),
    v.literal("EXPIRED")
  ),
  invitedBy: v.id("users"),
  createdAt: v.number(),
  updatedAt: v.optional(v.number()),
  deletedAt: v.optional(v.number()),
};
