"use client";

import { useEffect, useState } from "react";
import AuthenticationModal from "@/components/auth/AuthenticationModal";
import { authClient } from "@/app/lib/auth.client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Loader2 } from "lucide-react";

type InvitePageState =
  | "LOADING"
  | "AWAITING_AUTH"
  | "PROCESSING_INVITE"
  | "ERROR";

export default function InvitePage() {
  const [pageState, setPageState] = useState<InvitePageState>("LOADING");
  const [errorMessage, setErrorMessage] = useState(
    "An unknown error occurred."
  );
  const [isSignUp, setIsSignUp] = useState(true);

  const { data: session, isPending: isSessionLoading } =
    authClient.useSession();
  const params = useParams<{ id: string }>();
  const searchParam = useSearchParams();
  const emailParam = searchParam?.get("email");
  const sessionId = searchParam?.get("sessionId");
  const inviteId = params?.id;
  const router = useRouter();

  const updateInviteStatus = useMutation(
    api.crud.invite.updateStatusToAccepted
  );
  const addCollaborator = useMutation(api.crud.session.addCollaborator);

  // Decide the page state
  useEffect(() => {
    console.log("DEBUG -> session:", session);
    console.log("DEBUG -> isSessionLoading:", isSessionLoading);
    console.log("DEBUG -> inviteId:", inviteId);
    console.log("DEBUG -> emailParam:", emailParam);
    // console.log("DEBUG -> invite:", invite);

    if (typeof inviteId !== "string" || !emailParam || isSessionLoading) {
      if (typeof inviteId !== "string" || !emailParam) {
        setErrorMessage("Invalid invitation link.");
        setPageState("ERROR");
      }
      return;
    }

    if (!session?.user) {
      setPageState("AWAITING_AUTH");
      return;
    }

    if (session.user.email !== emailParam) {
      setErrorMessage(
        "You are logged in with a different email than the one invited."
      );
      setPageState("ERROR");
      return;
    }

    setPageState("PROCESSING_INVITE");
  }, [inviteId, emailParam, isSessionLoading, session]);

  // Accept invite once state is ready
  useEffect(() => {
    if (pageState !== "PROCESSING_INVITE" || !session?.user) return;

    const acceptInvitation = async () => {
      console.log("i am accepting the invitation");
      if (!inviteId || !emailParam) {
        setErrorMessage("Missing invitation details.");
        setPageState("ERROR");
        return;
      }

      console.log("DEBUG -> Accepting invite...");
      try {
        await updateInviteStatus({ id: inviteId as Id<"invites"> });
        await addCollaborator({
          sessionId: sessionId as Id<"sessions">,
          userId: session.user.id as string,
        });
        router.push(`/dashboard/${sessionId}`);
      } catch (error) {
        console.error("Failed to accept invite:", error);
        setErrorMessage(
          "We couldn't process your invitation. Please try again later."
        );
        setPageState("ERROR");
      }
    };

    acceptInvitation();
  }, [
    pageState,
    inviteId,
    session,
    updateInviteStatus,
    addCollaborator,
    router,
  ]);

  // Render UI
  if (pageState === "LOADING") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (pageState === "AWAITING_AUTH") {
    return (
      <AuthenticationModal
        isOpen={true}
        onClose={() => router.push("/")}
        isSignUp={isSignUp}
        setIsSignUp={setIsSignUp}
        isForced={true}
        email={emailParam || ""}
        onAuthenticated={() => setPageState("PROCESSING_INVITE")}
      />
    );
  }

  if (pageState === "ERROR") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-500">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p>{errorMessage}</p>
          <button
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
            onClick={() =>
              router.push(`/invite/${inviteId}?email=${emailParam}`)
            }
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium">Adding you to the session...</p>
      </div>
    </div>
  );
}
