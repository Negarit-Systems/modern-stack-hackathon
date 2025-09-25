"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  Upload,
  Send,
  MessageCircle,
  Users,
  Download,
  UserPlus,
  Bot,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { mockApiCall, mockSummaries, mockMessages, mockCollaborators, mockSessions } from "@/lib/mockData"
import RichTextEditor from "@/components/RichTextEditor"
import InviteModal from "@/components/InviteModal"

export default function ResearchDashboard() {
  const params = useParams()
  const router = useRouter()
  const sessionId = (params?.sessionId ?? "") as string

  const [session, setSession] = useState<any>(null)
  const [document, setDocument] = useState("")
  const [summaries, setSummaries] = useState(mockSummaries)
  const [messages, setMessages] = useState(mockMessages)
  const [comments, setComments] = useState<any[]>([])
  const [collaborators, setCollaborators] = useState(mockCollaborators)
  const [newMessage, setNewMessage] = useState("")
  const [newComment, setNewComment] = useState("")
  const [chatbotQuery, setChatbotQuery] = useState("")
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    // Get user data
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    } else {
      router.push("/")
      return
    }

    let foundSession = null

    // First check localStorage for user-created sessions
    const storedSessions = JSON.parse(localStorage.getItem("sessions") || "[]")
    foundSession = storedSessions.find((s: any) => s.id === sessionId)

    // If not found in localStorage, check mockSessions
    if (!foundSession) {
      foundSession = mockSessions.find((s) => s.id === sessionId)
    }

    if (foundSession) {
      setSession(foundSession)
      setDocument(foundSession.document)
      console.log("[v0] Session loaded:", foundSession.topic)
    } else {
      console.log("[v0] Session not found:", sessionId)
      // Redirect back to homepage if session doesn't exist
      router.push("/")
      return
    }

    // Simulate real-time updates
    const interval = setInterval(() => {
      // Mock real-time sync
      console.log("[v0] Real-time sync - checking for updates")

      // Randomly add a new message every 10 seconds (mock)
      if (Math.random() > 0.8) {
        const newMsg = {
          id: Date.now().toString(),
          userId: "2",
          userName: "Sarah Johnson",
          content: "I found some interesting data on this topic!",
          timestamp: new Date().toISOString(),
          type: "user" as const,
        }
        setMessages((prev) => [...prev, newMsg])
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [sessionId, router])

  const handleDocumentChange = (content: string) => {
    setDocument(content)
    console.log("[v0] Document updated - syncing with collaborators")
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user) return

    const message = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      content: newMessage,
      timestamp: new Date().toISOString(),
      type: "user" as const,
    }

    setMessages((prev) => [...prev, message])
    setNewMessage("")
  }

  const handleChatbotQuery = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatbotQuery.trim()) return

    setLoading(true)

    try {
      const response = await mockApiCall("ai/chat", { message: chatbotQuery })

      const botMessage = {
        id: Date.now().toString(),
        userId: "bot",
        userName: "AI Assistant",
        content: response.response,
        timestamp: new Date().toISOString(),
        type: "bot" as const,
      }

      setMessages((prev) => [...prev, botMessage])
      setChatbotQuery("")
    } catch (error) {
      console.error("Chatbot query failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setLoading(true)

    try {
      for (const file of Array.from(files)) {
        console.log("[v0] Processing file:", file.name)

        // Mock file processing
        const mockSummary = {
          id: Date.now().toString(),
          content: `Summary of ${file.name}: This document contains relevant information about the research topic with key insights and data points.`,
          source: file.name,
          timestamp: new Date().toISOString(),
        }

        setSummaries((prev) => [...prev, mockSummary])
      }
    } catch (error) {
      console.error("File upload failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddComment = (summaryId: string) => {
    if (!newComment.trim() || !user) return

    const comment = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      content: newComment,
      timestamp: new Date().toISOString(),
      resolved: false,
      summaryId,
    }

    setComments((prev) => [...prev, comment])
    setNewComment("")
  }

  const handleExport = () => {
    router.push(`/export/${sessionId}`)
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading research session...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Collapsible Sidebar */}
      <div
        className={`${sidebarCollapsed ? "w-16" : "w-80"} transition-all duration-300 border-r border-border bg-card flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div>
                <h2 className="font-semibold text-sm text-muted-foreground">Research Session</h2>
                <p className="text-xs text-muted-foreground truncate">{session.topic}</p>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 hover:bg-accent rounded-md transition-colors"
            >
              {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>
        </div>

        {/* Sidebar Content */}
        {!sidebarCollapsed && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* AI Assistant */}
            <div className="bg-background border border-border rounded-lg p-3">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                <Bot size={16} className="text-primary" />
                AI Assistant
              </h3>

              <form onSubmit={handleChatbotQuery} className="mb-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatbotQuery}
                    onChange={(e) => setChatbotQuery(e.target.value)}
                    className="flex-1 px-2 py-1 text-sm border border-border rounded-md bg-background focus:ring-1 focus:ring-primary focus:border-transparent"
                    placeholder="Ask about research..."
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-2 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </form>
            </div>

            {/* Team Chat */}
            <div className="bg-background border border-border rounded-lg p-3">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                <MessageCircle size={16} className="text-primary" />
                Team Chat
              </h3>

              <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
                {messages.slice(-5).map((message) => (
                  <div key={message.id} className="text-xs">
                    <div className="flex items-center gap-1 mb-1">
                      <span className={`font-medium ${message.type === "bot" ? "text-primary" : "text-foreground"}`}>
                        {message.userName.split(" ")[0]}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{message.content}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage}>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 px-2 py-1 text-sm border border-border rounded-md bg-background focus:ring-1 focus:ring-primary focus:border-transparent"
                    placeholder="Type message..."
                  />
                  <button
                    type="submit"
                    className="px-2 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </form>
            </div>

            {/* Collaborators */}
            <div className="bg-background border border-border rounded-lg p-3">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                <Users size={16} className="text-primary" />
                Collaborators
              </h3>

              <div className="space-y-2">
                {collaborators.map((collaborator) => (
                  <div key={collaborator.id} className="flex items-center gap-2">
                    <div className="relative">
                      <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center text-xs font-medium">
                        {collaborator.name.charAt(0)}
                      </div>
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-card ${
                          collaborator.status === "active" ? "bg-green-500" : "bg-gray-400"
                        }`}
                      ></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{collaborator.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{collaborator.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insights Preview */}
            <div className="bg-background border border-border rounded-lg p-3">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                <ExternalLink size={16} className="text-primary" />
                Recent Insights
              </h3>

              <div className="space-y-2">
                {summaries.slice(0, 2).map((summary) => (
                  <div key={summary.id} className="p-2 bg-muted/30 rounded-md">
                    <p className="text-xs text-muted-foreground line-clamp-2">{summary.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">{summary.source}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 mt-3">
                <label className="flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 transition-colors text-xs">
                  <Upload size={12} />
                  Upload
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt"
                  />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-balance">{session.topic}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                <span>Research Session • {new Date(session.date).toLocaleDateString()}</span>
                <span>Auto-saved • Last sync: {new Date().toLocaleTimeString()}</span>
                <div className="flex items-center gap-2">
                  {collaborators
                    .filter((c) => c.status === "active")
                    .map((collab) => (
                      <div key={collab.id} className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>{collab.name.split(" ")[0]}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors text-sm"
              >
                <UserPlus size={16} />
                Invite
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm"
              >
                <Download size={16} />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Document Editor - Now the main focus */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <RichTextEditor
              value={document}
              onChange={handleDocumentChange}
              placeholder="Start writing your research document here... You can add text, images, graphs, and collaborate in real-time."
            />
          </div>
        </div>
      </div>

      <InviteModal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} sessionId={sessionId} />
    </div>
  )
}
