"use client";

import React, { useState } from "react";
import { MessageSquare, Send, AtSign, X, Check, HelpCircle } from "lucide-react";

interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
  position?: { x: number; y: number };
  resolved: boolean;
  replies?: Comment[];
}

interface CommentSystemProps {
  comments: Comment[];
  collaborators: any[];
  user: any;
  onAddComment: (content: string, position?: { x: number; y: number }) => void;
  onResolveComment: (commentId: string) => void;
  onReplyToComment: (commentId: string, content: string) => void;
}

export default function CommentSystem({
  comments,
  collaborators,
  user,
  onAddComment,
  onResolveComment,
  onReplyToComment,
}: CommentSystemProps) {
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [commentPosition, setCommentPosition] = useState<{ x: number; y: number } | null>(null);
  const [showMentions, setShowMentions] = useState(false);
  const [activeComment, setActiveComment] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [showHelp, setShowHelp] = useState(false);

  const handleDocumentClick = (e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      // Ctrl/Cmd + Click to add comment
      const rect = e.currentTarget.getBoundingClientRect();
      const position = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      setCommentPosition(position);
      setShowCommentForm(true);
    }
  };

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    
    onAddComment(newComment, commentPosition || undefined);
    setNewComment("");
    setShowCommentForm(false);
    setCommentPosition(null);
  };

  const handleInputChange = (value: string) => {
    setNewComment(value);
    
    // Show mentions dropdown when @ is typed
    if (value.includes("@") && value.endsWith("@")) {
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (userName: string) => {
    const lastAtIndex = newComment.lastIndexOf("@");
    const beforeAt = newComment.substring(0, lastAtIndex);
    const afterAt = newComment.substring(lastAtIndex + 1);
    
    setNewComment(`${beforeAt}@${userName} ${afterAt}`);
    setShowMentions(false);
  };

  const handleReply = (commentId: string) => {
    if (!replyContent.trim()) return;
    
    onReplyToComment(commentId, replyContent);
    setReplyContent("");
    setActiveComment(null);
  };

  const renderCommentContent = (content: string) => {
    return content.split(/(@\w+)/g).map((part, index) => 
      part.startsWith("@") ? (
        <span key={index} className="text-primary font-medium bg-primary/10 px-1 rounded">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="relative">
      {/* Document overlay for comment positioning */}
      <div 
        className="absolute inset-0 pointer-events-none z-10"
        onClick={handleDocumentClick}
        style={{ pointerEvents: showCommentForm ? 'none' : 'auto' }}
      >
        {/* Comment indicators */}
        {comments.map((comment) => (
          comment.position && (
            <div
              key={comment.id}
              className="absolute w-4 h-4 bg-primary rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform"
              style={{
                left: comment.position.x - 8,
                top: comment.position.y - 8,
              }}
              onClick={(e) => {
                e.stopPropagation();
                setActiveComment(activeComment === comment.id ? null : comment.id);
              }}
            >
              <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
            </div>
          )
        ))}
      </div>

      {/* Comment Form */}
      {showCommentForm && commentPosition && (
        <div
          className="absolute z-20 bg-card border border-border rounded-lg p-4 shadow-lg w-80"
          style={{
            left: Math.min(commentPosition.x, window.innerWidth - 320),
            top: commentPosition.y + 20,
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare size={16} className="text-primary" />
            <span className="font-medium text-sm">Add Comment</span>
            <button
              onClick={() => {
                setShowCommentForm(false);
                setCommentPosition(null);
                setNewComment("");
              }}
              className="ml-auto p-1 hover:bg-accent rounded"
            >
              <X size={14} />
            </button>
          </div>

          <div className="relative">
            <textarea
              value={newComment}
              onChange={(e) => handleInputChange(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              placeholder="Type your comment... Use @ to mention"
              rows={3}
              autoFocus
            />
            
            {/* Mentions dropdown */}
            {showMentions && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-card border border-border rounded-md shadow-lg z-10">
                <div className="p-2">
                  <p className="text-xs text-muted-foreground mb-2">Mention someone:</p>
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

          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleSubmitComment}
              className="flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm"
            >
              <Send size={12} />
              Comment
            </button>
            <button
              onClick={() => {
                setShowCommentForm(false);
                setCommentPosition(null);
                setNewComment("");
              }}
              className="px-3 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Active Comment Display */}
      {activeComment && (
        <div className="fixed right-4 top-20 w-80 bg-card border border-border rounded-lg shadow-lg z-30 max-h-96 overflow-y-auto">
          {comments
            .filter((comment) => comment.id === activeComment)
            .map((comment) => (
              <div key={comment.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center text-xs font-medium">
                      {comment.userName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{comment.userName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(comment.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {!comment.resolved && (
                      <button
                        onClick={() => onResolveComment(comment.id)}
                        className="p-1 hover:bg-accent rounded text-green-600"
                        title="Resolve comment"
                      >
                        <Check size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => setActiveComment(null)}
                      className="p-1 hover:bg-accent rounded"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                <div className="text-sm mb-3">
                  {renderCommentContent(comment.content)}
                </div>

                {comment.resolved && (
                  <div className="text-xs text-green-600 mb-2 flex items-center gap-1">
                    <Check size={12} />
                    Resolved
                  </div>
                )}

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="border-l-2 border-border pl-3 ml-3 space-y-2">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{reply.userName}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(reply.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div>{renderCommentContent(reply.content)}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Form */}
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      className="flex-1 px-2 py-1 text-sm border border-border rounded-md bg-background focus:ring-1 focus:ring-primary focus:border-transparent"
                      placeholder="Reply..."
                    />
                    <button
                      onClick={() => handleReply(comment.id)}
                      className="px-2 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                      <Send size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Collapsible Help */}
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
            <p>• Ctrl/Cmd + Click to add comments</p>
            <p>• Click comment dots to view/reply</p>
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
    </div>
  );
}
