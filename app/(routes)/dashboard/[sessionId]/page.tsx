"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import InviteModal from "@/components/InviteModal";
import RichTextEditor from "@/components/canvas/RichTextEditor";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import CommentSystem from "@/components/dashboard/CommentSystem";
import { Id } from "@/convex/_generated/dataModel";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { authClient } from "@/app/lib/auth.client";
import WhiteboardCanvas from "@/components/canvas/Whiteboard";
import DocumentSwitcher from "@/components/canvas/DocumentSwitcher";
import WhiteboardSwitcher from "@/components/canvas/WhiteboardSwitcher";
import { FileText, Layout } from "lucide-react";

type ActiveView = "editor" | "whiteboard";

export default function ResearchDashboard() {
  const params = useParams();
  const router = useRouter();

  const authenticatedUser = authClient.useSession();
  // The better-auth hook exposes `data` which is `undefined` while loading,
  // becomes `null` for unauthenticated, or an object for authenticated.
  const authData = (authenticatedUser as any)?.data;
  const authPending = (authenticatedUser as any)?.isPending || (authenticatedUser as any)?.isLoading || false;
  const isAuthLoading = authData === undefined || authPending;
  const user = authData?.user || null;
  const sessionId = (params?.sessionId ?? "") as Id<"sessions">;
  const [activeView, setActiveView] = useState<ActiveView>("editor");
  const [activeDocumentId, setActiveDocumentId] = useState<Id<"documents"> | null>(null);
  const [activeWhiteboardId, setActiveWhiteboardId] = useState<Id<"whiteboards"> | null>(null);

  // Queries
  const session = useQuery(api.crud.session.getOne, { id: sessionId });
  const documents = useQuery(api.crud.document.getBySession, { sessionId });
  const whiteboards = useQuery(api.crud.whiteboard.getBySession, { sessionId });
  const updateDocument = useMutation(api.crud.document.update);

  // Set default active items when data loads
  useEffect(() => {
    if (documents && documents.length > 0 && !activeDocumentId) {
      setActiveDocumentId(documents[0]._id);
    }
    if (whiteboards && whiteboards.length > 0 && !activeWhiteboardId) {
      setActiveWhiteboardId(whiteboards[0]._id);
    }
  }, [documents, whiteboards, activeDocumentId, activeWhiteboardId]);

  // Get active document and whiteboard
  const activeDocument = documents?.find(doc => doc._id === activeDocumentId);
  const activeWhiteboard = whiteboards?.find(wb => wb._id === activeWhiteboardId);

  // Actions
  const handleChatbotQueryRaw = useAction(api.functions.ai.handleUserQuery);

  const handleChatbotQuery = async (
    sessionId: Id<"sessions">,
    prompt: string
  ) => {
    return await handleChatbotQueryRaw({ sessionId, prompt });
  };

  const handleContentUpdate = async (content: string) => {
    if (activeDocument) {
      try {
        await updateDocument({
          id: activeDocument._id,
          updates: { content, updatedAt: Date.now() }
        });
      } catch (error) {
        console.error("Error updating document:", error);
      }
    }
  };

  // to be replaced with real data fetching
  const [summaries, setSummaries] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);

  const [collaborators, setCollaborators] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only redirect to root when auth has finished resolving (data is not undefined)
    // and there's no authenticated user.
    if (!isAuthLoading && !user) {
      router.push("/");
    }
  }, [router, isAuthLoading, user]);

  const handleAddComment = (
    content: string,
    position?: { x: number; y: number }
  ) => {
    if (!content.trim() || !user) return;

    const comment = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      content: content,
      timestamp: new Date().toISOString(),
      resolved: false,
      position,
    };

    setComments((prev) => [...prev, comment]);
  };

  const handleResolveComment = (commentId: string) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId ? { ...comment, resolved: true } : comment
      )
    );
  };

  const handleReplyToComment = (commentId: string, content: string) => {
    if (!content.trim() || !user) return;

    const reply = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      content: content,
      timestamp: new Date().toISOString(),
      resolved: false,
    };

    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? { ...comment, replies: [...(comment.replies || []), reply] }
          : comment
      )
    );
  };

  const handleExport = () => {
    setShowExportModal(true);
  };

  const handleSendMessage = (message: string) => {
    if (!user) return;

    const messageObj = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      content: message,
      timestamp: new Date().toISOString(),
      type: "user" as const,
    };

    setMessages((prev) => [...prev, messageObj]);
  };

  // Show a loading state while auth is resolving or the session query is pending
  if (isAuthLoading || session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/20">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Loading your research session...</h2>
          <p className="text-muted-foreground">Please wait while we prepare your workspace</p>
        </div>
      </div>
    );
  }

  return session ? (
    <div className="min-h-screen bg-background flex dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/20">
      <Sidebar
        session={session}
        messages={messages}
        collaborators={collaborators!}
        user={user}
        onSendMessage={handleSendMessage}
        onChatbotQuery={handleChatbotQuery}
        loading={loading}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <DashboardHeader
          session={session}
          collaborators={collaborators!}
          onInvite={() => setShowInviteModal(true)}
          onExport={handleExport}
        />

        {/* View Toggle and Switchers */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 rounded-l border ${
                activeView === "editor"
                  ? "bg-primary text-white border-primary"
                  : "bg-white border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700"
              }`}
              onClick={() => setActiveView("editor")}
            >
              Editor
            </button>
            <button
              className={`px-4 py-2 rounded-r border ${
                activeView === "whiteboard"
                  ? "bg-primary text-white border-primary"
                  : "bg-white border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700"
              }`}
              onClick={() => setActiveView("whiteboard")}
            >
              Whiteboard
            </button>
          </div>

          <div className="flex gap-4">
            {activeView === "editor" ? (
              <DocumentSwitcher
                sessionId={sessionId}
                activeDocumentId={activeDocumentId}
                onDocumentChange={setActiveDocumentId}
              />
            ) : (
              <WhiteboardSwitcher
                sessionId={sessionId}
                activeWhiteboardId={activeWhiteboardId}
                onWhiteboardChange={setActiveWhiteboardId}
              />
            )}
          </div>
        </div>

        {/* Document Editor with Comment System */}
        <div className="flex-1 p-6 relative">
          <div className="max-w-6xl mx-auto relative">
            {activeView === "editor" ? (
              activeDocument ? (
                <>
                  <CommentSystem
                    comments={comments}
                    collaborators={collaborators!}
                    user={user}
                    onAddComment={handleAddComment}
                    onResolveComment={handleResolveComment}
                    onReplyToComment={handleReplyToComment}
                  />
                  <RichTextEditor
                    value={activeDocument.content || ""}
                    onChange={handleContentUpdate}
                    placeholder="Begin your research document..."
                  />
                </>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <FileText size={48} className="mx-auto mb-4 opacity-50" />
                  No document selected
                </div>
              )
            ) : (
              activeWhiteboard ? (
                <WhiteboardCanvas
                  whiteboardId={activeWhiteboardId || undefined}
                />
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Layout size={48} className="mx-auto mb-4 opacity-50" />
                  No whiteboard selected
                </div>
              )
            )}
          </div>
        </div>
      </div>

      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        sessionId={sessionId}
      />
    </div>
  ) : null;
}