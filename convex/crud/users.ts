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

export const searchCollaborators = query({
  args: {
    sessionId: v.id("sessions"),
    email: v.string(), // user input
  },
  handler: async (ctx, { sessionId, email }) => {
    const session = await ctx.db.get(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    const collaboratorIds = session?.collaboratorIds || [];
    if (collaboratorIds.length === 0) {
      return { collaborators: [] };
    }

    if (!email || email.trim() === "") {
      return { collaborators: [] };
    }

    const collaborators = await ctx.runQuery(
      components.betterAuth.adapter.findMany,
      {
        model: "user",
        where: [
          {
            field: "id",
            operator: "in",
            value: collaboratorIds,
          },
          {
            field: "email",
            operator: "starts_with",
            value: email.toLowerCase(),
          },
        ],
        paginationOpts: {
          cursor: "",
          numItems: 10,
        },
      }
    );

    return { collaborators };
  },
});
