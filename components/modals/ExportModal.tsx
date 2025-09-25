"use client";

import React, { useState } from "react";
import { X, Download, Mail, FileText, Eye } from "lucide-react";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: any;
  document: string;
  summaries: any[];
  comments: any[];
}

export default function ExportModal({ 
  isOpen, 
  onClose, 
  session, 
  document, 
  summaries, 
  comments 
}: ExportModalProps) {
  const [exportFormat, setExportFormat] = useState("pdf");
  const [includeComments, setIncludeComments] = useState(true);
  const [includeSummaries, setIncludeSummaries] = useState(true);
  const [emailRecipients, setEmailRecipients] = useState("");
  const [loading, setLoading] = useState(false);

  const handleExport = async (action: "download" | "email") => {
    setLoading(true);
    
    try {
      // Mock export functionality
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (action === "email" && emailRecipients) {
        console.log("Sending report via email to:", emailRecipients);
        alert(`Report sent to: ${emailRecipients}`);
      } else if (action === "download") {
        console.log("Downloading report as:", exportFormat);
        alert(`Report downloaded as ${exportFormat.toUpperCase()}`);
      }
      
      onClose();
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileText size={20} />
            Export Research Report
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-md transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Export Options */}
          <div className="w-1/3 p-6 border-r border-border">
            <h3 className="font-semibold mb-4">Export Options</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Format</label>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="pdf">PDF</option>
                  <option value="docx">Word Document</option>
                  <option value="html">HTML</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={includeSummaries}
                    onChange={(e) => setIncludeSummaries(e.target.checked)}
                    className="rounded border-border"
                  />
                  <span className="text-sm">Include AI Summaries</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={includeComments}
                    onChange={(e) => setIncludeComments(e.target.checked)}
                    className="rounded border-border"
                  />
                  <span className="text-sm">Include Comments</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email Recipients (Optional)</label>
                <textarea
                  value={emailRecipients}
                  onChange={(e) => setEmailRecipients(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter email addresses separated by commas"
                  rows={3}
                />
              </div>

              <div className="flex flex-col gap-2 pt-4">
                <button
                  onClick={() => handleExport("download")}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  <Download size={16} />
                  {loading ? "Generating..." : "Download"}
                </button>
                
                {emailRecipients && (
                  <button
                    onClick={() => handleExport("email")}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 disabled:opacity-50 transition-colors"
                  >
                    <Mail size={16} />
                    {loading ? "Sending..." : "Send via Email"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center gap-2 mb-4">
              <Eye size={16} className="text-primary" />
              <h3 className="font-semibold">Report Preview</h3>
            </div>

            <div className="bg-background border border-border rounded-lg p-6 space-y-6">
              {/* Header */}
              <div className="text-center border-b border-border pb-4">
                <h1 className="text-2xl font-bold mb-2">{session?.topic}</h1>
                <p className="text-muted-foreground">
                  Research Report • Generated on {new Date().toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Collaborators: {session?.collaborators?.join(", ") || "N/A"}
                </p>
              </div>

              {/* Document Content */}
              <div>
                <h2 className="text-lg font-semibold mb-3">Research Document</h2>
                <div className="prose prose-sm max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: document || "No content available" }} />
                </div>
              </div>

              {/* AI Summaries */}
              {includeSummaries && summaries.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-3">AI-Generated Summaries</h2>
                  <div className="space-y-3">
                    {summaries.map((summary) => (
                      <div key={summary.id} className="bg-muted/30 p-3 rounded-md">
                        <p className="text-sm mb-1">{summary.content}</p>
                        <p className="text-xs text-muted-foreground">Source: {summary.source}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments */}
              {includeComments && comments.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-3">Comments & Feedback</h2>
                  <div className="space-y-2">
                    {comments.map((comment) => (
                      <div key={comment.id} className="bg-muted/30 p-3 rounded-md">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{comment.userName}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
