"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader } from "@/components/ui/loader"
import { Search, Sparkles, RefreshCw, Settings } from "lucide-react"
import { Navbar } from "@/components/layout-components/Navbar"
import { SummaryList } from "@/components/dashboard/SummaryList"
import { NotesEditor } from "@/components/dashboard/NotesEditor"
import { CollaboratorList } from "@/components/dashboard/CollaboratorList"
import { ExportOptions } from "@/components/dashboard/ExportOptions"

// Mock data types
interface Summary {
  id: string
  title: string
  content: string
  sources: Array<{
    url: string
    title: string
    domain: string
  }>
  confidence: "high" | "medium" | "low"
  timestamp: Date
}

interface Note {
  id: string
  content: string
  author: {
    name: string
    avatar?: string
  }
  timestamp: Date
}

interface Collaborator {
  id: string
  name: string
  email: string
  avatar?: string
  role: "owner" | "editor" | "viewer"
  status: "online" | "offline" | "away"
  lastSeen?: Date
}

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const topic = searchParams?.get("topic") || "AI Research Topic"

  const [summaries, setSummaries] = useState<Summary[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [collaborators] = useState<Collaborator[]>([
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      role: "owner",
      status: "online",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "editor",
      status: "online",
    },
    {
      id: "3",
      name: "Bob Wilson",
      email: "bob@example.com",
      role: "viewer",
      status: "away",
      lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
  ])

  const [isGenerating, setIsGenerating] = useState(true)
  const [sessionId] = useState("session-" + Math.random().toString(36).substr(2, 9))

  const currentUser = { name: "John Doe", avatar: undefined }

  // Simulate AI research generation
  useEffect(() => {
    const generateSummaries = async () => {
      setIsGenerating(true)

      // Simulate progressive loading of summaries
      const mockSummaries: Summary[] = [
        {
          id: "1",
          title: "Current Market Trends and Adoption Rates",
          content:
            "Recent studies show significant growth in the adoption of AI technologies across various industries. The market has expanded by 35% year-over-year, with particular strength in healthcare, finance, and manufacturing sectors. Key drivers include improved efficiency, cost reduction, and enhanced decision-making capabilities.",
          sources: [
            {
              url: "https://example.com/ai-trends-2024",
              title: "AI Market Analysis 2024",
              domain: "techresearch.com",
            },
            {
              url: "https://example.com/industry-adoption",
              title: "Industry AI Adoption Report",
              domain: "businessinsights.com",
            },
          ],
          confidence: "high",
          timestamp: new Date(),
        },
        {
          id: "2",
          title: "Regulatory Landscape and Compliance Considerations",
          content:
            "Governments worldwide are implementing new regulations for AI systems, focusing on transparency, accountability, and ethical use. The EU AI Act and similar legislation in other regions are creating standardized frameworks for AI development and deployment. Organizations need to ensure compliance with data privacy laws and algorithmic transparency requirements.",
          sources: [
            {
              url: "https://example.com/ai-regulations",
              title: "Global AI Regulation Overview",
              domain: "legaltech.com",
            },
            {
              url: "https://example.com/compliance-guide",
              title: "AI Compliance Best Practices",
              domain: "regulatoryinsights.com",
            },
          ],
          confidence: "high",
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
        },
        {
          id: "3",
          title: "Technical Challenges and Limitations",
          content:
            "Despite rapid advancement, AI systems face several technical challenges including data quality issues, model interpretability, and computational resource requirements. Bias in training data remains a significant concern, and organizations are investing heavily in developing more robust and fair AI systems.",
          sources: [
            {
              url: "https://example.com/ai-challenges",
              title: "Technical Challenges in AI Development",
              domain: "airesearch.org",
            },
          ],
          confidence: "medium",
          timestamp: new Date(Date.now() - 10 * 60 * 1000),
        },
      ]

      // Simulate progressive loading
      for (let i = 0; i < mockSummaries.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 2000))
        setSummaries((prev) => [...prev, mockSummaries[i]])
      }

      setIsGenerating(false)
    }

    generateSummaries()
  }, [])

  const handleSaveNote = async (content: string) => {
    const newNote: Note = {
      id: Date.now().toString(),
      content,
      author: currentUser,
      timestamp: new Date(),
    }
    setNotes((prev) => [newNote, ...prev])
  }

  const handleUpdateNote = async (id: string, content: string) => {
    setNotes((prev) => prev.map((note) => (note.id === id ? { ...note, content } : note)))
  }

  const handleInviteCollaborator = () => {
    // TODO: Implement invite modal
    console.log("Opening invite modal")
  }

  const handleExport = async (format: "pdf" | "email" | "link") => {
    console.log("Exporting as:", format)
    await new Promise((resolve) => setTimeout(resolve, 2000))
  }

  const handleRefreshResearch = () => {
    setSummaries([])
    setIsGenerating(true)
    // Trigger research regeneration
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Search className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-balance">{topic}</h1>
                <p className="text-muted-foreground">Research Session • {sessionId}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                <Sparkles className="h-3 w-3 mr-1" />
                {isGenerating ? "Generating..." : "Active"}
              </Badge>
              <Button variant="outline" size="sm" onClick={handleRefreshResearch} disabled={isGenerating}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Summaries */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  AI-Generated Insights
                  {isGenerating && <Loader size="sm" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SummaryList summaries={summaries} isLoading={isGenerating && summaries.length === 0} />
              </CardContent>
            </Card>

            {/* Notes Section */}
            <NotesEditor
              notes={notes}
              onSaveNote={handleSaveNote}
              onUpdateNote={handleUpdateNote}
              currentUser={currentUser}
            />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <CollaboratorList
              collaborators={collaborators}
              onInviteCollaborator={handleInviteCollaborator}
              currentUserId="1"
            />

            <ExportOptions sessionId={sessionId} sessionTitle={topic} onExport={handleExport} />
          </div>
        </div>
      </div>
    </div>
  )
}
