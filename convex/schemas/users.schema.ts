import { v } from "convex/values";

export const userSchema = v.object({
  email: v.string(),
  // Add other fields as needed, keeping it minimal based on inviteemail usage
  name: v.optional(v.string()), // Optional name field for potential future use
  createdAt: v.number(), // Timestamp for when the user was created
});
