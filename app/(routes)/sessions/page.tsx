"use client"

import { useRouter } from "next/navigation"
import { Calendar, Users, ArrowRight, Clock, Sparkles, ArrowLeft, Loader2 } from "lucide-react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { authClient } from "@/app/lib/auth.client"
import Link from "next/link"
import { useState } from "react"

export default function SessionsPage() {
  const router = useRouter()
  const authenticatedUser = authClient.useSession()
  const user = authenticatedUser?.data?.user || null

  const getRecentSessions = useQuery(api.crud.session.get, { take: 20 }) // Show more sessions on dedicated page
  const [navigatingToSession, setNavigatingToSession] = useState<string | null>(null)

  // Redirect if not authenticated
  if (!user) {
    router.push("/")
    return null
  }

  const handleJoinSession = async (sessionId: string) => {
    setNavigatingToSession(sessionId)
    // Add a small delay to show the loading state
    setTimeout(() => {
      router.push(`/dashboard/${sessionId}`)
    }, 300)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Clock className="text-primary" size={32} />
              <Sparkles className="text-accent animate-pulse" size={24} />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-2">
              Your Research Sessions
            </h1>
            <p className="text-muted-foreground text-lg">
              Continue where you left off or start something new
            </p>
          </div>
        </div>

        {/* Sessions List */}
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {getRecentSessions && getRecentSessions.length > 0 ? (
              getRecentSessions.map((session: any, index: number) => (
                <div
                  key={session._id}
                  className={`group relative cursor-pointer transition-all duration-200 ${
                    navigatingToSession === session._id ? 'pointer-events-none opacity-75' : ''
                  }`}
                  onClick={() => handleJoinSession(session._id)}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500 animate-gradient-x"></div>

                  <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02] group-hover:border-primary/30">
                    {navigatingToSession === session._id && (
                      <div className="absolute inset-0 bg-card/90 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
                        <div className="flex items-center gap-3 text-primary">
                          <Loader2 size={20} className="animate-spin" />
                          <span className="font-medium">Loading session...</span>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6 flex-1">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors duration-300">
                            <Calendar className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
                              {session.title || "Untitled Session"}
                            </h3>
                            <p className="text-sm text-muted-foreground">Research Session</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 ml-auto mr-4">
                          <div className="p-2 bg-accent/10 rounded-xl group-hover:bg-accent/20 transition-colors duration-300">
                            <Users className="w-5 h-5 text-accent" />
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-medium text-foreground">
                              {session.participants?.length || 1}
                            </span>
                            <p className="text-xs text-muted-foreground">
                              {(session.participants?.length || 1) === 1 ? "participant" : "participants"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-2 bg-muted/30 rounded-xl group-hover:bg-primary/10 transition-all duration-300">
                        {navigatingToSession === session._id ? (
                          <Loader2 size={20} className="text-muted-foreground animate-spin" />
                        ) : (
                          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                        )}
                      </div>
                    </div>

                    <div className="mt-4 h-1 bg-muted/30 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-accent w-0 group-hover:w-full transition-all duration-1000 ease-out"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-muted/20 to-muted/10 rounded-2xl blur opacity-50"></div>
                <div className="relative bg-card/50 backdrop-blur-xl border border-border/30 rounded-2xl p-12 text-center">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Clock className="text-muted-foreground/50" size={48} />
                    <Sparkles className="text-muted-foreground/30" size={32} />
                  </div>
                  <h3 className="text-xl font-medium text-muted-foreground mb-2">No sessions found</h3>
                  <p className="text-sm text-muted-foreground/70">
                    Start your first research session to see it here
                  </p>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
                  >
                    <Sparkles size={16} />
                    Start Researching
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}