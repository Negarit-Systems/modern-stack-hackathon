// convex/emailinvites.ts

import { v } from "convex/values";
import { action, mutation, query } from "../_generated/server";
import { api } from "../_generated/api";
import {
  sendInviteEmail,
  sendBatchInviteEmails,
  EmailInviteData,
} from "../lib/resend";

import type { Id } from "../_generated/dataModel";
import type { QueryCtx, MutationCtx } from "../_generated/server";

type User = {
  _id: string;
  email: string;
  name?: string;
  createdAt: number;
};

const getAuthenticatedUser = async (ctx: any): Promise<User> => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  // Use the API to get the user, instead of a direct DB query
  const { users: user } = await ctx.runQuery(api.crud.users.getUserByEmail, {
    email: identity.email!,
  });

  if (!user) {
    throw new Error("User not found in the database");
  }
  return user as User;
};

// Send a single invitation email
// export const sendInvite = mutation({
//   args: {
//     sessionId: v.id("sessions"),
//     email: v.string(),
//     role: v.union(v.literal("editor"), v.literal("viewer")),
//     inviterName: v.string(),
//     sessionTitle: v.string(),
//   },
//   handler: async (
//     ctx: MutationCtx,
//     {
//       sessionId,
//       email,
//       role,
//       inviterName,
//       sessionTitle,
//     }: {
//       sessionId: Id<"sessions">;
//       email: string;
//       role: "editor" | "viewer";
//       inviterName: string;
//       sessionTitle: string;
//     }
//   ): Promise<{
//     inviteId: Id<"invites">;
//     emailResult: Awaited<ReturnType<typeof sendInviteEmail>>;
//   }> => {
//     const user: User = await getAuthenticatedUser(ctx);
//     const inviterId: string = user._id;
//     const inviteId: Id<"invites"> = await ctx.db.insert("invites", {
//       sessionId,
//       email,
//       role,
//       status: "PENDING",
//       invitedBy: inviterId,
//       createdAt: Date.now(),
//     });
//     const emailData: EmailInviteData = {
//       to: email,
//       inviterName,
//       sessionTitle,
//       sessionId,
//       role,
//       inviteId: inviteId.toString(),
//     };
//     const emailResult = await sendInviteEmail(emailData);
//     if (!emailResult.success) {
//       await ctx.db.patch(inviteId, {
//         status: "CANCELLED",
//         updatedAt: Date.now(),
//       });
//       throw new Error(`Failed to send email: ${emailResult.error}`);
//     }
//     return {
//       inviteId,
//       emailResult,
//     };
//   },
// });

// Send multiple invitation emails
export const sendBatchInvites = mutation({
  args: {
    sessionId: v.id("sessions"),
    invites: v.array(
      v.object({
        email: v.string(),
        role: v.union(v.literal("editor"), v.literal("viewer")),
      })
    ),
    inviterName: v.string(),
    sessionTitle: v.string(),
  },
  handler: async (
    ctx: MutationCtx,
    {
      sessionId,
      invites,
      inviterName,
      sessionTitle,
    }: {
      sessionId: Id<"sessions">;
      invites: Array<{ email: string; role: "editor" | "viewer" }>;
      inviterName: string;
      sessionTitle: string;
    }
  ): Promise<{
    inviteIds: string[];
    emailResults: Awaited<ReturnType<typeof sendBatchInviteEmails>>;
    success: boolean;
  }> => {
    const user: User = await getAuthenticatedUser(ctx);
    const inviterId: string = user._id;
    const inviteIds: string[] = [];
    const emailDataList: EmailInviteData[] = [];
    for (const invite of invites) {
      const inviteId: Id<"invites"> = await ctx.db.insert("invites", {
        sessionId,
        email: invite.email,
        role: invite.role,
        status: "PENDING",
        invitedBy: inviterId,
        createdAt: Date.now(),
      });
      inviteIds.push(inviteId.toString());
      emailDataList.push({
        to: invite.email,
        inviterName,
        sessionTitle,
        sessionId,
        role: invite.role,
        inviteId: inviteId.toString(),
      });
    }
    const emailResults = await sendBatchInviteEmails(emailDataList);
    for (let i = 0; i < emailResults.results.length; i++) {
      const result = emailResults.results[i];
      const inviteId = inviteIds[i];
      if (!result.success) {
        await ctx.db.patch(inviteId as any, {
          status: "CANCELLED",
          updatedAt: Date.now(),
        });
      }
    }
    return {
      inviteIds,
      emailResults,
      success: emailResults.success,
    };
  },
});

