"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, Mail, Settings, Calendar, Eye, Share, Trash2, BarChart3, LogOut } from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  type Session = {
    id: string
    topic: string
    date: string
    collaborators: string[]
  }
  const [sessions, setSessions] = useState<Session[] | null>(null)
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    summaryLength: "medium",
    notifications: true,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    console.log("Loaded user data:", userData)
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      setProfileData({
        name: parsedUser.name || "",
        email: parsedUser.email || "",
        summaryLength: "medium",
        notifications: true,
      })
    } else {
      router.push("/")
    }
  }, [router])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Mock profile update
      console.log("[v0] Updating profile:", profileData)

      const updatedUser = {
        ...user,
        name: profileData.name,
        email: profileData.email,
      }

      localStorage.setItem("user", JSON.stringify(updatedUser))
      setUser(updatedUser)

      alert("Profile updated successfully!")
    } catch (error) {
      console.error("Profile update failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewSession = (sessionId: string) => {
    router.push(`/dashboard/${sessionId}`)
  }

  const handleShareSession = (session: any) => {
  const handleDeleteSession = (sessionId: string) => {
    if (confirm("Are you sure you want to delete this session?")) {
      setSessions((prev) => prev ? prev.filter((s: Session) => s.id !== sessionId) : prev)
      console.log("[v0] Session deleted:", sessionId)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Profile & Settings</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    {user.name?.charAt(0) || "U"}
                  </div>
                  <h2 className="text-xl font-semibold">{user.name}</h2>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>

                {/* Quick Stats */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Sessions</span>
                    <span className="font-semibold">{sessions?.length ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">This Month</span>
                    <span className="font-semibold">5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Collaborators</span>
                    <span className="font-semibold">12</span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-2 text-destructive border border-destructive rounded-md hover:bg-destructive hover:text-destructive-foreground transition-colors"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Profile Settings */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Settings size={20} />
                  Account Settings
                </h3>

                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <div className="relative">
                      <User
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                        size={18}
                      />
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <div className="relative">
                      <Mail
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                        size={18}
                      />
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Default Summary Length</label>
                    <select
                      value={profileData.summaryLength}
                      onChange={(e) => setProfileData({ ...profileData, summaryLength: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="short">Short - Concise bullet points</option>
                      <option value="medium">Medium - Balanced detail</option>
                      <option value="long">Long - Comprehensive analysis</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="notifications"
                      checked={profileData.notifications}
                      onChange={(e) => setProfileData({ ...profileData, notifications: e.target.checked })}
                      className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                    />
                    <label htmlFor="notifications" className="text-sm">
                      Email notifications for session updates
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    {loading ? "Updating..." : "Update Profile"}
                  </button>
                </form>
              </div>

              {/* Session History */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 size={20} />
                  Research Sessions
                </h3>

                <div className="space-y-4">
                  {sessions?.map((session) => (
                    <div key={session.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-medium mb-2 text-balance">{session.topic}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              {new Date(session.date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <User size={14} />
                              {session.collaborators.length} collaborator{session.collaborators.length !== 1 ? "s" : ""}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {session.collaborators.slice(0, 3).map((email: string, index: number) => (
                              <span
                                key={index}
                                className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded"
                              >
                                {email}
                              </span>
                            ))}
                            {session.collaborators.length > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{session.collaborators.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewSession(session.id)}
                            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                            title="View Session"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleShareSession(session)}
                            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                            title="Share Session"
                          >
                            <Share size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteSession(session.id)}
                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-accent rounded-md transition-colors"
                            title="Delete Session"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
  }}
