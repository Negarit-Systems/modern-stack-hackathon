import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { makePartial } from "../utils/utils";
import { groupChatSchema } from "../schemas";
import { authComponent } from "../auth";
import { paginationOptsValidator } from "convex/server";

export const sendMessage = mutation({
  args: {
    sessionId: v.id("sessions"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }
    const session = await ctx.db.get(args.sessionId);

    if (!session || !session.collaboratorIds.includes(authUser._id)) {
      throw new Error("User not in session");
    }

    return await ctx.db.insert("groupChats", {
      sessionId: args.sessionId,
      senderId: authUser._id,
      content: args.content,
      senderName: authUser.name,
    });
  },
});

export const getMessages = query({
  args: {
    sessionId: v.id("sessions"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("groupChats")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});
