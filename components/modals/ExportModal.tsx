"use client";

import React, { useState } from "react";
import { X, Download, Mail, FileText, Eye, CheckCircle, AlertCircle, Trash2, Plus } from "lucide-react";
import { generatePDF } from "@/lib/generate-pdf";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: any;
  document: string;
}

export default function ExportModal({
  isOpen,
  onClose,
  session,
  document,
}: ExportModalProps) {
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleDownload = async () => {
    setPdfLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      generatePDF(session, document);
      onClose();
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setPdfLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
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
          {/* Preview */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Eye size={16} className="text-primary" />
                <h3 className="font-semibold">Report Preview</h3>
              </div>
              <button
                onClick={handleDownload}
                disabled={pdfLoading}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Download size={16} />
                {pdfLoading ? "Downloading..." : "Download PDF"}
              </button>
            </div>

            <div className="bg-background border border-border rounded-lg p-6 space-y-6">
              {/* Header */}
              <div className="text-center border-b border-border pb-4">
                <h1 className="text-2xl font-bold mb-2">{session?.topic}</h1>
                <p className="text-muted-foreground">
                  Research Report • Generated on {new Date().toLocaleDateString()}
                </p>
              </div>

              {/* Document Content */}
              <div>
                <h2 className="text-lg font-semibold mb-3">Research Document</h2>
                <div className="prose prose-sm max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: document || "No content available" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
