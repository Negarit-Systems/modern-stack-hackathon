"use client";

import React, { useState, useRef } from "react";
import { MessageSquare, Send, X, Check, Trash2, Reply } from "lucide-react";

interface Comment {
  _id: string;
  documentId: string;
  userId: string;
  parentId?: string;
  content: string;
  resolved: boolean;
  assignedTo?: string;
  updatedAt?: number;
  deletedAt?: number;
  position?: { y: number };
  _creationTime: number;
  userName?: string;
}

interface CommentSystemProps {
  comments: any[];
  user: any;
  onAddComment: (content: string, position: { y: number }) => void;
  onResolveComment: (commentId: string) => void;
  onReply: (commentId: string, content: string) => void;
  deleteComment: (commentId: string) => void;
}

export default function CommentSystem({
  comments,
  user,
  onAddComment,
  onResolveComment,
  onReply,
  deleteComment
}: CommentSystemProps) {
  const [newComment, setNewComment] = useState("");
  const [commentY, setCommentY] = useState<number | null>(null);
  const [activeComment, setActiveComment] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  // Filter out deleted comments and organize comments with replies
  const activeComments = comments.filter(comment => !comment.deletedAt);
  const mainComments = activeComments.filter(comment => !comment.parentId);
  const replies = activeComments.filter(comment => comment.parentId);

  const getRepliesForComment = (commentId: string) => {
    return replies.filter(reply => reply.parentId === commentId);
  };

  const handleRailClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top; // position inside editor
    setCommentY(y);
    setNewComment("");
  };

  const handleSubmit = () => {
    if (!newComment.trim() || commentY === null) return;

    onAddComment(newComment, { y: commentY });
    setNewComment("");
    setCommentY(null);
  };

  const handleReplySubmit = (commentId: string) => {
    if (!replyContent.trim()) return;

    onReply(commentId, replyContent);
    setReplyContent("");
    setReplyingTo(null);
  };

  const handleDelete = (commentId: string) => {
    deleteComment(commentId);
    if (activeComment === commentId) {
      setActiveComment(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      if (replyingTo) {
        handleReplySubmit(replyingTo);
      } else {
        handleSubmit();
      }
    }
  };

  return (
    <>
      {/* Vertical comment rail - positioned absolutely over the editor */}
      <div
        className="absolute top-0 right-0 w-0 h-full cursor-pointer group z-10"
        onClick={handleRailClick}
      >
        {/* Rail line - make it more visible */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gray-400 group-hover:bg-blue-500 transition-colors transform -translate-x-1/2"></div>

        {/* Hover indicator */}
        <div className="absolute inset-0 bg-transparent group-hover:bg-blue-50/30 transition-colors"></div>

        {/* markers for main comments only (not replies) */}
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
          className="absolute right-8 w-64 bg-white border border-gray-200 rounded-lg p-4 shadow-lg z-20"
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
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyPress}
            className="w-full text-sm border border-gray-300 rounded p-2 resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Type your comment..."
            rows={4}
            autoFocus
          />
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
          className="absolute right-8 w-80 bg-white border border-gray-200 rounded-lg p-4 shadow-lg z-30 max-h-96 overflow-y-auto"
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
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        onKeyDown={handleKeyPress}
                        className="w-full text-sm border border-gray-300 rounded p-2 resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Type your reply..."
                        rows={3}
                        autoFocus
                      />
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
      <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg p-3 text-sm text-gray-600 max-w-md w-90 shadow-sm">
        <p className="font-medium mb-1 text-gray-800">💡 Comment Tips:</p>
        <p>• Click right-edge rail on the document to comment</p>
        <p>• Click comment icons to view, reply, or resolve</p>
        <p>• Use @ to mention collaborators</p>
      </div>
    </>
  );
}