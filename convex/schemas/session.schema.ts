import { v } from "convex/values";

export const sessionSchema = {
  title: v.string(),
  creatorId: v.id("users"),
  status: v.union(v.literal("active"), v.literal("archived")),
  grantedUserIds: v.array(v.id("users")),
  collaboratorIds: v.array(v.id("users")),
  createdAt: v.number(),
  updatedAt: v.optional(v.number()),
  deletedAt: v.optional(v.number()),
};
