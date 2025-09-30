"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Users, ArrowRight, X, Sparkles, Brain } from "lucide-react"
import { api } from "@/convex/_generated/api"
import { useMutation } from "convex/react"

interface ResearchFormProps {
  user: any
}

export default function ResearchForm({ user }: ResearchFormProps) {
  const createResearchSession = useMutation(api.crud.session.create)

  const router = useRouter()
  const [topic, setTopic] = useState("")
  const [collaborators, setCollaborators] = useState<string[]>([""])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      setError("Please sign in to start a research session")
      return
    }

    if (!topic.trim()) {
      setError("Please enter a research topic")
      return
    }

    setLoading(true)
    setError("")
    try {
      const collaboratorEmails = collaborators.map((c) => c.trim()).filter((c) => c)
      const sessionId = await createResearchSession({
        item: {
          title: topic,
          creatorId: user.id,
          collaboratorIds: [user.id, ...collaboratorEmails],
          status: "active",
        },
      })
      // Navigate after session creation
      router.push(`/dashboard/${sessionId}`)
    } catch (err) {
      console.error("Error creating research session:", err)
      setError("Failed to create research session. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="container mx-auto px-4 pb-16 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-accent/10 rounded-full blur-lg animate-float-delayed"></div>
      </div>

      <div className="max-w-2xl mx-auto relative">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-accent to-primary rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200 animate-gradient-x"></div>
          <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Brain className="text-primary animate-pulse" size={28} />
                <Sparkles className="text-accent" size={20} />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Start Your Research
              </h2>
              <p className="text-muted-foreground mt-2">Transform ideas into insights with AI-powered research</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-foreground/90">Research Topic</label>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                  <div className="relative">
                    <Search
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground group-hover:text-primary transition-colors duration-200"
                      size={20}
                    />
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border border-border/50 rounded-xl bg-background/50 backdrop-blur-sm focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 placeholder:text-muted-foreground/60 hover:border-border"
                      placeholder="e.g., Trends in renewable energy, AI in healthcare..."
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-semibold text-foreground/90">Collaborators (Optional)</label>
                <div className="space-y-3">
                  {collaborators.map((collaborator, index) => (
                    <div key={index} className="flex items-center gap-3 group">
                      <div className="relative flex-grow">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/10 to-primary/10 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                        <div className="relative">
                          <Users
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground group-hover:text-accent transition-colors duration-200"
                            size={18}
                          />
                          <input
                            type="email"
                            value={collaborator}
                            onChange={(e) => {
                              const newCollaborators = [...collaborators]
                              newCollaborators[index] = e.target.value
                              setCollaborators(newCollaborators)
                            }}
                            className="w-full pl-12 pr-4 py-3 border border-border/50 rounded-lg bg-background/50 backdrop-blur-sm focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all duration-200 placeholder:text-muted-foreground/60 hover:border-border"
                            placeholder={`Collaborator ${index + 1} email`}
                          />
                        </div>
                      </div>
                      {collaborators.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newCollaborators = collaborators.filter((_, i) => i !== index)
                            setCollaborators(newCollaborators)
                          }}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-200 hover:scale-105"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setCollaborators([...collaborators, ""])}
                  className="text-sm text-primary hover:text-primary/80 font-medium transition-colors duration-200 hover:underline"
                >
                  + Add another collaborator
                </button>
              </div>

              {error && (
                <div className="text-destructive text-sm bg-destructive/10 border border-destructive/20 p-4 rounded-xl backdrop-blur-sm animate-shake">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading || !user} className="w-full relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary bg-size-200 bg-pos-0 hover:bg-pos-100 transition-all duration-500 rounded-xl"></div>
                <div className="relative bg-primary hover:bg-transparent text-primary-foreground py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 font-semibold group-hover:scale-[1.02] group-active:scale-[0.98]">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                      Creating Session...
                    </>
                  ) : (
                    <>
                      Start Research
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-200" />
                    </>
                  )}
                </div>
              </button>

              {!user && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg border border-border/30">
                    Please sign in to start a research session
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
