"use client";

import type React from "react";

import { useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import { X, Mail, UserPlus, Trash2 } from "lucide-react";
import { authClient } from "@/app/lib/auth.client";
import { useRouter } from "next/navigation";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
}

export default function InviteModal({
  isOpen,
  onClose,
  sessionId,
}: InviteModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"editor" | "viewer">("editor");
  // Fetch pending invites from backend
  const pendingInvites =
    useQuery(
      api.functions.emailInvites.getSessionInvites,
      sessionId ? { sessionId: sessionId as Id<"sessions"> } : "skip"
    ) || [];

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const authUser = authClient.useSession();

  if (authUser.error) {
    router.push("/login");
  }

  const sendInvite = useAction(api.functions.emailInvites.sendInvite);
  const cancelInvite = useMutation(api.functions.emailInvites.cancelInvite);

  const [inviteActionLoading, setInviteActionLoading] = useState<string | null>(
    null
  );
  const [inviteActionError, setInviteActionError] = useState<string | null>(
    null
  );

  if (!isOpen) return null;

  const handleRemoveInvite = async (inviteId: string) => {
    setInviteActionError(null);
    setInviteActionLoading(inviteId);

    try {
      await cancelInvite({ inviteId: inviteId as Id<"invites"> });
    } catch (err: any) {
      setInviteActionError(err?.message || "Failed to cancel invite.");
    } finally {
      setInviteActionLoading(null);
    }
  };

  const handleSendInvites = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email.trim()) return;

    const currentUserEmail = authUser.data?.user?.email;
    if (email.trim().toLowerCase() === currentUserEmail?.toLowerCase()) {
      setError("You cannot send an invitation to yourself.");
      return;
    }

    setLoading(true);

    try {
      await sendInvite({
        email: email.trim(),
        sessionId: sessionId as Id<"sessions">,
        role,
        inviterName: authUser.data?.user?.name ?? "",
        sessionTitle: "",
      });

      setSuccess(`Invite sent to ${email.trim()}!`);
      setEmail("");
    } catch (err: any) {
      setInviteActionError(
        err?.message || `Failed to resend invite to ${email}`
      );
    } finally {
      setLoading(false);
      setInviteActionLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 border border-border rounded-lg w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Invite Collaborators</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent rounded-md transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* Invite Form */}
          <form onSubmit={handleSendInvites} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Email Addresses
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  size={18}
                />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter emails separated by commas"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "editor" | "viewer")}
                className="w-full px-3 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="editor">Editor - Can edit and comment</option>
                <option value="viewer">
                  Viewer - Can view and comment only
                </option>
              </select>
            </div>

            {error && (
              <div className="text-destructive text-sm mb-2">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                  Sending Invitation...
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  Send Invitation
                </>
              )}
            </button>
          </form>

          {/* Pending Invites List */}
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Pending Invites</h3>
            {pendingInvites.length === 0 ? (
              <div className="text-muted-foreground text-sm">
                No pending invites.
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {pendingInvites.map((invite: any) => (
                  <li
                    key={invite._id}
                    className="flex items-center justify-between py-2"
                  >
                    <div>
                      <span className="font-medium">{invite.email}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({invite.role})
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRemoveInvite(invite._id)}
                        className="p-1 hover:bg-destructive/20 rounded transition-colors disabled:opacity-50"
                        title="Cancel Invite"
                        disabled={inviteActionLoading === invite._id}
                      >
                        {inviteActionLoading === invite._id ? (
                          <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {inviteActionError && (
              <div className="text-destructive text-xs mt-2">
                {inviteActionError}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
