"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Plus, Layout, ChevronDown, X } from "lucide-react";

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
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const whiteboards = useQuery(api.crud.whiteboard.getBySession, { sessionId });
  const createWhiteboard = useMutation(api.crud.whiteboard.create);

  const handleCreateWhiteboard = async () => {
    if (!newTitle.trim()) return;
    const newDocId = await createWhiteboard({
      sessionId,
      title: newTitle.trim(),
    });
    onWhiteboardChange(newDocId);
    setIsCreating(false);
    setNewTitle("");
    setIsOpen(false);
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
        <div className="absolute top-full right-0 mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
          <div className="p-2 border-b border-gray-200">
            {!isCreating ? (
              <button
                onClick={() => setIsCreating(true)}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
              >
                <Plus size={16} />
                Create New Whiteboard
              </button>
           ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsCreating(false);
                  setNewTitle("");
                }}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <X size={12} />
              </button>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Title"
                className="w-38 px-1 py-1 border rounded-md text-sm"
              />
              <button
                onClick={handleCreateWhiteboard}
                className="px-2 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Save
              </button>

            </div>
            )}
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