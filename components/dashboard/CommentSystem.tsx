"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X, Check, Trash2, Reply, HelpCircle, AtSign } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";

interface Comment {
  _id: string;
  documentId: string;
  userId: string;
  parentId?: string;
  content: string;
  resolved: boolean;
  assignedTo?: string[];
  updatedAt?: number;
  deletedAt?: number;
  position?: { y: number };
  _creationTime: number;
  userName?: string;
}

interface CommentSystemProps {
  comments: any[];
  onAddComment: (content: string, position: { y: number }, assignedTo?: string[]) => void;
  onResolveComment: (commentId: string) => void;
  onReply: (commentId: string, content: string, assignedTo?: string[]) => void;
  deleteComment: (commentId: string) => void;
  collaboratorUsers: any[];
}

interface Collaborator {
  _id: string;
  name?: string;
  email?: string;
}

export default function CommentSystem({
  comments,
  onAddComment,
  onResolveComment,
  onReply,
  deleteComment,
  collaboratorUsers
}: CommentSystemProps) {
  const [newComment, setNewComment] = useState("");
  const [commentY, setCommentY] = useState<number | null>(null);
  const [activeComment, setActiveComment] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  // Tagging states
  const [showMentionList, setShowMentionList] = useState(false);
  const [mentionPosition, setMentionPosition] = useState(0);
  const [mentionQuery, setMentionQuery] = useState("");
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [currentTextarea, setCurrentTextarea] = useState<"newComment" | "reply" | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const replyTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Filter out deleted comments and organize comments with replies
  const activeComments = comments.filter(comment => !comment.deletedAt);
  const mainComments = activeComments.filter(comment => !comment.parentId);
  const replies = activeComments.filter(comment => comment.parentId);

  const getRepliesForComment = (commentId: string) => {
    return replies.filter(reply => reply.parentId === commentId);
  };

  // Filter collaborators based on mention query
  const filteredCollaborators = collaboratorUsers?.filter((collaborator: Collaborator) =>
    collaborator.name?.toLowerCase().includes(mentionQuery.toLowerCase()) ||
    collaborator.email?.toLowerCase().includes(mentionQuery.toLowerCase())
  ) || [];

  // Handle @ mention detection
  const handleTextareaChange = (value: string, textareaType: "newComment" | "reply") => {
    if (textareaType === "newComment") {
      setNewComment(value);
    } else {
      setReplyContent(value);
    }

    const textarea = textareaType === "newComment" ? textareaRef.current : replyTextareaRef.current;
    if (!textarea) return;

    const cursorPosition = textarea.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPosition);

    // Check for @ mention
    const atSymbolIndex = textBeforeCursor.lastIndexOf('@');

    if (atSymbolIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(atSymbolIndex + 1);
      const hasSpace = textAfterAt.includes(' ');

      if (!hasSpace) {
        setShowMentionList(true);
        setMentionPosition(atSymbolIndex);
        setMentionQuery(textAfterAt);
        setSelectedMentionIndex(0);
        setCurrentTextarea(textareaType);
        return;
      }
    }

    setShowMentionList(false);
    setCurrentTextarea(null);
  };

  // Insert mention into textarea
  const insertMention = (collaborator: Collaborator) => {
    const mentionText = `@${collaborator.name || collaborator.email} `;
    const textarea = currentTextarea === "newComment" ? textareaRef.current : replyTextareaRef.current;

    if (!textarea) return;

    const currentValue = currentTextarea === "newComment" ? newComment : replyContent;
    const beforeMention = currentValue.substring(0, mentionPosition);
    const afterMention = currentValue.substring(textarea.selectionStart);
    const newValue = beforeMention + mentionText + afterMention;

    if (currentTextarea === "newComment") {
      setNewComment(newValue);
    } else {
      setReplyContent(newValue);
    }

    setShowMentionList(false);
    setCurrentTextarea(null);

    // Focus back to textarea and set cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = beforeMention.length + mentionText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Handle keyboard navigation in mention list
  const handleKeyDown = (e: React.KeyboardEvent, textareaType: "newComment" | "reply") => {
    if (showMentionList && filteredCollaborators.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedMentionIndex(prev =>
          prev < filteredCollaborators.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedMentionIndex(prev => prev > 0 ? prev - 1 : 0);
      } else if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        insertMention(filteredCollaborators[selectedMentionIndex]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowMentionList(false);
        setCurrentTextarea(null);
      }
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      if (textareaType === "newComment") {
        handleSubmit();
      } else if (replyingTo) {
        handleReplySubmit(replyingTo);
      }
    }
  };

  // Extract assigned users from content
  const extractAssignedUsers = (content: string): string[] => {
    const assignedUsers: string[] = [];
    const mentionRegex = /@([^@\s]+)(?=\s|$)/g;
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
      const mentionText = match[1];
      const collaborator = collaboratorUsers?.find(
        (coll: Collaborator) => coll.name === mentionText || coll.email === mentionText
      );
      if (collaborator) {
        assignedUsers.push(collaborator._id);
      }
    }

    return assignedUsers;
  };

  const handleRailClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    setCommentY(y);
    setNewComment("");
  };

  const handleSubmit = () => {
    if (!newComment.trim() || commentY === null) return;

    const assignedTo = extractAssignedUsers(newComment);
    onAddComment(newComment, { y: commentY }, assignedTo);
    setNewComment("");
    setCommentY(null);
  };

  const handleReplySubmit = (commentId: string) => {
    if (!replyContent.trim()) return;

    const assignedTo = extractAssignedUsers(replyContent);
    onReply(commentId, replyContent, assignedTo);
    setReplyContent("");
    setReplyingTo(null);
  };

  const handleDelete = (commentId: string) => {
    deleteComment(commentId);
    if (activeComment === commentId) {
      setActiveComment(null);
    }
  };

  // Close mention list when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showMentionList && !(e.target as Element).closest('.mention-container')) {
        setShowMentionList(false);
        setCurrentTextarea(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMentionList]);

  return (
    <>
      {/* Vertical comment rail */}
      <div
        className="absolute top-0 right-0 w-0 h-full cursor-pointer group z-10"
        onClick={handleRailClick}
      >
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gray-400 group-hover:bg-blue-500 transition-colors transform -translate-x-1/2"></div>
        <div className="absolute inset-0 bg-transparent group-hover:bg-blue-50/30 transition-colors"></div>

        {mainComments.map((comment) => (
          <div
            key={comment._id}
            className="absolute left-2 translate-x-1 cursor-pointer group/comment"
            style={{ top: comment.position?.y || 0 }}
            onClick={(e) => {
              e.stopPropagation();
              setActiveComment(comment._id);
            }}
          >
            <MessageSquare
              size={20}
              strokeWidth={2}
              fill={comment.resolved ? "#ebebebff" : "#81a8fcff"}
              className={
                comment.resolved
                  ? "text-gray-400 group-hover/comment:text-gray-600"
                  : "text-primary group-hover/comment:text-primary/80"
              }
            />
          </div>
        ))}
      </div>

      {/* Comment form at clicked Y */}
      {commentY !== null && (
        <div
          className="absolute right-8 w-64 bg-white border border-gray-200 rounded-lg p-4 shadow-lg z-20 mention-container"
          style={{ top: Math.max(commentY - 100, 10) }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium text-sm text-gray-900">Add Comment</span>
            <button
              onClick={() => setCommentY(null)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X size={14} />
            </button>
          </div>
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={newComment}
              onChange={(e) => handleTextareaChange(e.target.value, "newComment")}
              onKeyDown={(e) => handleKeyDown(e, "newComment")}
              className="w-full text-sm border border-gray-300 rounded p-2 resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Type your comment... Use @ to mention collaborators"
              rows={4}
              autoFocus
            />

            {/* Mention dropdown */}
            {showMentionList && currentTextarea === "newComment" && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg z-30 max-h-32 overflow-y-auto">
                {filteredCollaborators.length > 0 ? (
                  filteredCollaborators.map((collaborator: Collaborator, index: number) => (
                    <button
                      key={collaborator._id}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${
                        index === selectedMentionIndex ? "bg-blue-50" : ""
                      }`}
                      onClick={() => insertMention(collaborator)}
                    >
                      <div className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-medium">
                        {(collaborator.name || collaborator.email)?.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{collaborator.name}</div>
                        <div className="text-xs text-gray-500 truncate">{collaborator.email}</div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-gray-500">No collaborators found</div>
                )}
              </div>
            )}
          </div>
          <div className="flex justify-between items-center mt-3">
            <span className="text-xs text-gray-500">
              Ctrl+Enter to save
            </span>
            <button
              onClick={handleSubmit}
              disabled={!newComment.trim()}
              className="flex items-center gap-1 px-3 py-1 bg-primary text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90"
            >
              <Send size={14} />
              Comment
            </button>
          </div>
        </div>
      )}

      {/* Active comment popup */}
      {activeComment && (
        <div
          className="absolute right-8 w-80 bg-white border border-gray-200 rounded-lg p-4 shadow-lg z-30 max-h-96 overflow-y-auto mention-container"
          style={{
            top: Math.max(mainComments.find(c => c._id === activeComment)?.position?.y - 100 || 0, 10)
          }}
        >
          {mainComments
            .filter((c) => c._id === activeComment)
            .map((comment) => {
              const commentReplies = getRepliesForComment(comment._id);
              return (
                <div key={comment._id}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-medium">
                        {comment.userName?.charAt(0) || 'U'}
                      </div>
                      <p className="font-medium text-sm">{comment.userName || "Unknown User"}</p>
                    </div>
                    <div className="flex gap-1">
                      {!comment.resolved && (
                        <button
                          onClick={() => {
                            onResolveComment(comment._id);
                            setActiveComment(null);
                          }}
                          className="p-1 hover:bg-gray-100 rounded text-green-600"
                          title="Resolve comment"
                        >
                          <Check size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => setReplyingTo(comment._id)}
                        className="p-1 hover:bg-gray-100 rounded text-blue-600"
                        title="Reply to comment"
                      >
                        <Reply size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(comment._id)}
                        className="p-1 hover:bg-gray-100 rounded text-red-600"
                        title="Delete comment"
                      >
                        <Trash2 size={14} />
                      </button>
                      <button
                        onClick={() => setActiveComment(null)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{comment.content}</p>

                  {/* Show assigned users if any */}
                  {comment.assignedTo && comment.assignedTo.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="text-xs text-gray-500">Assigned to:</span>
                      {comment.assignedTo.map((userId: any) => {
                        const assignedUser = collaboratorUsers?.find((u: Collaborator) => u._id === userId);
                        return assignedUser ? (
                          <span key={userId} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            <AtSign size={10} />
                            {assignedUser.name || assignedUser.email}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}

                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(comment._creationTime).toLocaleString()}
                  </p>

                  {/* Replies section */}
                  {commentReplies.length > 0 && (
                    <div className="mt-4 border-t pt-3">
                      <p className="text-xs font-medium text-gray-500 mb-2">Replies:</p>
                      <div className="space-y-3">
                        {commentReplies.map((reply) => (
                          <div key={reply._id} className="pl-3 border-l-2 border-gray-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-gray-400 text-white rounded-full flex items-center justify-center text-xs">
                                  {reply.userName?.charAt(0) || 'U'}
                                </div>
                                <p className="text-xs font-medium">{reply.userName || "Unknown User"}</p>
                              </div>
                              <button
                                onClick={() => handleDelete(reply._id)}
                                className="p-1 hover:bg-gray-100 rounded text-red-600"
                                title="Delete reply"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">{reply.content}</p>

                            {/* Show assigned users in replies if any */}
                            {reply.assignedTo && reply.assignedTo.length > 0 && (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {reply.assignedTo.map((userId: any) => {
                                  const assignedUser = collaboratorUsers?.find((u: Collaborator) => u._id === userId);
                                  return assignedUser ? (
                                    <span key={userId} className="inline-flex items-center gap-1 px-1 bg-blue-100 text-blue-800 rounded text-xs">
                                      <AtSign size={8} />
                                      {assignedUser.name || assignedUser.email}
                                    </span>
                                  ) : null;
                                })}
                              </div>
                            )}

                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(reply._creationTime).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reply form */}
                  {replyingTo === comment._id && (
                    <div className="mt-4 pt-3 border-t">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Reply</span>
                        <button
                          onClick={() => setReplyingTo(null)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <X size={12} />
                        </button>
                      </div>
                      <div className="relative">
                        <textarea
                          ref={replyTextareaRef}
                          value={replyContent}
                          onChange={(e) => handleTextareaChange(e.target.value, "reply")}
                          onKeyDown={(e) => handleKeyDown(e, "reply")}
                          className="w-full text-sm border border-gray-300 rounded p-2 resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="Type your reply... Use @ to mention collaborators"
                          rows={3}
                          autoFocus
                        />

                        {/* Mention dropdown for reply */}
                        {showMentionList && currentTextarea === "reply" && (
                          <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg z-30 max-h-32 overflow-y-auto">
                            {filteredCollaborators.length > 0 ? (
                              filteredCollaborators.map((collaborator: Collaborator, index: number) => (
                                <button
                                  key={collaborator._id}
                                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${
                                    index === selectedMentionIndex ? "bg-blue-50" : ""
                                  }`}
                                  onClick={() => insertMention(collaborator)}
                                >
                                  <div className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-medium">
                                    {(collaborator.name || collaborator.email)?.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-medium truncate">{collaborator.name}</div>
                                    <div className="text-xs text-gray-500 truncate">{collaborator.email}</div>
                                  </div>
                                </button>
                              ))
                            ) : (
                              <div className="px-3 py-2 text-sm text-gray-500">No collaborators found</div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500">
                          Ctrl+Enter to send
                        </span>
                        <button
                          onClick={() => handleReplySubmit(comment._id)}
                          disabled={!replyContent.trim()}
                          className="flex items-center gap-1 px-3 py-1 bg-primary text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90"
                        >
                          <Send size={12} />
                          Reply
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}

      {/* Instructions */}
      <div className="fixed bottom-4 right-4 z-20">
        {showHelp ? (
          <div className="bg-card border border-border rounded-lg p-3 text-sm text-muted-foreground max-w-xs shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium">💡 Comment Tips:</p>
              <button
                onClick={() => setShowHelp(false)}
                className="p-1 hover:bg-accent rounded transition-colors"
                title="Close help"
              >
                <X size={14} />
              </button>
            </div>
           <p>• Click right-edge rail on the document to comment</p>
           <p>• Click comment icons to view, reply, or resolve</p>
           <p>• Use @ to mention collaborators</p>
          </div>
        ) : (
          <button
            onClick={() => setShowHelp(true)}
            className="bg-card border border-border rounded-lg p-2 hover:bg-accent transition-colors shadow-lg"
            title="Show help"
          >
            <HelpCircle size={26} className="text-muted-foreground" />
          </button>
        )}
      </div>
    </>
  );
}