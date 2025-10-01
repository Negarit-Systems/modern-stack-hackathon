"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, Send, AtSign, Trash2 } from "lucide-react";
import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useParams } from "next/navigation";
import { authClient } from "@/app/lib/auth.client";

interface TeamChatProps {
  user: { _id: string; name: string };
}

export default function TeamChat() {
  const [newMessage, setNewMessage] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const user = authClient.useSession();
  const sId = useParams<{ sessionId: string }>() as { sessionId: string };
  const sessionId = sId.sessionId as Id<"sessions">;

  // Convex hooks
  const sendMessage = useMutation(api.crud.groupChat.sendMessage);
  const deleteMessage = useMutation(api.crud.groupChat.deleteMessage);

  const {
    results: messages,
    status: messagesStatus,
    loadMore,
  } = usePaginatedQuery(
    api.crud.groupChat.getMessages,
    { sessionId },
    { initialNumItems: 20 }
  );

  // Fetch collaborators for mentions
  const collaboratorsData = useQuery(
    api.crud.users.searchCollaborators,
    mentionQuery ? { sessionId, email: mentionQuery } : "skip"
  );

  const collaborators = collaboratorsData?.collaborators?.page || [];

  // Scroll to bottom when new messages arrive and autoScroll is enabled
  useEffect(() => {
    if (autoScroll && messages?.length) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, autoScroll]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    await sendMessage({ sessionId, content: newMessage });
    setNewMessage("");
    setShowMentions(false);
    setMentionQuery("");
    setAutoScroll(true); // Enable auto-scroll when sending a new message
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);

    // Improved mention detection
    const lastAtIndex = value.lastIndexOf("@");
    if (lastAtIndex !== -1) {
      const textAfterAt = value.substring(lastAtIndex + 1);
      const spaceIndex = textAfterAt.indexOf(" ");

      if (spaceIndex === -1) {
        // No space after @, extract the query and show mentions
        const query = textAfterAt;
        setMentionQuery(query);
        setShowMentions(true);
      } else {
        // Space found after @, hide mentions
        setShowMentions(false);
        setMentionQuery("");
      }
    } else {
      // No @ found, hide mentions
      setShowMentions(false);
      setMentionQuery("");
    }
  };

  const insertMention = (userEmail: string, userName: string) => {
    const lastAtIndex = newMessage.lastIndexOf("@");
    if (lastAtIndex === -1) return;

    const beforeAt = newMessage.substring(0, lastAtIndex);
    const textAfterAt = newMessage.substring(lastAtIndex + 1);
    const spaceIndex = textAfterAt.indexOf(" ");

    let afterAt = textAfterAt;
    if (spaceIndex !== -1) {
      afterAt = textAfterAt.substring(spaceIndex);
    } else {
      afterAt = " "; // Add space after mention if there wasn't one
    }

    setNewMessage(`${beforeAt}@${userEmail}${afterAt}`);
    setShowMentions(false);
    setMentionQuery("");
  };

  const handleDeleteMessage = async (messageId: Id<"groupChats">) => {
    if (!user.data?.user.id) return;

    try {
      await deleteMessage({
        id: messageId,
      });
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const handleScroll = useCallback(async () => {
    if (!messagesContainerRef.current || isLoadingMore) return;

    const container = messagesContainerRef.current;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;

    // Check if user is near the bottom (within 100px)
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

    // Auto-scroll only if user is near the bottom
    setAutoScroll(isNearBottom);

    // Load more when near the top
    if (scrollTop < 100 && messagesStatus === "CanLoadMore") {
      setIsLoadingMore(true);
      try {
        await loadMore(10);
      } finally {
        setIsLoadingMore(false);
      }
    }
  }, [isLoadingMore, messagesStatus, loadMore]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  // Sort messages by creation time (oldest first) for proper display
  const sortedMessages = messages
    ? [...messages].sort(
        (a, b) =>
          new Date(a._creationTime).getTime() -
          new Date(b._creationTime).getTime()
      )
    : [];

  return (
    <div className="bg-background border border-border rounded-lg p-3">
      <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
        <MessageCircle size={16} className="text-primary" />
        Team Chat
        {isLoadingMore && (
          <span className="text-xs text-muted-foreground">Loading...</span>
        )}
      </h3>

      <div
        ref={messagesContainerRef}
        className="space-y-3 mb-3 max-h-48 overflow-y-auto"
      >
        {sortedMessages?.length === 0 && (
          <p className="text-xs text-muted-foreground">No messages yet.</p>
        )}

        {sortedMessages?.map((message: any) => {
          const isSender = message.senderId === user.data?.user.id;
          const canDelete = isSender; // Only allow users to delete their own messages

          return (
            <div
              key={message._id}
              className={`flex ${isSender ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`relative max-w-[80%] text-xs rounded-lg group ${
                  isSender
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-gray-200 text-gray-800 rounded-bl-none"
                }`}
              >
                {/* Directional arrow */}
                {isSender ? (
                  <div className="absolute -right-1 top-0 w-3 h-3">
                    <div className="w-3 h-3 bg-blue-500 transform rotate-45 origin-bottom-left"></div>
                  </div>
                ) : (
                  <div className="absolute -left-1 top-0 w-3 h-3">
                    <div className="w-3 h-3 bg-gray-200 transform rotate-45 origin-bottom-right"></div>
                  </div>
                )}

                <div className="p-2">
                  <div className="flex items-center gap-1 mb-1 justify-between">
                    <div className="flex items-center gap-1">
                      <span
                        className={`font-medium ${
                          isSender ? "text-blue-100" : "text-gray-600"
                        }`}
                      >
                        {isSender
                          ? "You"
                          : (message.senderName?.split(" ")[0] ?? "Unknown")}
                      </span>
                      <span
                        className={`text-xs ${
                          isSender ? "text-blue-200" : "text-gray-500"
                        }`}
                      >
                        {new Date(message._creationTime).toLocaleTimeString(
                          [],
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                    </div>

                    {canDelete && (
                      <button
                        onClick={() => handleDeleteMessage(message._id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/20 rounded"
                        title="Delete message"
                      >
                        <Trash2 size={10} />
                      </button>
                    )}
                  </div>
                  <p className="relative z-10 break-words whitespace-pre-wrap">
                    {message.content
                      .split(/(@[^\s]+)/g) // Improved regex to match any non-space characters after @
                      .map((part: string, index: number) =>
                        part.startsWith("@") ? (
                          <span
                            key={index}
                            className={`font-medium ${
                              isSender ? "text-blue-100" : "text-blue-600"
                            }`}
                          >
                            {part}
                          </span>
                        ) : (
                          part
                        )
                      )}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
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
              {showMentions && (
                <AtSign
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary"
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
        {showMentions && collaborators.length > 0 && (
          <div className="absolute bottom-full left-0 right-0 mb-1 bg-card border border-border rounded-md shadow-lg z-10 max-h-32 overflow-y-auto">
            <div className="p-2">
              <p className="text-xs text-muted-foreground mb-2">
                Mention someone
              </p>
              {collaborators.map((collab: any) => (
                <button
                  key={collab._id}
                  onClick={() => insertMention(collab.email, collab.name)}
                  className="w-full text-left px-2 py-1 text-sm hover:bg-accent rounded-sm transition-colors flex items-center gap-2"
                >
                  <span className="font-medium">@{collab.email}</span>
                  <span className="text-muted-foreground text-xs">
                    ({collab.name})
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No results state */}
        {showMentions && mentionQuery && collaborators.length === 0 && (
          <div className="absolute bottom-full left-0 right-0 mb-1 bg-card border border-border rounded-md shadow-lg z-10">
            <div className="p-2">
              <p className="text-xs text-muted-foreground">
                No collaborators found for "{mentionQuery}"
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
