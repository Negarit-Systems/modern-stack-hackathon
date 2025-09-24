import { v } from "convex/values";
import { action } from "../_generated/server";
import { api } from "../_generated/api";

export const processFile = action({
  args: {
    sessionId: v.id("sessions"),
    fileName: v.string(),
    storageId: v.string(),
    fileContent: v.string(),
    uploadedBy: v.id("users"),
    fileType: v.string(),
  },
  handler: async (ctx, { fileContent, ...data }) => {
    const uploadId = await ctx.runMutation(api.crud.upload.create, {
      item: data,
    });

    const chunks = fileContent.match(/.{1,500}/g) || [];
    const uploadChunks = [];

    for (const chunk of chunks) {
      const embedding = await ctx.runAction(api.ai.ai.generateEmbedding, {
        text: chunk,
      });

      uploadChunks.push({
        uploadId,
        content: chunk,
        embedding,
      });
    }
    await ctx.runMutation(api.crud.uploadEmbedding.bulkCreate, {
      items: uploadChunks,
    });
  },
});
