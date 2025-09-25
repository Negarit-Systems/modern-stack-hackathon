"use client";

import { ExternalLink, Upload } from "lucide-react";

interface RecentInsightsProps {
  summaries: any[];
  onFileUpload: (files: FileList) => void;
}

export default function RecentInsights({ summaries, onFileUpload }: RecentInsightsProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      onFileUpload(files);
    }
  };

  return (
    <div className="bg-background border border-border rounded-lg p-3">
      <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
        <ExternalLink size={16} className="text-primary" />
        Recent Insights
      </h3>

      <div className="space-y-2">
        {summaries.slice(0, 2).map((summary) => (
          <div key={summary.id} className="p-2 bg-muted/30 rounded-md">
            <p className="text-xs text-muted-foreground line-clamp-2">{summary.content}</p>
            <p className="text-xs text-muted-foreground mt-1">{summary.source}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mt-3">
        <label className="flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 transition-colors text-xs">
          <Upload size={12} />
          Upload
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt"
          />
        </label>
      </div>
    </div>
  );
}
