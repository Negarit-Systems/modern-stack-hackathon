import { v } from "convex/values";

export const testSchema = {
  title: v.string(),
  description: v.string(),
  author: v.string(),
  createdAt: v.optional(v.number()),
  updatedAt: v.optional(v.number()),
  deletedAt: v.optional(v.number()),
};
