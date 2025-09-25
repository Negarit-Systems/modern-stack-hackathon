"use node";

import Firecrawl from "@mendable/firecrawl-js";

export const initFirecrawl = () => {
  return new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });
};
