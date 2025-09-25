import { v } from "convex/values";
import { query } from "../_generated/server";
import { makePartial } from "../utils/utils";

export const get = query({
  handler: async (ctx) => {
    const items = await ctx.db.query("testSchema").collect();
    return items;
  },
});
