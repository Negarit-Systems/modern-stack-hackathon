import { v } from "convex/values";

export const testSchema = {
  title: v.string(),
  description: v.string(),
  author: v.string(),
  updatedAt: v.optional(v.number()),
  deletedAt: v.optional(v.number()),
};
