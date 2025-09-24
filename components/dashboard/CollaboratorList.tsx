"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Users, UserPlus, Crown, Eye } from "lucide-react"
import { InviteForm } from "../forms/InviteForm"

interface Collaborator {
  id: string
  name: string
  email: string
  avatar?: string
  role: "owner" | "editor" | "viewer"
  status: "online" | "offline" | "away"
  lastSeen?: Date
}

interface CollaboratorListProps {
  collaborators: Collaborator[]
  onInviteCollaborator: () => void
  currentUserId: string
}

export function CollaboratorList({ collaborators, onInviteCollaborator, currentUserId }: CollaboratorListProps) {
  const [showInviteForm, setShowInviteForm] = useState(false)

  const handleInvite = async (invites: Array<{ email: string; role: "editor" | "viewer" }>, message?: string) => {
    // TODO: Implement actual invite logic
    console.log("Sending invites:", invites, message)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setShowInviteForm(false)
  }

  const getStatusColor = (status: Collaborator["status"]) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "away":
        return "bg-yellow-500"
      case "offline":
        return "bg-gray-500"
    }
  }

  const getRoleIcon = (role: Collaborator["role"]) => {
    switch (role) {
      case "owner":
        return <Crown className="h-3 w-3" />
      case "editor":
        return <Users className="h-3 w-3" />
      case "viewer":
        return <Eye className="h-3 w-3" />
    }
  }

  const getRoleColor = (role: Collaborator["role"]) => {
    switch (role) {
      case "owner":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20"
      case "editor":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "viewer":
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  if (showInviteForm) {
    return <InviteForm onInvite={handleInvite} onClose={() => setShowInviteForm(false)} />
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team ({collaborators.length})
          </CardTitle>
          <Button size="sm" onClick={() => setShowInviteForm(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {collaborators.map((collaborator) => (
            <div key={collaborator.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={collaborator.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs">{collaborator.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${getStatusColor(
                      collaborator.status,
                    )}`}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">
                      {collaborator.name}
                      {collaborator.id === currentUserId && " (You)"}
                    </p>
                    <Badge variant="outline" className={`text-xs ${getRoleColor(collaborator.role)}`}>
                      {getRoleIcon(collaborator.role)}
                      <span className="ml-1 capitalize">{collaborator.role}</span>
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{collaborator.email}</p>
                  {collaborator.status === "offline" && collaborator.lastSeen && (
                    <p className="text-xs text-muted-foreground">
                      Last seen {collaborator.lastSeen.toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <div
                  className={`h-2 w-2 rounded-full ${getStatusColor(collaborator.status)}`}
                  title={collaborator.status}
                />
                <span className="text-xs text-muted-foreground capitalize">{collaborator.status}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
