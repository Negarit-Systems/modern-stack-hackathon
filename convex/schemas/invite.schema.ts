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
  invitedBy: v.string(),
  updatedAt: v.optional(v.number()),
  deletedAt: v.optional(v.number()),
  createdAt: v.number(),
};

// import { v } from "convex/values";

// export const inviteSchema = v.object({
//   sessionId: v.id("sessions"), // Use v.id for referencing sessions table
//   email: v.string(),
//   role: v.union(v.literal("editor"), v.literal("viewer")),
//   status: v.union(
//     v.literal("PENDING"),
//     v.literal("ACCEPTED"),
//     v.literal("CANCELLED")
//   ),
//   invitedBy: v.id("users"), // Use v.id for referencing users table
//   createdAt: v.number(),
//   updatedAt: v.optional(v.number()),
// });