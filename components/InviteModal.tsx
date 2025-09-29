"use client";

import type React from "react";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import { X, Mail, UserPlus, Trash2 } from "lucide-react";

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
  const [emails, setEmails] = useState("");
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

  // Convex mutations
  const sendBatchInvites = useMutation(
    api.functions.emailInvites.sendBatchInvites
  );
  const resendInvite = useMutation(api.functions.emailInvites.resendInvite);
  const cancelInvite = useMutation(api.functions.emailInvites.cancelInvite);

  // Track loading/error for individual invite actions
  const [inviteActionLoading, setInviteActionLoading] = useState<string | null>(
    null
  );
  const [inviteActionError, setInviteActionError] = useState<string | null>(
    null
  );

  if (!isOpen) return null;

  const handleSendInvites = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!emails.trim()) return;
    setLoading(true);
    try {
      const emailList = emails
        .split(",")
        .map((email) => email.trim())
        .filter(Boolean);
      if (emailList.length === 0) {
        setError("Please enter at least one valid email address.");
        setLoading(false);
        return;
      }
      await sendBatchInvites({
        sessionId: sessionId as Id<"sessions">,
        invites: emailList.map((email) => ({ email, role })),
        inviterName: "", // Optionally pass inviterName if available in context
        sessionTitle: "", // Optionally pass sessionTitle if available in context
      });
      setSuccess(
        `Invites sent to ${emailList.length} collaborator${emailList.length !== 1 ? "s" : ""}!`
      );
      setEmails("");
    } catch (err: any) {
      // Try to extract a detailed error message from Convex/Resend
      let msg = err?.message || "Failed to send invites.";
      // Convex errors may be nested in data.error or data.response?.data?.error
      if (err?.data?.error) msg = err.data.error;
      if (err?.response?.data?.error) msg = err.response.data.error;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Cancel invite
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

  // Resend invite
  const handleResendInvite = async (invite: any) => {
    setInviteActionError(null);
    setInviteActionLoading(invite._id);
    try {
      await resendInvite({
        inviteId: invite._id,
        inviterName: "", // Optionally pass inviterName if available
        sessionTitle: "", // Optionally pass sessionTitle if available
      });
    } catch (err: any) {
      setInviteActionError(
        err?.message || `Failed to resend invite to ${invite.email}`
      );
    } finally {
      setInviteActionLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-md">
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
                  value={emails}
                  onChange={(e) => setEmails(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter emails separated by commas"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Separate multiple emails with commas
              </p>
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

            {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
            {success && (
              <div className="text-green-600 text-sm mb-2">{success}</div>
            )}

            <button
              type="submit"
              disabled={loading || !emails.trim()}
              className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                  Sending Invites...
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  Send Invites
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
                        onClick={() => handleResendInvite(invite)}
                        className="p-1 hover:bg-accent rounded transition-colors disabled:opacity-50"
                        title="Resend Invite"
                        disabled={inviteActionLoading === invite._id}
                      >
                        {inviteActionLoading === invite._id ? (
                          <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                        ) : (
                          <Mail size={16} />
                        )}
                      </button>
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
              <div className="text-red-600 text-xs mt-2">
                {inviteActionError}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
