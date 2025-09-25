"use client";

import { Brain, Sparkles, Zap, Users, Search } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Brain className="text-primary" size={32} />
          <Sparkles className="text-primary" size={24} />
        </div>

        <h1 className="text-5xl font-bold mb-6 text-balance">
          Your AI-Powered
          <span className="text-primary"> Research Hub</span>
        </h1>

        <p className="text-xl text-muted-foreground mb-12 text-pretty max-w-2xl mx-auto">
          Streamline research with AI insights and real-time collaboration. Transform web data into actionable
          intelligence with your team.
        </p>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-card border border-border rounded-lg p-6">
            <Zap className="text-primary mx-auto mb-4" size={32} />
            <h3 className="font-semibold mb-2">AI-Powered Insights</h3>
            <p className="text-sm text-muted-foreground">
              Generate summaries and insights from web data automatically
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <Users className="text-primary mx-auto mb-4" size={32} />
            <h3 className="font-semibold mb-2">Real-time Collaboration</h3>
            <p className="text-sm text-muted-foreground">
              Work together with your team in real-time with comments and chat
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <Search className="text-primary mx-auto mb-4" size={32} />
            <h3 className="font-semibold mb-2">Smart Research</h3>
            <p className="text-sm text-muted-foreground">
              Upload documents and get AI-powered analysis and recommendations
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
