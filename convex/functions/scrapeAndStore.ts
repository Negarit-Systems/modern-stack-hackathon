"use node";
import { action } from "../_generated/server";
import { v } from "convex/values";
import { api, internal } from "../_generated/api";
import { initFirecrawl } from "../lib/firecrawl";
import { firecrawlResponseSchema } from "../types/firecrawl";
import { BatchScrapeJob } from "@mendable/firecrawl-js";


export const scrapeUrls = action({
  args: {
    sessionId: v.id("sessions"),
    topic: v.optional(v.string()),
    customUrls: v.optional(v.array(v.string())),
  },
  handler: async (ctx, {sessionId, topic, customUrls }): Promise<BatchScrapeJob> => {
    const firecrawl = initFirecrawl();
    const instruction = await ctx.runAction(
      api.functions.ai.getContextBasedResponse,
      {
        sessionId,
        prompt: `Generate an instruction for web scraping ${topic ? `for the topic ${topic}` : ""} based on the research topic and document context in the session.`,
      }
    );
    const urls = await ctx.runAction(
      api.functions.ai.getContextBasedResponse,
      {
        sessionId,
        prompt: `Generate a list of URLs for web scraping ${topic ? `for the topic ${topic}` : ""} based on the research topic and document context in the session. Use the following instruction: ${instruction}`,
      }
    );

    if (!Array.isArray(urls) || urls.length === 0) {
      throw new Error("No URLs generated for scraping");
    }

    return await firecrawl.batchScrape([...(customUrls ?? []), ...urls], {
        options: {
          formats: [
            {
              type: "json",
              prompt:
                `Summarize the key insights and important points from this page relevant to the research topic and session context.`,
              schema: firecrawlResponseSchema,
            },
          ],
        },
        pollInterval: 2,
        timeout: 120,
      })
  }
});

export const scrapAndStoreInsights = action({
  args: {
    sessionId: v.id("sessions"),
    topic: v.optional(v.string()),
    customUrls: v.optional(v.array(v.string())),
  },
  handler: async (ctx, { sessionId, topic, customUrls }) => {
    const scrapJob = await ctx.runAction(
      api.functions.scrapeAndStore.scrapeUrls,{
        sessionId,
        topic,
        customUrls
      }
    );

    console.log("Scrape job completed:", scrapJob);

    for (const item of scrapJob.data) {
      if (!item.json) {
        continue;
      }

      const parsedItem = firecrawlResponseSchema.parse(item.json);
      if (
        !parsedItem ||
        (parsedItem.content && parsedItem.content.includes("404")) ||
        (parsedItem.content && parsedItem.content.includes("not found")) ||
        (parsedItem.content && parsedItem.content.includes("error")) ||
        (parsedItem.content && parsedItem.content.length < 20) ||
        (parsedItem.url && parsedItem.url.length < 10)
      ) {
        continue;
      }

      await ctx.runMutation(
        internal.crud.scrapedData.internalCreatescrapedData,
        {
          item: {
            sessionId: sessionId,
            title: parsedItem?.title ?? "",
            url: parsedItem?.url,
            content: parsedItem?.content ?? "",
          },
        }
      );
    }
  },
});


