"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Plus, FileText, ChevronDown, X } from "lucide-react";

interface DocumentSwitcherProps {
  sessionId: Id<"sessions">;
  activeDocumentId: Id<"documents"> | null;
  onDocumentChange: (documentId: Id<"documents">) => void;
}

export default function DocumentSwitcher({
  sessionId,
  activeDocumentId,
  onDocumentChange,
}: DocumentSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const documents = useQuery(api.crud.document.getBySession, { sessionId });
  const createDocument = useMutation(api.crud.document.create);

  const handleCreateDocument = async () => {
    if (!newTitle.trim()) return;
    const newDocId = await createDocument({
      sessionId,
      title: newTitle.trim(),
    });
    onDocumentChange(newDocId);
    setIsCreating(false);
    setNewTitle("");
    setIsOpen(false);
  };

  const activeDocument = documents?.find((doc) => doc._id === activeDocumentId);

  return (
    <div className="relative">
      {/* Switcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
      >
        <FileText size={16} />
        <span className="max-w-40 truncate">
          {activeDocument?.title || "Select Document"}
        </span>
        <ChevronDown size={16} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
          <div className="p-2 border-b border-gray-200">
            {!isCreating ? (
              <button
                onClick={() => setIsCreating(true)}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
              >
                <Plus size={16} />
                Create New Document
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
                  <X size={16} />
                </button>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Document title"
                  className="w-38 px-1 py-1 border rounded-md text-sm"
                />
                <button
                  onClick={handleCreateDocument}
                  className="px-2 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            )}
          </div>

          <div className="max-h-60 overflow-y-auto">
            {documents?.map((document) => (
              <button
                key={document._id}
                onClick={() => {
                  onDocumentChange(document._id);
                  setIsOpen(false);
                }}
                className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-left ${
                  document._id === activeDocumentId
                    ? "bg-blue-50 text-blue-600"
                    : "hover:bg-gray-100"
                }`}
              >
                <FileText size={16} />
                <span className="flex-1 truncate">{document.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
