import { z } from "zod";

export const firecrawlResponseSchema = z.object({
  title: z.string(),
  content: z.string(),
  url: z.string(),
});
