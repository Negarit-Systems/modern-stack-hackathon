"use client";

import { UserPlus, Download } from "lucide-react";

interface DashboardHeaderProps {
  session: any;
  collaborators: any[];
  onInvite: () => void;
  onExport: () => void;
}

export default function DashboardHeader({ session, collaborators, onInvite, onExport }: DashboardHeaderProps) {
  return (
    <div className="border-b border-border bg-card px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-balance">{session?.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
            <span>Research Session • {session?._creationTime ? new Date(session._creationTime).toLocaleDateString() : 'Unknown date'}</span>
            <span>Auto-saved • Last sync: {new Date().toLocaleTimeString()}</span>
            <div className="flex items-center gap-2">
              {collaborators
                .filter((c) => c.status === "active")
                .map((collab) => (
                  <div key={collab.id} className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>{collab.name.split(" ")[0]}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onInvite}
            className="flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors text-sm"
          >
            <UserPlus size={16} />
            Invite
          </button>
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>
    </div>
  );
}
