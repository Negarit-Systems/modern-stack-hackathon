"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader } from "../ui/loader"
import { UserPlus, Mail, X, Crown, Users, Eye } from "lucide-react"

interface InviteFormProps {
  onInvite: (invites: Array<{ email: string; role: "editor" | "viewer" }>, message?: string) => Promise<void>
  onClose: () => void
}

export function InviteForm({ onInvite, onClose }: InviteFormProps) {
  const [emails, setEmails] = useState<string>("")
  const [role, setRole] = useState<"editor" | "viewer">("editor")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [emailList, setEmailList] = useState<Array<{ email: string; role: "editor" | "viewer" }>>([])

  const handleAddEmails = () => {
    const newEmails = emails
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email.length > 0 && email.includes("@"))
      .map((email) => ({ email, role }))

    setEmailList((prev) => {
      const existing = new Set(prev.map((item) => item.email))
      const filtered = newEmails.filter((item) => !existing.has(item.email))
      return [...prev, ...filtered]
    })

    setEmails("")
  }

  const handleRemoveEmail = (emailToRemove: string) => {
    setEmailList((prev) => prev.filter((item) => item.email !== emailToRemove))
  }

  const handleUpdateRole = (email: string, newRole: "editor" | "viewer") => {
    setEmailList((prev) => prev.map((item) => (item.email === email ? { ...item, role: newRole } : item)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (emailList.length === 0) return

    setIsLoading(true)
    try {
      await onInvite(emailList, message || undefined)
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleIcon = (role: "editor" | "viewer") => {
    return role === "editor" ? <Users className="h-3 w-3" /> : <Eye className="h-3 w-3" />
  }

  const getRoleColor = (role: "editor" | "viewer") => {
    return role === "editor"
      ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
      : "bg-gray-500/10 text-gray-500 border-gray-500/20"
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invite Team Members
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Email Addresses</label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Enter email addresses separated by commas"
                  value={emails}
                  onChange={(e) => setEmails(e.target.value)}
                />
              </div>
              <Select value={role} onValueChange={(value: "editor" | "viewer") => setRole(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <Button type="button" onClick={handleAddEmails} disabled={!emails.trim()}>
                Add
              </Button>
            </div>
          </div>

          {/* Email List */}
          {emailList.length > 0 && (
            <div className="space-y-3">
              <label className="text-sm font-medium">Invitations ({emailList.length})</label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {emailList.map((item) => (
                  <div key={item.email} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{item.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={item.role}
                        onValueChange={(value: "editor" | "viewer") => handleUpdateRole(item.email, value)}
                      >
                        <SelectTrigger className="w-24 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveEmail(item.email)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Role Descriptions */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Permission Levels</label>
            <div className="grid gap-2">
              <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                  <Crown className="h-3 w-3 mr-1" />
                  Owner
                </Badge>
                <span className="text-sm text-muted-foreground">Full access to manage team and settings</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                  <Users className="h-3 w-3 mr-1" />
                  Editor
                </Badge>
                <span className="text-sm text-muted-foreground">Can edit notes, add comments, and collaborate</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/20">
                  <Eye className="h-3 w-3 mr-1" />
                  Viewer
                </Badge>
                <span className="text-sm text-muted-foreground">Read-only access to research and summaries</span>
              </div>
            </div>
          </div>

          {/* Custom Message */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Custom Message <span className="text-muted-foreground">(Optional)</span>
            </label>
            <Textarea
              placeholder="Add a personal message to your invitation..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={emailList.length === 0 || isLoading}>
              {isLoading ? (
                <>
                  <Loader size="sm" className="mr-2" />
                  Sending Invites...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Send {emailList.length} Invite{emailList.length !== 1 ? "s" : ""}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
