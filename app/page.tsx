"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Users, FileText, Zap, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Navbar } from "@/components/layout-components/Navbar"
import { TopicInputForm } from "@/components/forms/TopicInputForm"

export default function HomePage() {
  const router = useRouter()

  const handleTopicSubmit = async (topic: string, details?: string, collaborators?: string[]) => {
    // TODO: Create research session and redirect to dashboard
    console.log("Creating research session:", { topic, details, collaborators })

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Redirect to dashboard with session data
    router.push(`/dashboard?topic=${encodeURIComponent(topic)}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 px-4 grid-pattern">
        <div className="absolute inset-0 gradient-bg" />
        <div className="relative z-10 container mx-auto text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold text-balance">
                Transform web data into <span className="text-primary">AI-powered insights</span>
              </h1>
              <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto leading-relaxed">
                ResearchAI streamlines team research by automatically collecting, analyzing, and summarizing web data
                with real-time collaboration.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="#start-research">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="pt-8">
              <p className="text-sm text-muted-foreground mb-4">Trusted by research teams at</p>
              <div className="flex items-center justify-center gap-8 opacity-60">
                <div className="text-lg font-semibold">Stanford</div>
                <div className="text-lg font-semibold">MIT</div>
                <div className="text-lg font-semibold">Google</div>
                <div className="text-lg font-semibold">Microsoft</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Research faster with AI</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Stop spending hours on manual research. Let AI do the heavy lifting while your team focuses on insights.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="pt-6">
                <Search className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Smart Web Scraping</h3>
                <p className="text-sm text-muted-foreground">
                  Automatically collect relevant data from across the web using advanced crawling technology.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">AI Summarization</h3>
                <p className="text-sm text-muted-foreground">
                  Get concise, actionable insights generated from collected data using cutting-edge AI.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Real-time Collaboration</h3>
                <p className="text-sm text-muted-foreground">
                  Work together seamlessly with live editing, comments, and shared research sessions.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Export & Share</h3>
                <p className="text-sm text-muted-foreground">
                  Generate professional reports and share findings via email or save to your profile.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How it works</h2>
            <p className="text-xl text-muted-foreground">From topic to insights in minutes, not hours</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">Enter Your Topic</h3>
              <p className="text-muted-foreground">
                Simply describe what you want to research and optionally invite team members.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">AI Does the Work</h3>
              <p className="text-muted-foreground">
                Our AI scrapes relevant websites and generates comprehensive summaries with source links.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">Collaborate & Export</h3>
              <p className="text-muted-foreground">
                Review insights with your team, add notes, and export professional research reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Research Input Section */}
      <section id="start-research" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to start researching?</h2>
            <p className="text-xl text-muted-foreground">Enter your research topic and let AI do the heavy lifting</p>
          </div>

          <TopicInputForm onSubmit={handleTopicSubmit} />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <Search className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">ResearchAI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered research copilot for teams building the future.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/features" className="hover:text-foreground">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-foreground">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/integrations" className="hover:text-foreground">
                    Integrations
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/about" className="hover:text-foreground">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-foreground">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="hover:text-foreground">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/help" className="hover:text-foreground">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-foreground">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 ResearchAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
