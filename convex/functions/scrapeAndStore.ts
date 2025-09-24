"use node";
import { action } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { initFirecrawl } from "../lib/firecrawl";
import { firecrawlResponseSchema } from "../types/firecrawl";

const urlValidator = v.array(v.string());

export const scrapeAndStore = action({
  args: {
    sessionId: v.id("sessions"),
    urls: urlValidator,
    customQuery: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const firecrawl = initFirecrawl();
    const result = await firecrawl.batchScrape(args.urls, {
      options: {
        formats: [
          {
            type: "json",
            prompt:
              args.customQuery ??
              `
              Summarize the important points of this page.
            `,
            schema: firecrawlResponseSchema,
          },
        ],
      },
      pollInterval: 2,
      timeout: 120,
    });

    for (const item of result.data) {
      if (!item.json) {
        continue;
      }

      const parsedItem = firecrawlResponseSchema.parse(item.json);
      await ctx.runMutation(
        internal.crud.scrapedData.internalCreatescrapedData,
        {
          item: {
            sessionId: args.sessionId,
            title: parsedItem?.title ?? "",
            urls: args.urls,
            content: parsedItem?.content ?? "",
            createdAt: Date.now(),
          },
        }
      );
    }
  },
});
