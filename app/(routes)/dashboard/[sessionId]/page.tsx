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
import { mockCollaborators } from "@/lib/mockData";

export default function ResearchDashboard() {
  const params = useParams();
  const router = useRouter();
  const sessionId = (params?.sessionId ?? "") as Id<"sessions">;

  // Queries
  const session = useQuery(api.crud.session.getOne, { id: sessionId });
  const document = useQuery(api.crud.document.getBySession, { sessionId });
  const updateDocument = useMutation(api.crud.document.update);
  // const collaborators = useQuery(api.crud.session.getCollaborators, { sessionId });

  // Actions
  const handleChatbotQueryRaw = useAction(api.functions.ai.handleUserQuery);

  const handleChatbotQuery = (sessionId: Id<"sessions">, prompt: string) => {
    return handleChatbotQueryRaw({ sessionId, prompt });
  };

  const handleContentUpdate = async (content: string) => {
    try {
      await updateDocument({
        id: document!._id,
        updates: { content }
      });
    } catch (error) {
      console.error('Error updating document:', error);
    }
  };


  // to be replaced with real data fetching
  const [summaries, setSummaries] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);

  const [collaborators, setCollaborators] = useState(mockCollaborators)
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get user data
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      router.push("/");
      return;
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

  const handleFileUpload = async () => {
    setLoading(true);

    try {
      // Replace with real file processing
      // for (const file of []) {
      //   // Process file and update summaries
      // }
    } catch (error) {
      console.error("File upload failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar
        session={session}
        messages={messages}
        collaborators={collaborators!}
        user={user}
        onSendMessage={handleSendMessage}
        onChatbotQuery={handleChatbotQuery}
        onFileUpload={handleFileUpload}
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
        <div className="flex-1 p-6 relative">
          <div className="max-w-4xl mx-auto relative">
            <CommentSystem
              comments={comments}
              collaborators={collaborators!}
              user={user}
              onAddComment={handleAddComment}
              onResolveComment={handleResolveComment}
              onReplyToComment={handleReplyToComment}
            />
            <RichTextEditor
              value={document?.content || ""}
              onChange={handleContentUpdate}
              placeholder="Begin your research document..."
            />
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
  );
}