export const resendInvite = action({
  args: {
    inviteId: v.id("invites"),
    inviterName: v.string(),
    sessionTitle: v.string(),
  },
  handler: async (ctx, { inviteId, inviterName, sessionTitle }) => {
    const user = await getAuthenticatedUser(ctx);

    const invite = await ctx.runQuery(api.crud.invite.getOne, { id: inviteId });
    if (!invite) throw new Error("Invite not found");

    const inviteTyped = invite as {
      email: string;
      sessionId: Id<"sessions">;
      role: "editor" | "viewer";
      invitedBy: string;
    };

    if (inviteTyped.invitedBy !== user._id) {
      throw new Error("Not authorized to resend this invite");
    }

    // call external API directly here
    const emailResult = await sendInviteEmail({
      to: inviteTyped.email,
      inviterName,
      sessionTitle,
      sessionId: inviteTyped.sessionId,
      role: inviteTyped.role,
      inviteId: inviteId.toString(),
    });

    if (!emailResult.success) {
      throw new Error(`Failed to resend email: ${emailResult.error}`);
    }
    // optional DB update
    await ctx.runMutation(api.crud.invite.update, {
      id: inviteId,
      updates: { updatedAt: Date.now() },
    });
    return { emailResult };
  },
});

export const sendInvite = action({
  args: {
    email: v.string(),
    sessionId: v.id("sessions"),
    role: v.union(v.literal("editor"), v.literal("viewer")),
    inviterName: v.string(),
    sessionTitle: v.string(),
  },
  handler: async (
    ctx,
    { email, sessionId, role, inviterName, sessionTitle }
  ) => {
    const user = await getAuthenticatedUser(ctx);

    // check if an invite already exists for this email & session
    const existing = await ctx.runQuery(api.crud.invite.getOneByEmail, {
      id: sessionId,
      email: email,
    });

    if (existing && existing.status === "ACCEPTED") {
      throw new Error(
        "This user has already accepted an invite to this session"
      );
    }

    let inviteId: Id<"invites">;

    if (existing && existing.status === "PENDING") {
      // update existing invite
      inviteId = existing._id;
      await ctx.runMutation(api.crud.invite.update, {
        id: inviteId,
        updates: { updatedAt: Date.now(), status: "PENDING" },
      });
    } else {
      // create new invite
      inviteId = await ctx.runMutation(api.crud.invite.create, {
        item: {
          sessionId,
          email,
          role,
          invitedBy: user._id,
          status: "PENDING",
          createdAt: Date.now(),
        },
      });
    }

    // send invite email
    const emailResult = await sendInviteEmail({
      to: email,
      inviterName,
      sessionTitle,
      sessionId: sessionId,
      role,
      inviteId: inviteId.toString(),
    });

    if (!emailResult.success) {
      throw new Error(`Failed to send email: ${emailResult.error}`);
    }

    return { emailResult, inviteId };
  },
});

// Get invites for a session (NO CHANGE NEEDED HERE)
export const getSessionInvites = query({
  args: { sessionId: v.id("sessions") },
  handler: async (
    ctx: QueryCtx,
    { sessionId }: { sessionId: Id<"sessions"> }
  ): Promise<any[]> => {
    const invites = await ctx.db
      .query("invites")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", sessionId))
      .collect();
    return invites;
  },
});

// Get invite by ID (for accepting invitations)
export const getInviteById = query({
  args: { inviteId: v.id("invites") },
  handler: async (
    ctx: QueryCtx,
    { inviteId }: { inviteId: Id<"invites"> }
  ): Promise<(Record<string, any> & { session: any; inviter: any }) | null> => {
    const invite = await ctx.db.get(inviteId);
    if (!invite) {
      return null;
    }
    // Type assertion to help TypeScript know this is an invite
    const inviteTyped = invite as {
      sessionId: Id<"sessions">;
      invitedBy: string;
    };
    const session = await ctx.db.get(inviteTyped.sessionId);
    if (!session) {
      return null;
    }
    const { users: inviter } = await ctx.runQuery(api.crud.users.getUserById, {
      id: inviteTyped.invitedBy.toString(),
    });
    if (!inviter) {
      return null;
    }
    return {
      ...inviteTyped,
      session,
      inviter,
    };
  },
});

// Accept an invitation (NO CHANGE NEEDED HERE)
export const acceptInvite = mutation({
  args: { inviteId: v.id("invites") },
  handler: async (ctx, { inviteId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const invite = await ctx.db.get(inviteId);
    if (!invite) {
      throw new Error("Invite not found");
    }

    if (invite.email !== identity.email!) {
      throw new Error("This invitation is not for your email address");
    }

    if (invite.status !== "PENDING") {
      throw new Error("This invitation is no longer valid");
    }

    await ctx.db.patch(inviteId, {
      status: "ACCEPTED",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Cancel an invitation
export const cancelInvite = mutation({
  args: { inviteId: v.id("invites") },
  handler: async (ctx, { inviteId }) => {
    const user = await getAuthenticatedUser(ctx);

    const invite = await ctx.db.get(inviteId);
    if (!invite) {
      throw new Error("Invite not found");
    }

    // Authorization check
    if (invite.invitedBy !== user._id) {
      throw new Error("Not authorized to cancel this invite");
    }

    await ctx.db.delete(inviteId);

    return { success: true };
  },
});
