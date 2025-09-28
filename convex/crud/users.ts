import { components } from "../_generated/api";
import { query } from "../_generated/server";
import { v } from "convex/values";

export const getUserByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, { email }) => {
    const users = await ctx.runQuery(components.betterAuth.adapter.findOne, {
      model: "user",
      where: [
        {
          field: "email",
          operator: "eq",
          value: email,
        },
      ],
    });

    return { users };
  },
});

export const getUserById = query({
  args: {
    id: v.string(),
  },
  handler: async (ctx, { id }) => {
    const users = await ctx.runQuery(components.betterAuth.adapter.findOne, {
      model: "user",
      where: [
        {
          field: "id",
          operator: "eq",
          value: id,
        },
      ],
    });

    return { users };
  },
});
