import { defineSchema, defineTable } from "convex/server";
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

export const sessionSchema = {
  title: v.string(),
  creatorId: v.id("users"),
  status: v.union(v.literal("active"), v.literal("archived")),
  collaboratorIds: v.array(v.id("users")),
  createdAt: v.number(),
  updatedAt: v.optional(v.number()),
  deletedAt: v.optional(v.number()),
};

export const documentSchema = {
  sessionId: v.id("sessions"),
  content: v.string(),
  version: v.number(),
  editorIds: v.array(v.id("users")),
  commentIds: v.array(v.id("comments")),
  createdAt: v.number(),
  updatedAt: v.optional(v.number()),
  deletedAt: v.optional(v.number()),
};

export const uploadSchema = {
  sessionId: v.id("sessions"),
  fileName: v.string(),
  fileType: v.string(),
  storageId: v.string(),
  summary: v.optional(v.string()),
  uploadedBy: v.id("users"),
  createdAt: v.number(),
  updatedAt: v.optional(v.number()),
  deletedAt: v.optional(v.number()),
};

export const groupChatSchema = {
  sessionId: v.id("sessions"),
  messages: v.array(
    v.object({
      userId: v.id("users"),
      content: v.string(),
      mentions: v.array(v.id("users")),
      createdAt: v.number(),
    })
  ),
  createdAt: v.number(),
  updatedAt: v.optional(v.number()),
  deletedAt: v.optional(v.number()),
};

export const chatbotQuerySchema = {
  sessionId: v.id("sessions"),
  userId: v.id("users"),
  query: v.string(),
  response: v.string(),
  context: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.optional(v.number()),
  deletedAt: v.optional(v.number()),
};

export const commentSchema = {
  sessionId: v.id("sessions"),
  userId: v.id("users"),
  content: v.string(),
  parentId: v.optional(v.id("comments")),
  resolved: v.boolean(),
  assignedTo: v.optional(v.id("users")),
  createdAt: v.number(),
  updatedAt: v.optional(v.number()),
  deletedAt: v.optional(v.number()),
};

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

export const scrappedDataSchema = {
  sessionId: v.id("sessions"),
  title: v.string(),
  urls: v.array(v.string()),
  content: v.string(),
  createdAt: v.number(),
  updatedAt: v.optional(v.number()),
  deletedAt: v.optional(v.number()),
};

export default defineSchema({
  users: defineTable(userSchema).index("by_email", ["email"]),
  sessions: defineTable(sessionSchema),
  documents: defineTable(documentSchema).index("by_sessionId", ["sessionId"]),
  uploads: defineTable(uploadSchema).index("by_sessionId", ["sessionId"]),
  groupChats: defineTable(groupChatSchema).index("by_sessionId", ["sessionId"]),
  chatbotQueries: defineTable(chatbotQuerySchema).index("by_sessionId", [
    "sessionId",
  ]),
  comments: defineTable(commentSchema).index("by_sessionId", ["sessionId"]),
  invites: defineTable(inviteSchema).index("by_sessionId", ["sessionId"]),
  scrappedData: defineTable(scrappedDataSchema).index("by_sessionId", [
    "sessionId",
  ]),
});
