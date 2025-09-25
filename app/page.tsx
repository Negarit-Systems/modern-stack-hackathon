"use client";

import { useState, useEffect } from "react";
import HeroSection from "@/components/homepage/HeroSection";
import ResearchForm from "@/components/homepage/ResearchForm";
import RecentSessions from "@/components/homepage/RecentSessions";

export default function HomePage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Listen for user changes from header authentication
    const handleStorageChange = () => {
      const userData = localStorage.getItem("user");
      if (userData) {
        setUser(JSON.parse(userData));
      } else {
        setUser(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    
    // Custom event for same-page authentication updates
    window.addEventListener("userAuthenticated", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userAuthenticated", handleStorageChange);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <HeroSection />
      <ResearchForm user={user} />
      <RecentSessions user={user} />
    </div>
  );
}
