import { v } from "convex/values";
import { action } from "../_generated/server";
import { api } from "../_generated/api";

export const processFile = action({
  args: {
    sessionId: v.id("sessions"),
    fileName: v.string(),
    storageId: v.id("_storage"),
    fileContent: v.string(),
    uploadedBy: v.id("users"),
    fileType: v.string(),
  },
  handler: async (ctx, { fileContent, ...data }) => {
    const uploadId = await ctx.runMutation(api.crud.upload.create, {
      item: data,
    });

    const chunks = fileContent.match(/.{1,500}/g) || [];

    const embeddings = await ctx.runAction(api.ai.ai.generateEmbeddings, {
      texts: chunks,
    });

    const uploadChunks = chunks.map((chunk, idx) => ({
      uploadId,
      sessionId: data.sessionId,
      content: chunk,
      embedding: embeddings[idx],
    }));

    await ctx.runMutation(api.crud.uploadEmbedding.bulkCreate, {
      items: uploadChunks,
    });
  },
});
