"use client"

import type React from "react"

import { useState } from "react"
import { X, Mail, UserPlus, Trash2 } from "lucide-react"

interface InviteModalProps {
  isOpen: boolean
  onClose: () => void
  sessionId: string
}

export default function InviteModal({ isOpen, onClose, sessionId }: InviteModalProps) {
  const [emails, setEmails] = useState("")
  const [role, setRole] = useState<"editor" | "viewer">("editor")
  const [pendingInvites, setPendingInvites] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSendInvites = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!emails.trim()) return

    setLoading(true)

    try {
      const emailList = emails
        .split(",")
        .map((email) => email.trim())
        .filter(Boolean)

      // Mock invite sending
      console.log("[v0] Sending invites to:", emailList, "with role:", role)

      const newInvites = emailList.map((email) => ({
        id: Date.now() + Math.random(),
        email,
        role,
        status: "pending",
        sentAt: new Date().toISOString(),
      }))

      setPendingInvites((prev) => [...prev, ...newInvites])
      setEmails("")

      // Mock success notification
      alert(`Invites sent to ${emailList.length} collaborator${emailList.length !== 1 ? "s" : ""}!`)
    } catch (error) {
      console.error("Failed to send invites:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveInvite = (inviteId: string) => {
    setPendingInvites((prev) => prev.filter((invite) => invite.id !== inviteId))
  }

  const handleResendInvite = (invite: any) => {
    console.log("[v0] Resending invite to:", invite.email)
    alert(`Invite resent to ${invite.email}!`)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Invite Collaborators</h2>
          <button onClick={onClose} className="p-1 hover:bg-accent rounded-md transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* Invite Form */}
          <form onSubmit={handleSendInvites} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Email Addresses</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="text"
                  value={emails}
                  onChange={(e) => setEmails(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter emails separated by commas"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Separate multiple emails with commas</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "editor" | "viewer")}
                className="w-full px-3 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="editor">Editor - Can edit and comment</option>
                <option value="viewer">Viewer - Can view and comment only</option>
              </select>
            </div>

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

          {/* Pending Invites */}
          {pendingInvites.length > 0 && (
            <div>
              <h3 className="font-medium mb-3">Pending Invites</h3>
              <div className="space-y-2">
                {pendingInvites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between p-3 border border-border rounded-md"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{invite.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {invite.role} • Sent {new Date(invite.sentAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleResendInvite(invite)}
                        className="text-xs text-primary hover:text-primary/80 transition-colors"
                      >
                        Resend
                      </button>
                      <button
                        onClick={() => handleRemoveInvite(invite.id)}
                        className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
