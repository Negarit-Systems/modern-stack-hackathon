"use client";

import HeroSection from "@/components/homepage/HeroSection";
import ResearchForm from "@/components/homepage/ResearchForm";
import RecentSessions from "@/components/homepage/RecentSessions";
import { authClient } from "./lib/auth.client";

export default function HomePage() {
  const authenticatedUser = authClient.useSession();
  const user = authenticatedUser?.data?.user || null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <HeroSection />
      <ResearchForm user={user} />
      <RecentSessions user={user} />
    </div>
  );
}
