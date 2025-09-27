"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bot, Loader2, Send } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import ReactMarkdown from "react-markdown";

interface AIAssistantProps {
  onQuery: (sessionId: Id<"sessions">, prompt: string) => void;
  session: any;
  loading?: boolean;
}

interface ChatMessage {
  id: string;
  prompt?: string;
  response?: string;
  pending?: boolean; // only for frontend
}

export default function AIAssistant({ onQuery, session, loading }: AIAssistantProps) {
  const getChatbotHistory = useQuery(api.crud.chatbot.get, {
    sessionId: session._id,
  }) || [];

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [query, setQuery] = useState("");

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, getChatbotHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      prompt: query,
      pending: true,
    };

    // Add user's message immediately
    setMessages((prev) => [...prev, userMessage]);
    setQuery("");

    try {
      onQuery(session._id, query);
    } catch (err) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === userMessage.id
            ? { ...msg, response: "Error fetching response", pending: false }
            : msg
        )
      );
    }
  };

  const renderMessages = () => {
    const combinedMessages = [
      ...getChatbotHistory.map((chat) => ({
        id: chat._id,
        prompt: chat.prompt,
        response: chat.response,
      })),
    ];

    if (combinedMessages.length === 0) {
      return (
        <div className="p-4 text-center text-sm text-gray-500">
          No messages yet...
        </div>
      );
    }

    return (
      <div
        ref={chatContainerRef}
        className="h-96 overflow-y-auto p-2 flex flex-col gap-2"
      >
        {combinedMessages.map((chat) => (
          <React.Fragment key={chat.id}>
            {chat.prompt && (
              <div className="flex justify-end">
                <div className="bg-blue-500 text-white rounded-lg p-3 max-w-[80%] break-words shadow-md">
                  {chat.prompt}
                </div>
              </div>
            )}
            {chat.response || (chat as ChatMessage).pending ? (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-800 rounded-lg p-3 max-w-[80%] break-words shadow-md">
                  {(chat as ChatMessage).pending ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <ReactMarkdown>{chat.response!}</ReactMarkdown>
                  )}
                </div>
              </div>
            ) : null}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-background border border-border rounded-lg p-3 flex flex-col gap-3">
      <h3 className="font-semibold flex items-center gap-2 text-sm">
        <Bot size={16} className="text-primary" /> AI Assistant
      </h3>

      <div id="chat-history" className="flex-1">{renderMessages()}</div>

      <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
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
      </form>
    </div>
  );
}