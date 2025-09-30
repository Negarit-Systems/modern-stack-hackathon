"use client";

import { UserPlus, Download } from "lucide-react";

interface DashboardHeaderProps {
  session: any;
  collaborators: any[];
  onInvite: () => void;
  onExport: () => void;
}

const colors = [
  "bg-blue-500",
  "bg-green-500",
  "bg-red-500",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-orange-500",
  "bg-teal-500",
];

export default function DashboardHeader({ session, collaborators, onInvite, onExport }: DashboardHeaderProps) {
  console.log("DashboardHeader session:", session);
  console.log("DashboardHeader collaborators:", collaborators);
  return (
    <div className="border-b border-border bg-card px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-balance">{session?.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
            <span>Research Session • {session?._creationTime ? new Date(session._creationTime).toLocaleDateString() : 'Unknown date'}</span>
            <span>Auto-saved • Last sync: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
            {collaborators.map((collab) => {
              const firstChar = collab.name?.[0]?.toUpperCase() || "A";
              const colorIndex = Math.floor(Math.random() * colors.length);
              const circleColor = colors[colorIndex];

              return (
              <div
                key={collab._id}
                className="relative flex items-center gap-1 group"
              >
                <div
                className={`w-7 h-7 flex items-center justify-center rounded-full text-white font-bold text-sm ${circleColor} cursor-pointer`}
                >
                {firstChar}
                </div>
                <div className="absolute left-0 top-8 z-10 hidden group-hover:flex flex-col bg-card border border-border rounded-md px-3 py-2 shadow-lg min-w-max">
                <span className="font-semibold">{collab.name}</span>
                <span className="text-muted-foreground text-xs">{collab.email}</span>
                </div>
              </div>
              );
            })}
            </div>
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
