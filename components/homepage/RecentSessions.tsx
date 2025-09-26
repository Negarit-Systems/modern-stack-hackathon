"use client";

import { useRouter } from "next/navigation";
import { Calendar, Users, ArrowRight } from "lucide-react";

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


      </div>
    </section>
  );
}
