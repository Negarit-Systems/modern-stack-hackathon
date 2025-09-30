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

export default function ResearchDashboard() {
  const params = useParams();
  const router = useRouter();

  const authenticatedUser = authClient.useSession();
  const user = authenticatedUser?.data?.user || null;
  const sessionId = (params?.sessionId ?? "") as Id<"sessions">;

  // Queries
  const session = useQuery(api.crud.session.getOne, { id: sessionId });
  const document = useQuery(api.crud.document.getBySession, { sessionId });
  const updateDocument = useMutation(api.crud.document.update);
  // const collaborators = useQuery(api.crud.session.getCollaborators, { sessionId });

  // Actions
  const handleChatbotQueryRaw = useAction(api.functions.ai.handleUserQuery);

  const handleChatbotQuery = async (
    sessionId: Id<"sessions">,
    prompt: string
  ) => {
    return await handleChatbotQueryRaw({ sessionId, prompt });
  };

  const handleContentUpdate = async (content: string) => {
    if (document) {
      try {
        await updateDocument({
          id: document._id,
          updates: { content },
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
    if (!user) {
      router.push("/");
    }
  }, [router]);

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

        {/* Document Editor with Comment System */}
        <div className="flex-1 p-6 relative dark:p-8">
          <div className="max-w-4xl mx-auto relative dark:max-w-5xl">
            <CommentSystem
              comments={comments}
              collaborators={collaborators!}
              user={user}
              onAddComment={handleAddComment}
              onResolveComment={handleResolveComment}
              onReplyToComment={handleReplyToComment}
            />
            <div className="dark:bg-gradient-to-br dark:from-slate-900/50 dark:via-slate-800/30 dark:to-blue-900/10 dark:border dark:border-slate-700/50 dark:rounded-2xl dark:p-8 dark:shadow-2xl dark:backdrop-blur-sm">
              <RichTextEditor
                value={document?.content || ""}
                onChange={handleContentUpdate}
                placeholder="Begin your research document..."
              />
            </div>
          </div>
        </div>
      </div>

      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        sessionId={sessionId}
      />
      {/* <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        session={session}
        document={document}
        summaries={summaries}
        comments={comments}
      /> */}
    </div>
  ) : null;
}
