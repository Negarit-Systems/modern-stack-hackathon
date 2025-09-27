"use client";

import { useRouter } from "next/navigation";
import { Calendar, Users, ArrowRight } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface RecentSessionsProps {
  user: any;
}

export default function RecentSessions({ user }: RecentSessionsProps) {
  const router = useRouter();
  const getRecentSessions = useQuery(api.crud.session.get, {take: 5});

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
        <div className="space-y-4">
          {getRecentSessions && getRecentSessions.length > 0 ? (
            getRecentSessions.map((session: any) => (
              <div
                key={session._id}
                className="flex items-center justify-between bg-white rounded-lg shadow p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleJoinSession(session._id)}
              >
                <div className="flex items-center gap-4">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">{session.title || "Untitled Session"}</span>
                  <Users className="w-5 h-5 text-gray-500 ml-4" />
                  <span className="text-sm text-gray-600">{session.participants?.length || 1} participants</span>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              No recent sessions found.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
