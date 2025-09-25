"use client";

import React, { useState } from "react";
import { Bot, Send } from "lucide-react";

interface AIAssistantProps {
  onQuery: (query: string) => void;
  loading: boolean;
}

export default function AIAssistant({ onQuery, loading }: AIAssistantProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    onQuery(query);
    setQuery("");
  };

  return (
    <div className="bg-background border border-border rounded-lg p-3">
      <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
        <Bot size={16} className="text-primary" />
        AI Assistant
      </h3>

      <form onSubmit={handleSubmit} className="mb-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 px-2 py-1 text-sm border border-border rounded-md bg-background focus:ring-1 focus:ring-primary focus:border-transparent"
            placeholder="Ask about research..."
          />
          <button
            type="submit"
            disabled={loading}
            className="px-2 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <Send size={14} />
          </button>
        </div>
      </form>
    </div>
  );
}
