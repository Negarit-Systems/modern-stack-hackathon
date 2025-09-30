"use client"

import { useRouter } from "next/navigation"
import { Calendar, Users, ArrowRight, Clock, Sparkles } from "lucide-react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

interface RecentSessionsProps {
  user: any
}

export default function RecentSessions({ user }: RecentSessionsProps) {
  const router = useRouter()
  const getRecentSessions = useQuery(api.crud.session.get, { take: 5 })

  const handleJoinSession = (sessionId: string) => {
    router.push(`/dashboard/${sessionId}`)
  }

  return (
    <section className="container mx-auto px-4 pb-16 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-20 w-20 h-20 bg-accent/5 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-10 left-20 w-16 h-16 bg-primary/5 rounded-full blur-lg animate-float-delayed"></div>
      </div>

      <div className="max-w-4xl mx-auto relative">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Clock className="text-primary" size={24} />
            <Sparkles className="text-accent animate-pulse" size={18} />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-2">
            Recent Research Sessions
          </h2>
          <p className="text-muted-foreground">Continue where you left off</p>
        </div>

        <div className="space-y-4">
          {getRecentSessions && getRecentSessions.length > 0 ? (
            getRecentSessions.map((session: any, index: number) => (
              <div
                key={session._id}
                className="group relative cursor-pointer"
                onClick={() => handleJoinSession(session._id)}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500 animate-gradient-x"></div>

                <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02] group-hover:border-primary/30">
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
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
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
                  <Clock className="text-muted-foreground/50" size={32} />
                  <Sparkles className="text-muted-foreground/30" size={24} />
                </div>
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No recent sessions found</h3>
                <p className="text-sm text-muted-foreground/70">
                  Start your first research session above to get started
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
