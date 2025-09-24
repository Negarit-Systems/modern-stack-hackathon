import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { makePartial } from "../utils/utils";
import { internalMutation } from "../_generated/server";
import { scrappedDataSchema } from "../Schemas";

// QUERIES
export const get = query({
  handler: async (ctx) => {
    const items = await ctx.db.query("scrappedData").collect();
    return items;
  },
});

export const getOne = query({
  args: { id: v.id("scrappedData") },
  handler: async (ctx, { id }) => {
    const item = await ctx.db.get(id);
    return item;
  },
});

// MUTATIONS
export const create = mutation({
  args: { item: v.object(scrappedDataSchema) },
  handler: async (ctx, { item }) => {
    const id = await ctx.db.insert("scrappedData", item);
    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("scrappedData"),
    updates: v.object(makePartial(scrappedDataSchema)),
  },
  handler: async (ctx, { id, updates }) => {
    await ctx.db.patch(id, updates);
  },
});

export const deleteOne = mutation({
  args: { id: v.id("scrappedData") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

// INTERNAL FUNCTIONS
export const internalCreateScrappedData = internalMutation({
  args: { item: v.object(scrappedDataSchema) },
  handler: async (ctx, { item }) => {
    const id = await ctx.db.insert("scrappedData", item);
    return id;
  },
});
