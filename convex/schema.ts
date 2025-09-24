import { defineSchema, defineTable } from "convex/server";
import * as schemas from "./schemas";

export default defineSchema({
  users: defineTable(schemas.userSchema).index("by_email", ["email"]),
  sessions: defineTable(schemas.sessionSchema),
  documents: defineTable(schemas.documentSchema).index("by_sessionId", [
    "sessionId",
  ]),
  uploads: defineTable(schemas.uploadSchema).index("by_sessionId", [
    "sessionId",
  ]),
  uploadEmbeddings: defineTable(schemas.uploadEmbeddingsSchema).vectorIndex(
    "by_embedding",
    {
      vectorField: "embedding",
      dimensions: 768,
    }
  ),
  groupChats: defineTable(schemas.groupChatSchema).index("by_sessionId", [
    "sessionId",
  ]),
  chatbot: defineTable(schemas.chatbotSchema).index("by_sessionId", [
    "sessionId",
  ]),
  comments: defineTable(schemas.commentSchema).index("by_sessionId", [
    "sessionId",
  ]),
  invites: defineTable(schemas.inviteSchema).index("by_sessionId", [
    "sessionId",
  ]),
  scrapedData: defineTable(schemas.scrapedDataSchema).index("by_sessionId", [
    "sessionId",
  ]),
});
