"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Filter, Users, Calendar, ArrowRight, Sparkles, Brain, Zap } from "lucide-react"
import { mockSessions, mockApiCall } from "@/lib/mockData"

export default function HomePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    topic: "",
    filter: "all",
    collaborators: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      setError("Please sign in to start a research session")
      return
    }

    if (!formData.topic.trim()) {
      setError("Please enter a research topic")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Mock session creation
      const response = await mockApiCall("sessions/create", {
        topic: formData.topic,
        filter: formData.filter,
        collaborators: formData.collaborators
          .split(",")
          .map((email) => email.trim())
          .filter(Boolean),
      })

      if (response.success) {
        // Store session data
        const newSession = {
          id: response.sessionId,
          topic: formData.topic,
          date: new Date().toISOString().split("T")[0],
          collaborators: formData.collaborators
            .split(",")
            .map((email) => email.trim())
            .filter(Boolean),
          summaries: [],
          document: `Research session for: ${formData.topic}`,
          messages: [],
          comments: [],
        }

        // Add to existing sessions in localStorage
        const existingSessions = JSON.parse(localStorage.getItem("sessions") || "[]")
        existingSessions.unshift(newSession)
        localStorage.setItem("sessions", JSON.stringify(existingSessions))

        // Redirect to dashboard
        router.push(`/dashboard/${response.sessionId}`)
      }
    } catch (err: any) {
      setError(err.message || "Failed to create research session")
    } finally {
      setLoading(false)
    }
  }

  const handleJoinSession = (sessionId: string) => {
    router.push(`/dashboard/${sessionId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Brain className="text-primary" size={32} />
            <Sparkles className="text-primary" size={24} />
          </div>

          <h1 className="text-5xl font-bold mb-6 text-balance">
            Your AI-Powered
            <span className="text-primary"> Research Hub</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-12 text-pretty max-w-2xl mx-auto">
            Streamline research with AI insights and real-time collaboration. Transform web data into actionable
            intelligence with your team.
          </p>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="bg-card border border-border rounded-lg p-6">
              <Zap className="text-primary mx-auto mb-4" size={32} />
              <h3 className="font-semibold mb-2">AI-Powered Insights</h3>
              <p className="text-sm text-muted-foreground">
                Generate summaries and insights from web data automatically
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <Users className="text-primary mx-auto mb-4" size={32} />
              <h3 className="font-semibold mb-2">Real-time Collaboration</h3>
              <p className="text-sm text-muted-foreground">
                Work together with your team in real-time with comments and chat
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <Search className="text-primary mx-auto mb-4" size={32} />
              <h3 className="font-semibold mb-2">Smart Research</h3>
              <p className="text-sm text-muted-foreground">
                Upload documents and get AI-powered analysis and recommendations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Research Form */}
      <section className="container mx-auto px-4 pb-16">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border border-border rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-6 text-center">Start Your Research</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Topic Input */}
              <div>
                <label className="block text-sm font-medium mb-2">Research Topic</label>
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                    size={18}
                  />
                  <input
                    type="text"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., Trends in renewable energy, AI in healthcare..."
                  />
                </div>
              </div>

              {/* Filter Dropdown */}
              <div>
                <label className="block text-sm font-medium mb-2">Source Filter</label>
                <div className="relative">
                  <Filter
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                    size={18}
                  />
                  <select
                    value={formData.filter}
                    onChange={(e) => setFormData({ ...formData, filter: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="all">All Sources</option>
                    <option value="academic">Academic Papers</option>
                    <option value="news">News Articles</option>
                    <option value="reports">Research Reports</option>
                  </select>
                </div>
              </div>

              {/* Collaborators Input */}
              <div>
                <label className="block text-sm font-medium mb-2">Collaborators (Optional)</label>
                <div className="relative">
                  <Users
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                    size={18}
                  />
                  <input
                    type="text"
                    value={formData.collaborators}
                    onChange={(e) => setFormData({ ...formData, collaborators: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter email addresses separated by commas"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Invite team members to collaborate on this research session
                </p>
              </div>

              {error && <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-md">{error}</div>}

              <button
                type="submit"
                disabled={loading || !user}
                className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                    Creating Session...
                  </>
                ) : (
                  <>
                    Start Research
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              {!user && (
                <p className="text-center text-sm text-muted-foreground">Please sign in to start a research session</p>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Recent Sessions */}
      {user && (
        <section className="container mx-auto px-4 pb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold mb-8 text-center">Recent Research Sessions</h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockSessions.slice(0, 3).map((session) => (
                <div
                  key={session.id}
                  className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors"
                >
                  <h3 className="font-semibold mb-2 text-balance">{session.topic}</h3>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Calendar size={14} />
                    {new Date(session.date).toLocaleDateString()}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Users size={14} />
                    {session.collaborators.length} collaborator{session.collaborators.length !== 1 ? "s" : ""}
                  </div>

                  <button
                    onClick={() => handleJoinSession(session.id)}
                    className="w-full bg-secondary text-secondary-foreground py-2 px-4 rounded-md hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2"
                  >
                    Join Session
                    <ArrowRight size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
