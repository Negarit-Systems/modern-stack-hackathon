"use client";

import { useRouter } from "next/navigation";
import { Calendar, Users, ArrowRight } from "lucide-react";
import { mockSessions } from "@/lib/mockData";

interface RecentSessionsProps {
  user: any;
}

export default function RecentSessions({ user }: RecentSessionsProps) {
  const router = useRouter();

  const handleJoinSession = (sessionId: string) => {
    router.push(`/dashboard/${sessionId}`);
  };

  if (!user) {
    return null;
  }

  return (
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
  );
}
