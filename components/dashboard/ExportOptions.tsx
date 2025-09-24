"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader } from "@/components/ui/loader"
import { Download, Mail, FileText, Share2 } from "lucide-react"

interface ExportOptionsProps {
  sessionId: string
  sessionTitle: string
  onExport: (format: "pdf" | "email" | "link") => Promise<void>
}

export function ExportOptions({ sessionId, sessionTitle, onExport }: ExportOptionsProps) {
  const [exportingFormat, setExportingFormat] = useState<string | null>(null)

  const handleExport = async (format: "pdf" | "email" | "link") => {
    setExportingFormat(format)
    try {
      await onExport(format)
    } finally {
      setExportingFormat(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Export & Share
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          <Button
            variant="outline"
            className="justify-start h-auto p-4 bg-transparent"
            onClick={() => handleExport("pdf")}
            disabled={exportingFormat === "pdf"}
          >
            <div className="flex items-center gap-3">
              {exportingFormat === "pdf" ? <Loader size="sm" /> : <FileText className="h-5 w-5 text-red-500" />}
              <div className="text-left">
                <p className="font-medium">Download PDF Report</p>
                <p className="text-sm text-muted-foreground">
                  Generate a formatted research report with all summaries and sources
                </p>
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="justify-start h-auto p-4 bg-transparent"
            onClick={() => handleExport("email")}
            disabled={exportingFormat === "email"}
          >
            <div className="flex items-center gap-3">
              {exportingFormat === "email" ? <Loader size="sm" /> : <Mail className="h-5 w-5 text-blue-500" />}
              <div className="text-left">
                <p className="font-medium">Email Report</p>
                <p className="text-sm text-muted-foreground">
                  Send a polished research summary to your email or team members
                </p>
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="justify-start h-auto p-4 bg-transparent"
            onClick={() => handleExport("link")}
            disabled={exportingFormat === "link"}
          >
            <div className="flex items-center gap-3">
              {exportingFormat === "link" ? <Loader size="sm" /> : <Download className="h-5 w-5 text-green-500" />}
              <div className="text-left">
                <p className="font-medium">Share Link</p>
                <p className="text-sm text-muted-foreground">Generate a shareable link to this research session</p>
              </div>
            </div>
          </Button>
        </div>

        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Session ID: <code className="bg-muted px-1 py-0.5 rounded text-xs">{sessionId}</code>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
