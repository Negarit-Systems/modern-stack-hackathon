"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AIAssistant from "./sidebar/AIAssistant";
import TeamChat from "./sidebar/TeamChat";
import CollaboratorsList from "./sidebar/CollaboratorsList";
import RecentInsights from "./sidebar/RecentInsights";
import { Id } from "@/convex/_generated/dataModel";

interface SidebarProps {
  session: any;
  messages: any[];
  collaborators: any[];
  user: any;
  onSendMessage: (message: string) => void;
  onChatbotQuery: (sessionId: Id<"sessions">, prompt: string) => void;
  onFileUpload: (files: FileList) => void;
  loading: boolean;
}

export default function Sidebar({
  session,
  messages,
  collaborators,
  user,
  onSendMessage,
  onChatbotQuery,
  onFileUpload,
  loading,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={`${collapsed ? "w-16" : "w-120"} transition-all duration-300 border-r border-border bg-card flex flex-col`}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div>
              <h2 className="font-semibold text-sm text-muted-foreground">Research Session</h2>
              <p className="text-xs text-muted-foreground truncate">{session?.topic}</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-accent rounded-md transition-colors"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </div>

      {/* Sidebar Content */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AIAssistant onQuery={onChatbotQuery} session={session} loading={loading} />
          <TeamChat messages={messages} onSendMessage={onSendMessage} user={user} />
          <CollaboratorsList collaborators={collaborators} />
          <RecentInsights
            sessionId={session?._id}
          />
        </div>
      )}
    </div>
  );
}
