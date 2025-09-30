import { defineSchema, defineTable } from "convex/server";
import * as schemas from "./schemas";

export default defineSchema({
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
      filterFields: ["sessionId"],
      dimensions: 768,
    }
  ),
  groupChats: defineTable(schemas.groupChatSchema).index("by_sessionId", [
    "sessionId",
  ]),
  chatbot: defineTable(schemas.chatbotSchema).index("by_session_and_user", [
    "sessionId",
    "userId",
  ]),
  comments: defineTable(schemas.commentSchema).index("by_documentId", [
    "documentId",
  ]),
  invites: defineTable(schemas.inviteSchema)
    .index("by_sessionId", ["sessionId"])
    .index("unique_session_email", ["sessionId", "email"]),
  scrapedData: defineTable(schemas.scrapedDataSchema).index(
    "by_session_and_insight",
    ["sessionId", "insightId"]
  ),
  insights: defineTable(schemas.insightsSchema).index("by_sessionId", [
    "sessionId",
  ]),
  whiteboards: defineTable(schemas.whiteboardsSchema).index("by_sessionId", [
    "sessionId",
  ]),
  testSchema: defineTable(schemas.testSchema),
});
