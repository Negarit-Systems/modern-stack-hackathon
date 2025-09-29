"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "../../../../components/ui/button";
import { Card } from "../../../../components/ui/card";
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  FileText,
  Shield,
} from "lucide-react";
import { convex } from "@convex-dev/better-auth/plugins";

export default function InvitePage() {
  const params = useParams();
  const inviteId = params?.id as string;
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState("");

  // Get invite details
  const invite = useQuery(api.functions.emailInvites.getInviteById, {
    inviteId: inviteId as any,
  });

  // Mutations
  const acceptInvite = useMutation(api.functions.emailInvites.acceptInvite);
  const cancelInvite = useMutation(api.functions  .emailInvites.cancelInvite);

  const handleAcceptInvite = async () => {
    if (!inviteId) return;

    setIsProcessing(true);
    setMessage("");

    try {
      await acceptInvite({ inviteId: inviteId as any });
      setMessage("Invitation accepted! Redirecting to session...");

      // Redirect to the session after a short delay
      setTimeout(() => {
        window.location.href = `/session/${invite?.sessionId}`;
      }, 2000);
    } catch (error) {
      console.error("Failed to accept invite:", error);
      setMessage(
        error instanceof Error ? error.message : "Failed to accept invitation"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeclineInvite = async () => {
    if (!inviteId) return;

    setIsProcessing(true);
    setMessage("");

    try {
      await cancelInvite({ inviteId: inviteId as any });
      setMessage("Invitation declined.");
    } catch (error) {
      console.error("Failed to decline invite:", error);
      setMessage(
        error instanceof Error ? error.message : "Failed to decline invitation"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (invite === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (invite === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4 p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Invitation Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            This invitation may have expired or been cancelled.
          </p>
          <Button
            onClick={() => (window.location.href = "/")}
            className="w-full"
          >
            Go to Home
          </Button>
        </Card>
      </div>
    );
  }

  const { session, inviter, status, role } = invite;

  const getStatusIcon = () => {
    switch (status) {
      case "PENDING":
        return <Clock className="w-6 h-6 text-yellow-500" />;
      case "ACCEPTED":
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case "CANCELLED":
        return <XCircle className="w-6 h-6 text-red-500" />;
      case "EXPIRED":
        return <XCircle className="w-6 h-6 text-gray-500" />;
      default:
        return <Clock className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "PENDING":
        return "Pending";
      case "ACCEPTED":
        return "Accepted";
      case "CANCELLED":
        return "Cancelled";
      case "EXPIRED":
        return "Expired";
      default:
        return "Unknown";
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "PENDING":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "ACCEPTED":
        return "text-green-600 bg-green-50 border-green-200";
      case "CANCELLED":
        return "text-red-600 bg-red-50 border-red-200";
      case "EXPIRED":
        return "text-gray-600 bg-gray-50 border-gray-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
      <Card className="max-w-2xl w-full mx-4 p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            {getStatusIcon()}
            <span
              className={`ml-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor()}`}
            >
              {getStatusText()}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Research Session Invitation
          </h1>

          <p className="text-gray-600">
            You've been invited to collaborate on a research session
          </p>
        </div>

        <div className="space-y-6">
          {/* Session Details */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <FileText className="w-8 h-8 text-blue-500 mt-1" />
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {session.title || "Untitled Session"}
                </h2>
                <p className="text-gray-600 mb-4">
                  Research session for collaborative work
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>
                    Created: {new Date(session.createdAt).toLocaleDateString()}
                  </span>
                  <span>•</span>
                  <span>
                    Updated:{" "}
                    {session.updatedAt
                      ? new Date(session.updatedAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Inviter Details */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center space-x-4">
              <User className="w-8 h-8 text-green-500" />
              <div>
                <h3 className="font-semibold text-gray-900">
                  Invited by {inviter.firstName} {inviter.lastName}
                </h3>
                <p className="text-sm text-gray-600">{inviter.email}</p>
              </div>
            </div>
          </div>

          {/* Role Details */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center space-x-4">
              <Shield className="w-8 h-8 text-purple-500" />
              <div>
                <h3 className="font-semibold text-gray-900">
                  Your Role: {role === "editor" ? "Editor" : "Viewer"}
                </h3>
                <p className="text-sm text-gray-600">
                  {role === "editor"
                    ? "You can edit, comment, and collaborate on this session"
                    : "You can view and comment on this session"}
                </p>
              </div>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`p-4 rounded-lg ${
                message.includes("accepted") || message.includes("declined")
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {message}
            </div>
          )}

          {/* Action Buttons */}
          {status === "PENDING" && (
            <div className="flex space-x-4">
              <Button
                onClick={handleAcceptInvite}
                disabled={isProcessing}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Accept Invitation
                  </>
                )}
              </Button>

              <Button
                onClick={handleDeclineInvite}
                disabled={isProcessing}
                variant="outline"
                className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Decline
              </Button>
            </div>
          )}

          {status === "ACCEPTED" && (
            <div className="text-center">
              <Button
                onClick={() =>
                  (window.location.href = `/session/${session._id}`)
                }
                className="bg-blue-600 hover:bg-blue-700"
              >
                Go to Session
              </Button>
            </div>
          )}

          {(status === "CANCELLED" || status === "EXPIRED") && (
            <div className="text-center">
              <Button
                onClick={() => (window.location.href = "/")}
                variant="outline"
              >
                Go to Home
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
