"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AIAssistant from "./sidebar/AIAssistant";
import TeamChat from "./sidebar/TeamChat";
import RecentInsights from "./sidebar/RecentInsights";
import { Id } from "@/convex/_generated/dataModel";

interface SidebarProps {
  session: any;
  messages: any[];
  user: any;
  onSendMessage: (message: string) => void;
  onChatbotQuery: (sessionId: Id<"sessions">, prompt: string) => void;
  loading: boolean;
}

export default function Sidebar({
  session,
  messages,
  user,
  onSendMessage,
  onChatbotQuery,
  loading,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={`${collapsed ? "w-16" : "w-120"} transition-all duration-300 border-r border-border bg-card flex flex-col dark:border-slate-700/50 dark:bg-gradient-to-b dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 dark:shadow-2xl`}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-border dark:p-6 dark:border-slate-700/50">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div>
              <h2 className="font-semibold text-sm text-muted-foreground dark:text-lg dark:text-white dark:mb-1">
                Research Session
              </h2>
              <p className="text-xs text-muted-foreground truncate dark:text-sm dark:text-slate-400">
                {session?.title || "Untitled Session"}
              </p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-accent rounded-md transition-colors dark:hover:bg-slate-700/50 dark:rounded-lg dark:transition-all dark:duration-200 dark:text-slate-400 dark:hover:text-white"
          >
            {collapsed ? (
              <ChevronRight size={16} className="dark:size-[18px]" />
            ) : (
              <ChevronLeft size={16} className="dark:size-[18px]" />
            )}
          </button>
        </div>
      </div>

      {/* Sidebar Content */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 dark:p-6 dark:space-y-6 custom-scrollbar">
          <AIAssistant
            onQuery={onChatbotQuery}
            session={session}
            loading={loading}
          />
          <TeamChat />
          <RecentInsights sessionId={session._id} />
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1e293b;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
    </div>
  );
}
