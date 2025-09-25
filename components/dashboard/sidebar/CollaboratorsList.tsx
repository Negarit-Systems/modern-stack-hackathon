"use client";

import { Users } from "lucide-react";

interface CollaboratorsListProps {
  collaborators: any[];
}

export default function CollaboratorsList({ collaborators }: CollaboratorsListProps) {
  return (
    <div className="bg-background border border-border rounded-lg p-3">
      <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
        <Users size={16} className="text-primary" />
        Collaborators
      </h3>

      <div className="space-y-2">
        {collaborators.map((collaborator) => (
          <div key={collaborator.id} className="flex items-center gap-2">
            <div className="relative">
              <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center text-xs font-medium">
                {collaborator.name.charAt(0)}
              </div>
              <div
                className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-card ${
                  collaborator.status === "active" ? "bg-green-500" : "bg-gray-400"
                }`}
              ></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{collaborator.name}</p>
              <p className="text-xs text-muted-foreground truncate">{collaborator.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
