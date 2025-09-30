"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X, Check, Trash2, Reply, HelpCircle } from "lucide-react";

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
  const [showHelp, setShowHelp] = useState(false);
  const [selectedText, setSelectedText] = useState<string>("");
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);
  const [showTextCommentButton, setShowTextCommentButton] = useState(false);

  // Listen for text selection
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const selectedText = selection.toString().trim();
        if (selectedText.length > 0) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          setSelectedText(selectedText);
          setSelectionRect(rect);
          setShowTextCommentButton(true);
        } else {
          setSelectedText("");
          setSelectionRect(null);
          setShowTextCommentButton(false);
        }
      }
    };

    // Keyboard shortcut for adding comments
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        // Add comment at current scroll position
        const editorElement = document.querySelector('[contenteditable]');
        if (editorElement) {
          const editorRect = editorElement.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const relativeY = (window.innerHeight / 2) - editorRect.top + scrollTop;
          setCommentY(Math.max(0, relativeY));
          setNewComment("");
        }
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Filter out deleted comments and organize comments with replies
  const activeComments = comments.filter(comment => !comment.deletedAt);
  const mainComments = activeComments.filter(comment => !comment.parentId);
  const replies = activeComments.filter(comment => comment.parentId);

  const getRepliesForComment = (commentId: string) => {
    return replies.filter(reply => reply.parentId === commentId);
  };

  const handleTextSelectionComment = () => {
    if (selectionRect) {
      // Position comment near the selected text
      const editorElement = document.querySelector('[contenteditable]');
      if (editorElement) {
        const editorRect = editorElement.getBoundingClientRect();
        const relativeY = selectionRect.top - editorRect.top + selectionRect.height / 2;
        setCommentY(Math.max(0, relativeY));
        setNewComment(`"${selectedText}"\n\n`);
        setShowTextCommentButton(false);
        // Clear selection
        window.getSelection()?.removeAllRanges();
      }
    }
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
      {/* Text Selection Comment Button */}
      {showTextCommentButton && selectionRect && (
        <div
          className="fixed z-50 bg-primary text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in-0 zoom-in-95"
          style={{
            left: selectionRect.left + selectionRect.width / 2 - 50,
            top: selectionRect.top - 50,
          }}
        >
          <MessageSquare size={16} />
          <button
            onClick={handleTextSelectionComment}
            className="text-sm font-medium hover:underline"
          >
            Comment on selection
          </button>
        </div>
      )}

      {/* Enhanced Vertical comment rail - positioned absolutely over the editor */}
      <div
        className="absolute top-0 right-0 w-8 h-full cursor-pointer group z-10"
        onClick={handleRailClick}
        title="Click to add comment"
      >
        {/* Rail line - more visible */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gray-300 dark:bg-gray-600 group-hover:bg-blue-500 group-hover:w-2 transition-all duration-200 transform -translate-x-1/2 rounded-full"></div>

        {/* Hover indicator - more prominent */}
        <div className="absolute inset-0 bg-transparent group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/20 transition-colors rounded-l-lg"></div>

        {/* Plus icon on hover */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-lg font-bold leading-none">+</span>
          </div>
        </div>

        {/* markers for main comments only (not replies) */}
        {mainComments.map((comment) => (
          <div
            key={comment._id}
            className="absolute left-1 translate-x-1 cursor-pointer group/comment transition-transform hover:scale-110"
            style={{ top: comment.position?.y || 0 }}
            onClick={(e) => {
              e.stopPropagation();
              setActiveComment(comment._id);
            }}
            title={comment.resolved ? "Resolved comment" : "Active comment"}
          >
            <MessageSquare
              size={20}
              strokeWidth={2}
              fill={comment.resolved ? "#d1d5db" : "#3b82f6"}
              className={
                comment.resolved
                  ? "text-gray-400 dark:text-gray-500 group-hover/comment:text-gray-600 dark:group-hover/comment:text-gray-400"
                  : "text-blue-500 group-hover/comment:text-blue-600 dark:text-blue-400 dark:group-hover/comment:text-blue-300"
              }
            />
            {/* Unread indicator */}
            {!comment.resolved && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></div>
            )}
          </div>
        ))}
      </div>

      {/* Comment form at clicked Y */}
      {commentY !== null && (
        <div
          className="absolute right-8 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4 shadow-lg z-20"
          style={{ top: Math.max(commentY - 100, 10) }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium text-sm text-gray-900 dark:text-gray-100">Add Comment</span>
            <button
              onClick={() => setCommentY(null)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400"
            >
              <X size={14} />
            </button>
          </div>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyPress}
            className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded p-2 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="Type your comment..."
            rows={4}
            autoFocus
          />
          <div className="flex justify-between items-center mt-3">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Ctrl+Enter to save
            </span>
            <button
              onClick={handleSubmit}
              disabled={!newComment.trim()}
              className="flex items-center gap-1 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
          className="absolute right-8 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4 shadow-lg z-30 max-h-96 overflow-y-auto"
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
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                        {comment.userName?.charAt(0) || 'U'}
                      </div>
                      <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{comment.userName || "Unknown User"}</p>
                    </div>
                    <div className="flex gap-1">
                      {!comment.resolved && (
                        <button
                          onClick={() => {
                            onResolveComment(comment._id);
                            setActiveComment(null);
                          }}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-green-600 dark:text-green-400"
                          title="Resolve comment"
                        >
                          <Check size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => setReplyingTo(comment._id)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-blue-600 dark:text-blue-400"
                        title="Reply to comment"
                      >
                        <Reply size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(comment._id)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-red-600 dark:text-red-400"
                        title="Delete comment"
                      >
                        <Trash2 size={14} />
                      </button>
                      <button
                        onClick={() => setActiveComment(null)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-2 rounded">{comment.content}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {new Date(comment._creationTime).toLocaleString()}
                  </p>

                  {/* Replies section */}
                  {commentReplies.length > 0 && (
                    <div className="mt-4 border-t border-gray-200 dark:border-gray-600 pt-3">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Replies:</p>
                      <div className="space-y-3">
                        {commentReplies.map((reply) => (
                          <div key={reply._id} className="pl-3 border-l-2 border-gray-200 dark:border-gray-600">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-gray-400 dark:bg-gray-500 text-white rounded-full flex items-center justify-center text-xs">
                                  {reply.userName?.charAt(0) || 'U'}
                                </div>
                                <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{reply.userName || "Unknown User"}</p>
                              </div>
                              <button
                                onClick={() => handleDelete(reply._id)}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-red-600 dark:text-red-400"
                                title="Delete reply"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{reply.content}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              {new Date(reply._creationTime).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reply form */}
                  {replyingTo === comment._id && (
                    <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Reply</span>
                        <button
                          onClick={() => setReplyingTo(null)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400"
                        >
                          <X size={12} />
                        </button>
                      </div>
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        onKeyDown={handleKeyPress}
                        className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded p-2 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="Type your reply..."
                        rows={3}
                        autoFocus
                      />
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Ctrl+Enter to send
                        </span>
                        <button
                          onClick={() => handleReplySubmit(comment._id)}
                          disabled={!replyContent.trim()}
                          className="flex items-center gap-1 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3 text-sm text-gray-700 dark:text-gray-300 max-w-xs shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-gray-900 dark:text-gray-100">💡 Comment Tips:</p>
              <button
                onClick={() => setShowHelp(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-gray-500 dark:text-gray-400"
                title="Close help"
              >
                <X size={14} />
              </button>
            </div>
           <p>• <strong>Select text</strong> and click "Comment on selection"</p>
           <p>• <strong>Hover right edge</strong> and click the + button</p>
           <p>• <strong>Ctrl+Shift+C</strong> to add comment anywhere</p>
           <p>• Click comment icons to view, reply, or resolve</p>
           <p>• Use @ to mention collaborators</p>
           <p>• Ctrl+Enter to save comments</p>
          </div>
        ) : (
          <button
            onClick={() => setShowHelp(true)}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-lg"
            title="Show help"
          >
            <HelpCircle size={26} className="text-gray-600 dark:text-gray-400" />
          </button>
        )}
      </div>
    </>
  );
}