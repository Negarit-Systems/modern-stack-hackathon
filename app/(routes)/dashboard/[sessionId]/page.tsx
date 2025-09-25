"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { mockSessions, mockApiCall, mockSummaries, mockMessages, mockCollaborators } from "@/lib/mockData";
import InviteModal from "@/components/InviteModal";
import RichTextEditor from "@/components/RichTextEditor";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ExportModal from "@/components/modals/ExportModal";
import CommentSystem from "@/components/dashboard/CommentSystem";

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
  const [showExportModal, setShowExportModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

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


  const handleAddComment = (content: string, position?: { x: number; y: number }) => {
    if (!content.trim() || !user) return

    const comment = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      content: content,
      timestamp: new Date().toISOString(),
      resolved: false,
      position,
    }

    setComments((prev) => [...prev, comment])
  }

  const handleResolveComment = (commentId: string) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId ? { ...comment, resolved: true } : comment
      )
    )
  }

  const handleReplyToComment = (commentId: string, content: string) => {
    if (!content.trim() || !user) return

    const reply = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      content: content,
      timestamp: new Date().toISOString(),
      resolved: false,
    }

    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? { ...comment, replies: [...(comment.replies || []), reply] }
          : comment
      )
    )
  }

  const handleExport = () => {
    setShowExportModal(true)
  }

  const handleSendMessage = (message: string) => {
    if (!user) return

    const messageObj = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      content: message,
      timestamp: new Date().toISOString(),
      type: "user" as const,
    }

    setMessages((prev) => [...prev, messageObj])
  }

  const handleChatbotQuery = async (query: string) => {
    setLoading(true)

    try {
      const response = await mockApiCall("ai/chat", { message: query })

      const botMessage = {
        id: Date.now().toString(),
        userId: "bot",
        userName: "AI Assistant",
        content: response.response,
        timestamp: new Date().toISOString(),
        type: "bot" as const,
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error("Chatbot query failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (files: FileList) => {
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
      <Sidebar
        session={session}
        messages={messages}
        collaborators={collaborators}
        summaries={summaries}
        user={user}
        onSendMessage={handleSendMessage}
        onChatbotQuery={handleChatbotQuery}
        onFileUpload={handleFileUpload}
        loading={loading}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <DashboardHeader
          session={session}
          collaborators={collaborators}
          onInvite={() => setShowInviteModal(true)}
          onExport={handleExport}
        />

        {/* Document Editor with Comment System */}
        <div className="flex-1 p-6 relative">
          <div className="max-w-4xl mx-auto relative">
            <CommentSystem
              comments={comments}
              collaborators={collaborators}
              user={user}
              onAddComment={handleAddComment}
              onResolveComment={handleResolveComment}
              onReplyToComment={handleReplyToComment}
            />
            <RichTextEditor
              value={document}
              onChange={handleDocumentChange}
              placeholder="Start writing your research document here... You can add text, images, graphs, and collaborate in real-time."
            />
          </div>
        </div>
      </div>

      <InviteModal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} sessionId={sessionId} />
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        session={session}
        document={document}
        summaries={summaries}
        comments={comments}
      />
    </div>
  )
}
