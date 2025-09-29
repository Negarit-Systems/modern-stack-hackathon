"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Plus, Layout, ChevronDown } from "lucide-react";

interface WhiteboardSwitcherProps {
  sessionId: Id<"sessions">;
  activeWhiteboardId: Id<"whiteboards"> | null;
  onWhiteboardChange: (whiteboardId: Id<"whiteboards">) => void;
}

export default function WhiteboardSwitcher({
  sessionId,
  activeWhiteboardId,
  onWhiteboardChange
}: WhiteboardSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  const whiteboards = useQuery(api.crud.whiteboard.getBySession, { sessionId });
  const createWhiteboard = useMutation(api.crud.whiteboard.create);

  const handleCreateWhiteboard = async () => {
    const title = prompt("Enter whiteboard title:");
    if (title) {
      const newWbId = await createWhiteboard({
        sessionId,
        title: title || "Untitled Whiteboard"
      });
      onWhiteboardChange(newWbId);
      setIsOpen(false);
    }
  };

  const activeWhiteboard = whiteboards?.find(wb => wb._id === activeWhiteboardId);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
      >
        <Layout size={16} />
        <span className="max-w-40 truncate">
          {activeWhiteboard?.title || "Select Whiteboard"}
        </span>
        <ChevronDown size={16} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
          <div className="p-2 border-b border-gray-200">
            <button
              onClick={handleCreateWhiteboard}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
            >
              <Plus size={16} />
              Create New Whiteboard
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {whiteboards?.map((whiteboard) => (
              <button
                key={whiteboard._id}
                onClick={() => {
                  onWhiteboardChange(whiteboard._id);
                  setIsOpen(false);
                }}
                className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-left ${
                  whiteboard._id === activeWhiteboardId
                    ? "bg-blue-50 text-blue-600"
                    : "hover:bg-gray-100"
                }`}
              >
                <Layout size={16} />
                <span className="flex-1 truncate">{whiteboard.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}