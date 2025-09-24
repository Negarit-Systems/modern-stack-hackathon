import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { makePartial } from "../utils/utils";
import { internalMutation } from "../_generated/server";
import { scrapedDataSchema } from "../schemas";

// QUERIES
export const get = query({
  handler: async (ctx) => {
    const items = await ctx.db.query("scrapedData").collect();
    return items;
  },
});

export const getOne = query({
  args: { id: v.id("scrapedData") },
  handler: async (ctx, { id }) => {
    const item = await ctx.db.get(id);
    return item;
  },
});

// MUTATIONS
export const create = mutation({
  args: { item: v.object(scrapedDataSchema) },
  handler: async (ctx, { item }) => {
    const id = await ctx.db.insert("scrapedData", item);
    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("scrapedData"),
    updates: v.object(makePartial(scrapedDataSchema)),
  },
  handler: async (ctx, { id, updates }) => {
    await ctx.db.patch(id, updates);
  },
});

export const deleteOne = mutation({
  args: { id: v.id("scrapedData") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

// INTERNAL FUNCTIONS
export const internalCreatescrapedData = internalMutation({
  args: { item: v.object(scrapedDataSchema) },
  handler: async (ctx, { item }) => {
    const id = await ctx.db.insert("scrapedData", item);
    return id;
  },
});
