import { v } from "convex/values";

export const userSchema = {
  firstName: v.string(),
  lastName: v.string(),
  email: v.string(),
  password: v.string(),
  createdAt: v.number(),
  updatedAt: v.optional(v.number()),
  deletedAt: v.optional(v.number()),
};
