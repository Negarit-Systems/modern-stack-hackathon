import { v } from "convex/values";

export const sessionSchema = {
  title: v.string(),
  creatorId: v.string(),
  status: v.union(v.literal("active"), v.literal("archived")),
  collaboratorIds: v.array(v.string()),
  updatedAt: v.optional(v.number()),
  deletedAt: v.optional(v.number()),
};
