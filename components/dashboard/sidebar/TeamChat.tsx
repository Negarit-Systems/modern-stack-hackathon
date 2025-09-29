"use client";

import React, { useState } from "react";
import { MessageCircle, Send, AtSign } from "lucide-react";
import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useParams } from "next/navigation";

interface TeamChatProps {
  // sessionId: string;
  user: { _id: string; name: string };
}

export default function TeamChat({ user }: TeamChatProps) {
  const [newMessage, setNewMessage] = useState("");
  const [showMentions, setShowMentions] = useState(false);

  const sId = useParams<{ sessionId: string }>() as { sessionId: string };

  const sessionId = sId.sessionId as Id<"sessions">;

  // Convex hooks
  const sendMessage = useMutation(api.crud.groupChat.sendMessage);
  const { results: messages } = usePaginatedQuery(
    api.crud.groupChat.getMessages,
    {
      sessionId,
    },
    { initialNumItems: 20 }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    console.log("Sending message:", newMessage);
    console.log("Session ID:", sessionId);

    await sendMessage({ sessionId, content: newMessage });
    setNewMessage("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);

    if (value.includes("@") && value.endsWith("@")) {
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (userName: string) => {
    const lastAtIndex = newMessage.lastIndexOf("@");
    const beforeAt = newMessage.substring(0, lastAtIndex);
    const afterAt = newMessage.substring(lastAtIndex + 1);

    setNewMessage(`${beforeAt}@${userName} ${afterAt}`);
    setShowMentions(false);
  };

  // Mock collaborators for mentions
  const collaborators = [
    { id: "1", name: "John Smith" },
    { id: "2", name: "Sarah Johnson" },
    { id: "3", name: "Mike Chen" },
  ];

  return (
    <div className="bg-background border border-border rounded-lg p-3">
      <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
        <MessageCircle size={16} className="text-primary" />
        Team Chat
      </h3>

      <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
        {messages?.length === 0 && (
          <p className="text-xs text-muted-foreground">No messages yet.</p>
        )}
        {messages
          ?.slice(-5)
          .reverse() // show in chronological order
          .map((message: any) => {
            const isSender = message.senderId === user._id;
            return (
              <div
                key={message._id}
                className={`text-xs p-2 rounded-md ${
                  isSender
                    ? "bg-primary/20 text-primary"
                    : "bg-accent text-foreground"
                }`}
              >
                <div className="flex items-center gap-1 mb-1">
                  <span
                    className={`font-medium ${
                      isSender ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {isSender
                      ? "You"
                      : (message.senderName?.split(" ")[0] ?? "Unknown")}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(message._creationTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p>
                  {message.content
                    .split(/(@\w+)/g)
                    .map((part: string, index: number) =>
                      part.startsWith("@") ? (
                        <span key={index} className="text-primary font-medium">
                          {part}
                        </span>
                      ) : (
                        part
                      )
                    )}
                </p>
              </div>
            );
          })}
      </div>

      <div className="relative">
        <form onSubmit={handleSubmit}>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={handleInputChange}
                className="w-full px-2 py-1 text-sm border border-border rounded-md bg-background focus:ring-1 focus:ring-primary focus:border-transparent"
                placeholder="Type message... Use @ to mention"
              />
              {newMessage.includes("@") && (
                <AtSign
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  size={12}
                />
              )}
            </div>
            <button
              type="submit"
              className="px-2 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              <Send size={14} />
            </button>
          </div>
        </form>

        {/* Mentions dropdown */}
        {showMentions && (
          <div className="absolute bottom-full left-0 right-0 mb-1 bg-card border border-border rounded-md shadow-lg z-10">
            <div className="p-2">
              <p className="text-xs text-muted-foreground mb-2">
                Mention someone:
              </p>
              {collaborators.map((collab) => (
                <button
                  key={collab.id}
                  onClick={() => insertMention(collab.name)}
                  className="w-full text-left px-2 py-1 text-sm hover:bg-accent rounded-sm transition-colors"
                >
                  @{collab.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
