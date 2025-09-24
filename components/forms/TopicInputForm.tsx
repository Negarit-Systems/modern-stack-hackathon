"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader } from "../ui/loader"
import { Search, Sparkles, Users, Mic } from "lucide-react"

interface TopicInputFormProps {
  onSubmit: (topic: string, details?: string, collaborators?: string[]) => Promise<void>
}

export function TopicInputForm({ onSubmit }: TopicInputFormProps) {
  const [topic, setTopic] = useState("")
  const [details, setDetails] = useState("")
  const [collaborators, setCollaborators] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim()) return

    setIsLoading(true)
    try {
      const collaboratorEmails = collaborators
        .split(",")
        .map((email) => email.trim())
        .filter((email) => email.length > 0)

      await onSubmit(topic, details || undefined, collaboratorEmails.length > 0 ? collaboratorEmails : undefined)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          Start Your Research
        </CardTitle>
        <CardDescription>Enter a research topic and let AI transform web data into actionable insights</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Topic Input */}
          <div className="space-y-2">
            <label htmlFor="topic" className="text-sm font-medium text-foreground">
              Research Topic
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="topic"
                type="text"
                placeholder="e.g., Trends in renewable energy, AI in healthcare, Remote work productivity..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-2">
            <label htmlFor="details" className="text-sm font-medium text-foreground">
              Additional Context <span className="text-muted-foreground">(Optional)</span>
            </label>
            <Textarea
              id="details"
              placeholder="Provide specific questions, focus areas, or requirements for your research..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          {/* Collaborators */}
          <div className="space-y-2">
            <label htmlFor="collaborators" className="text-sm font-medium text-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Invite Collaborators <span className="text-muted-foreground">(Optional)</span>
            </label>
            <Input
              id="collaborators"
              type="text"
              placeholder="Enter email addresses separated by commas"
              value={collaborators}
              onChange={(e) => setCollaborators(e.target.value)}
            />
          </div>

          {/* Voice Input Option */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Mic className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Voice Input</p>
                <p className="text-xs text-muted-foreground">Speak your research topic instead</p>
              </div>
            </div>
            <Button type="button" variant="outline" size="sm" disabled>
              Coming Soon
            </Button>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" size="lg" disabled={isLoading || !topic.trim()}>
            {isLoading ? (
              <>
                <Loader size="sm" className="mr-2" />
                Generating Research Session...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Start AI Research
              </>
            )}
          </Button>
        </form>

        {/* Example Topics */}
        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-sm font-medium text-foreground mb-3">Popular Research Topics:</p>
          <div className="flex flex-wrap gap-2">
            {[
              "Climate change solutions",
              "AI ethics and governance",
              "Cryptocurrency trends",
              "Mental health in remote work",
              "Sustainable technology",
            ].map((example) => (
              <Button key={example} variant="outline" size="sm" onClick={() => setTopic(example)} className="text-xs">
                {example}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
