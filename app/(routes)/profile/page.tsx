"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Calendar, Settings, Crown, Users, FileText, Download } from "lucide-react"
import { Navbar } from "@/components/layout-components/Navbar"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    bio: "AI researcher and data scientist passionate about transforming complex information into actionable insights.",
    joinedAt: new Date("2024-01-15"),
    avatar: "/placeholder.svg",
  })

  const stats = {
    totalSessions: 12,
    activeSessions: 3,
    totalSummaries: 89,
    totalNotes: 156,
    collaborations: 8,
  }

  const recentActivity = [
    {
      id: "1",
      type: "session_created",
      title: "AI in Healthcare Research",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: "2",
      type: "note_added",
      title: "Added insights to Renewable Energy Trends",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },
    {
      id: "3",
      type: "collaboration",
      title: "Invited to Remote Work Productivity Study",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      id: "4",
      type: "export",
      title: "Exported Cryptocurrency Market Analysis",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  ]

  const handleSaveProfile = () => {
    // TODO: Implement profile update
    setIsEditing(false)
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "session_created":
        return <FileText className="h-4 w-4 text-blue-500" />
      case "note_added":
        return <Users className="h-4 w-4 text-green-500" />
      case "collaboration":
        return <Users className="h-4 w-4 text-purple-500" />
      case "export":
        return <Download className="h-4 w-4 text-orange-500" />
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar and Basic Info */}
                <div className="text-center">
                  <Avatar className="h-24 w-24 mx-auto mb-4">
                    <AvatarImage src={profile.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-2xl">{profile.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  {isEditing ? (
                    <div className="space-y-3">
                      <Input
                        value={profile.name}
                        onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Full name"
                      />
                      <Input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="Email address"
                      />
                      <Textarea
                        value={profile.bio}
                        onChange={(e) => setProfile((prev) => ({ ...prev, bio: e.target.value }))}
                        placeholder="Bio"
                        className="min-h-[80px]"
                      />
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-xl font-bold">{profile.name}</h2>
                      <p className="text-muted-foreground flex items-center justify-center gap-2 mt-1">
                        <Mail className="h-4 w-4" />
                        {profile.email}
                      </p>
                      <p className="text-sm text-muted-foreground mt-3">{profile.bio}</p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Account Info */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Member since</span>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      {profile.joinedAt.toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Account type</span>
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                      <Crown className="h-3 w-3 mr-1" />
                      Pro
                    </Badge>
                  </div>
                </div>

                <Separator />

                {/* Actions */}
                <div className="space-y-2">
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Button onClick={handleSaveProfile} className="flex-1">
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={() => setIsEditing(true)} className="w-full">
                      <Settings className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Research Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{stats.totalSessions}</div>
                    <div className="text-xs text-muted-foreground">Total Sessions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">{stats.activeSessions}</div>
                    <div className="text-xs text-muted-foreground">Active Sessions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">{stats.totalSummaries}</div>
                    <div className="text-xs text-muted-foreground">AI Summaries</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-500">{stats.totalNotes}</div>
                    <div className="text-xs text-muted-foreground">Notes Created</div>
                  </div>
                </div>
                <Separator />
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-500">{stats.collaborations}</div>
                  <div className="text-xs text-muted-foreground">Collaborations</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Feed */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                      <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.timestamp.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <Button variant="outline">View All Activity</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
