import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const userSchema = {
  firstName: v.string(),
  lastName: v.string(),
  email: v.string(),
  password: v.string(),
  createdAt: v.number(),
};

export default defineSchema({
  users: defineTable(userSchema),
});
