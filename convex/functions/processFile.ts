"use node";

import { v } from "convex/values";
import { action } from "../_generated/server";
import { api } from "../_generated/api";
import pdf from "pdf-parse";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

async function chunkText(text: string, size = 500): Promise<string[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: size,
    chunkOverlap: 50,
    separators: ["\n\n", "\n", ". ", " ", ""],
  });
  return splitter.splitText(text);
}

export const processSessionFiles: ReturnType<typeof action> = action({
  args: {
    sessionId: v.id("sessions"),
    chunkSize: v.optional(v.number()),
  },
  handler: async (ctx, { sessionId, chunkSize = 500 }) => {
    console.log(`Starting processing for session: ${sessionId}`);
    const uploads = await ctx.runQuery(api.crud.upload.getBySession, { sessionId });
    console.log(`Found ${uploads.length} uploads for session ${sessionId}`);

    const allChunks: any[] = [];
    const maxChunksPerFile = 100;

    for (const upload of uploads) {
      try {
        console.log(`Processing upload: ${upload._id}`);
        const fileBuffer = await ctx.storage.get(upload.storageId);
        if (!fileBuffer) {
          console.warn(`Skipping file ${upload._id}: no content`);
          continue;
        }

        const arrayBuffer = await fileBuffer.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const pdfData = await pdf(buffer);
        const content = pdfData.text;
        console.log(`Extracted text length from upload ${upload._id}: ${content.length}`);
        if (!content.trim()) {
          console.warn(`Skipping file ${upload._id}: empty PDF text`);
          continue;
        }

        const chunks = await chunkText(content, chunkSize);
        if (chunks.length > maxChunksPerFile) {
          console.warn(`Truncating chunks for upload ${upload._id} to ${maxChunksPerFile}`);
          chunks.length = maxChunksPerFile;
        }
        console.log(`Split upload ${upload._id} into ${chunks.length} chunks`);

        const embeddings = await ctx.runAction(api.ai.ai.generateEmbeddings, {
          texts: chunks,
        });
        console.log(`Generated embeddings for upload ${upload._id}`);

        chunks.forEach((chunk, i) => {
          allChunks.push({
            uploadId: upload._id,
            sessionId: upload.sessionId,
            content: chunk,
            embedding: embeddings[i],
          });
        });
      } catch (err) {
        console.error(`Error processing file ${upload._id}:`, err);
      }
    }

    if (allChunks.length > 0) {
      console.log(`Saving ${allChunks.length} chunks to database`);
      await ctx.runMutation(api.crud.uploadEmbedding.bulkCreate, { items: allChunks });
    } else {
      console.log(`No chunks to save for session ${sessionId}`);
    }

    console.log(
      `Processing complete for session ${sessionId}: processed ${allChunks.length} chunks from ${uploads.length} uploads`
    );
    // Calculate skipped uploads (uploads with no chunks)
    const skipped = uploads.filter(upload =>
      !allChunks.some(chunk => chunk.uploadId === upload._id)
    ).length;
    return { processed: allChunks.length, uploads: uploads.length, skipped };
  },
});

export const processSingleFile: ReturnType<typeof action> = action({
  args: {
    uploadId: v.id("uploads"),
    chunkSize: v.optional(v.number()),
  },
  handler: async (ctx, { uploadId, chunkSize = 500 }) => {
    console.log(`Starting processing for upload: ${uploadId}`);
    
    // Update status to processing
    await ctx.runMutation(api.crud.upload.update, {
      id: uploadId,
      updates: { parseStatus: "processing" }
    });

    try {
      const upload = await ctx.runQuery(api.crud.upload.getOne, { id: uploadId });
      if (!upload) {
        throw new Error("Upload not found");
      }

      const fileBuffer = await ctx.storage.get(upload.storageId);
      if (!fileBuffer) {
        throw new Error("File content not found");
      }

      const arrayBuffer = await fileBuffer.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const pdfData = await pdf(buffer);
      const content = pdfData.text;
      
      if (!content.trim()) {
        throw new Error("Empty PDF content");
      }

      const chunks = await chunkText(content, chunkSize);
      const maxChunksPerFile = 100;
      if (chunks.length > maxChunksPerFile) {
        console.warn(`Truncating chunks for upload ${uploadId} to ${maxChunksPerFile}`);
        chunks.length = maxChunksPerFile;
      }

      const embeddings = await ctx.runAction(api.ai.ai.generateEmbeddings, {
        texts: chunks,
      });

      const allChunks = chunks.map((chunk, i) => ({
        uploadId: upload._id,
        sessionId: upload.sessionId,
        content: chunk,
        embedding: embeddings[i],
      }));

      if (allChunks.length > 0) {
        await ctx.runMutation(api.crud.uploadEmbedding.bulkCreate, { items: allChunks });
      }

      // Update status to completed
      await ctx.runMutation(api.crud.upload.update, {
        id: uploadId,
        updates: { 
          parseStatus: "completed",
          parseError: undefined 
        }
      });

      console.log(`Processing complete for upload ${uploadId}: processed ${allChunks.length} chunks`);
      return { success: true, chunks: allChunks.length };

    } catch (error) {
      console.error(`Error processing file ${uploadId}:`, error);
      
      // Update status to error
      await ctx.runMutation(api.crud.upload.update, {
        id: uploadId,
        updates: { 
          parseStatus: "error",
          parseError: error instanceof Error ? error.message : "Unknown error"
        }
      });

      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  },
});