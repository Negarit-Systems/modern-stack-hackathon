"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, Sparkles, Zap, Users, Search, ArrowRight, Play, Star } from "lucide-react"
import { TypewriterEffect } from "@/components/ui/typewriter-effect"
import { FlipWords } from "@/components/ui/flip-words"
import dynamic from "next/dynamic"

const Player = dynamic(() => import("@lottiefiles/react-lottie-player").then((mod) => mod.Player), {
  ssr: false,
  loading: () => (
    <div className="w-[400px] h-[400px] bg-muted/20 rounded-2xl animate-pulse border border-border/50 flex items-center justify-center">
      <Brain className="w-16 h-16 text-primary animate-pulse" />
    </div>
  ),
})

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 grid-bg opacity-20"></div>

      {/* Gradient Orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Announcement Badge */}
          <div className="flex justify-center mb-8 animate-fade-in">
            <Badge
              variant="secondary"
              className="px-4 py-2 text-sm font-medium bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {"New: AI-powered insights now available"}
            </Badge>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="text-left space-y-8 animate-fade-in-up">
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  The fastest and most
                  <span className="text-primary bg-clip-text">
                    <FlipWords words={["powerful", "Reliable"]} duration={3000} className="text-primary" />
                  </span>{" "}
                  research platform
                </h1>

                <p className="text-xl text-muted-foreground text-pretty max-w-xl leading-relaxed">
                  Transform web data into actionable intelligence with AI-powered insights and real-time collaboration.
                  Built for teams that move fast.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold glow-animation"
                >
                  Start your research
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>

                {/* <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-4 text-lg font-semibold border-border hover:bg-accent bg-transparent"
                >
                  <Play className="mr-2 w-5 h-5" />
                  Watch demo
                </Button> */}
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">Trusted by 10,000+ research teams</p>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative">
                {/* Floating Animation Container */}
                <div className="float-animation">
                  <Player
                    autoplay
                    loop
                    src="/animations/business-group-meeting.json"
                    style={{ height: "400px", width: "400px" }}
                    className="drop-shadow-2xl"
                  />
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 bg-card border border-border rounded-xl p-3 shadow-lg animate-bounce delay-500">
                  <Brain className="w-6 h-6 text-primary" />
                </div>

                <div className="absolute -bottom-4 -left-4 bg-card border border-border rounded-xl p-3 shadow-lg animate-bounce delay-1000">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mt-24 animate-fade-in-up animation-delay-500">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Everything you need to research faster</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Powerful features designed for modern research teams
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="group bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 hover:bg-card/80 transition-all duration-300 hover:scale-105">
                <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <Zap className="text-primary w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">AI-Powered Insights</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Generate comprehensive summaries and actionable insights from any web data automatically with advanced
                  AI models.
                </p>
              </div>

              <div className="group bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 hover:bg-card/80 transition-all duration-300 hover:scale-105">
                <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <Users className="text-primary w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Real-time Collaboration</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Work seamlessly with your team in real-time with integrated comments, chat, and shared workspaces.
                </p>
              </div>

              <div className="group bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 hover:bg-card/80 transition-all duration-300 hover:scale-105">
                <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <Search className="text-primary w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Smart Research</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Upload documents and get AI-powered analysis, recommendations, and intelligent search across all your
                  data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
