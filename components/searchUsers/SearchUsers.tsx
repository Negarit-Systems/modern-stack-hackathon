"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useParams } from "next/navigation";
import Image from "next/image";
import SafeImage from "./SafeImage";

export interface Collaborator {
  _id: string;
  email: string;
  name?: string;
  image?: string;
}

export default function MessageInput() {
  const [text, setText] = useState("");
  const [mentionSearch, setMentionSearch] = useState("");
  const [isMentioning, setIsMentioning] = useState(false);
  const [mentionPosition, setMentionPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mentionListRef = useRef<HTMLUListElement>(null);

  const sId = useParams<{ sessionId: string }>() as { sessionId: string };
  const sessionId = sId.sessionId as Id<"sessions">;

  const result = useQuery(
    api.crud.users.searchCollaborators,
    mentionSearch ? { sessionId, email: mentionSearch } : "skip"
  );

  const collaborators = result?.collaborators?.page || [];

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [text]);

  // Close mention dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mentionListRef.current &&
        !mentionListRef.current.contains(event.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(event.target as Node)
      ) {
        setIsMentioning(false);
        setMentionSearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);

    const match = value.match(/@([^\s]*)$/);
    if (match) {
      setMentionSearch(match[1]);
      setIsMentioning(true);
      setMentionPosition(value.lastIndexOf("@"));
    } else {
      setMentionSearch("");
      setIsMentioning(false);
    }
  };

  const handleSelect = (collaborator: Collaborator) => {
    const textBeforeMention = text.substring(0, mentionPosition);
    const textAfterMention = text.substring(
      text.indexOf("@", mentionPosition) + mentionSearch.length + 1
    );
    const newText = `${textBeforeMention}@${collaborator.email} ${textAfterMention}`;

    setText(newText);
    setMentionSearch("");
    setIsMentioning(false);

    // Focus back to textarea after selection
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isMentioning && collaborators.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const firstItem = mentionListRef.current?.firstChild as HTMLElement;
        firstItem?.focus();
      } else if (e.key === "Escape") {
        setIsMentioning(false);
        setMentionSearch("");
      }
    }
  };

  const handleMentionItemKeyDown = (
    e: React.KeyboardEvent<HTMLLIElement>,
    collaborator: Collaborator
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSelect(collaborator);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      (e.currentTarget.nextSibling as HTMLElement)?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      (e.currentTarget.previousSibling as HTMLElement)?.focus();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsMentioning(false);
      setMentionSearch("");
      textareaRef.current?.focus();
    }
  };

  return (
    <div className="relative w-full max-w-2xl">
      <div className="relative">
        <textarea
          ref={textareaRef}
          className="w-full p-4 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
          rows={3}
          placeholder="Type a message... Use @ to mention someone"
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          style={{ minHeight: "80px", maxHeight: "200px" }}
        />

        {/* Send button */}
        {text.trim() && (
          <button
            className="absolute bottom-3 right-3 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition-colors duration-200 shadow-md"
            onClick={() => {
              // Handle send message logic here
              console.log("Sending message:", text);
              setText("");
            }}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Enhanced Mention Dropdown */}
      {isMentioning && collaborators.length > 0 && (
        <div
          className="absolute bottom-full mb-2 left-0 w-full border border-gray-200 rounded-xl bg-white shadow-xl z-20 max-h-60 overflow-hidden"
          style={{ bottom: "100%", marginBottom: "8px" }}
        >
          <div className="p-2 border-b border-gray-100 bg-gray-50">
            <span className="text-sm font-medium text-gray-700">
              Mention someone
            </span>
          </div>
          <ul ref={mentionListRef} className="max-h-48 overflow-y-auto">
            {collaborators.map((collaborator: Collaborator) => (
              <li
                key={collaborator._id}
                tabIndex={0}
                className="flex items-center gap-3 p-3 hover:bg-blue-50 cursor-pointer transition-colors duration-150 focus:outline-none focus:bg-blue-50 focus:ring-2 focus:ring-blue-200"
                onClick={() => handleSelect(collaborator)}
                onKeyDown={(e) => handleMentionItemKeyDown(e, collaborator)}
              >
                <div className="flex-shrink-0">
                  <SafeImage collaborator={collaborator} />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-medium text-gray-900 truncate">
                    {collaborator.name || "Unnamed User"}
                  </span>
                  <span className="text-sm text-gray-500 truncate">
                    {collaborator.email}
                  </span>
                </div>
                <div className="flex-shrink-0">
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full font-medium">
                    Mention
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* No results state */}
      {isMentioning && mentionSearch && collaborators.length === 0 && (
        <div className="absolute bottom-full mb-2 left-0 w-full border border-gray-200 rounded-xl bg-white shadow-lg z-20">
          <div className="p-4 text-center text-gray-500">
            <svg
              className="w-8 h-8 mx-auto mb-2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm">
              No collaborators found for "{mentionSearch}"
            </p>
          </div>
        </div>
      )}

      {/* Helper text */}
      <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        Press @ to mention collaborators
      </div>
    </div>
  );
}
