import { defineSchema, defineTable } from "convex/server";
import * as schemas from "./Schemas";

export default defineSchema({
  users: defineTable(schemas.userSchema).index("by_email", ["email"]),
  sessions: defineTable(schemas.sessionSchema),
  documents: defineTable(schemas.documentSchema).index("by_sessionId", [
    "sessionId",
  ]),
  uploads: defineTable(schemas.uploadSchema).index("by_sessionId", [
    "sessionId",
  ]),
  groupChats: defineTable(schemas.groupChatSchema).index("by_sessionId", [
    "sessionId",
  ]),
  chatbotQueries: defineTable(schemas.chatbotQuerySchema).index(
    "by_sessionId",
    ["sessionId"]
  ),
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
