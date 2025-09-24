"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Sparkles, Clock, TrendingUp } from "lucide-react"

interface Summary {
  id: string
  title: string
  content: string
  sources: Array<{
    url: string
    title: string
    domain: string
  }>
  confidence: "high" | "medium" | "low"
  timestamp: Date
}

interface SummaryListProps {
  summaries: Summary[]
  isLoading?: boolean
}

export function SummaryList({ summaries, isLoading = false }: SummaryListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-5/6" />
                <div className="h-3 bg-muted rounded w-4/6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (summaries.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No summaries yet</h3>
          <p className="text-muted-foreground">
            AI is analyzing web data to generate insights for your research topic.
          </p>
        </CardContent>
      </Card>
    )
  }

  const getConfidenceColor = (confidence: Summary["confidence"]) => {
    switch (confidence) {
      case "high":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "low":
        return "bg-red-500/10 text-red-500 border-red-500/20"
    }
  }

  return (
    <div className="space-y-6">
      {summaries.map((summary) => (
        <Card key={summary.id} className="group hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg leading-tight">{summary.title}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={getConfidenceColor(summary.confidence)}>
                  {summary.confidence} confidence
                </Badge>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  {summary.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">{summary.content}</p>

            {/* Sources */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Sources ({summary.sources.length})
              </h4>
              <div className="grid gap-2">
                {summary.sources.map((source, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{source.title}</p>
                      <p className="text-xs text-muted-foreground">{source.domain}</p>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={source.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
