"use client";

import { useEffect, useState } from "react";
import AuthenticationModal from "@/components/auth/AuthenticationModal";
import { authClient } from "@/app/lib/auth.client";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function InvitePage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);

  const { data } = authClient.useSession();
  const { id: inviteId } = useParams<{ id: string }>() ?? {};
  const router = useRouter();

  const invitation = useQuery(api.crud.invite.getOne, {
    id: inviteId as Id<"invites">,
  });

  const updateInviteStatus = useMutation(
    api.crud.invite.updateStatusToAccepted
  );

  const addCollaborator = useMutation(api.crud.session.addCollaborator);

  console.log("Invitation:", invitation);

  useEffect(() => {
    if (!data?.user) {
      setShowAuthModal(true);
    } else {
      setShowAuthModal(false);
    }
  }, [data]);

  useEffect(() => {
    const handleInviteAcceptance = async () => {
      if (!data?.user || invitation === undefined) return;
      if (invitation === null) {
        router.push("/error?reason=invalid-invitation");
        return;
      }

      if (data.user.email !== invitation?.email) {
        router.push("/unauthorized?reason=email-mismatch");
      } else {
        try {
          await updateInviteStatus({ id: inviteId as Id<"invites"> });

          await addCollaborator({
            sessionId: invitation.sessionId,
            userId: data.user.id,
          });
          router.push(`/dashboard/${invitation.sessionId}`);
        } catch (error) {
          console.error("Failed to accept invite:", error);
          router.push("/error?reason=invite-acceptance-failed");
        }
      }
    };

    handleInviteAcceptance();
  }, [data, invitation, router, updateInviteStatus, addCollaborator, inviteId]);

  const handleModalClose = () => {
    setShowAuthModal(false);
    router.push("/");
  };

  const handleAuthenticated = (user: { email: string }) => {
    if (!invitation) {
      router.push("/error?reason=invalid-invitation");
      return;
    }
    if (user.email !== invitation.email) {
      router.push("/unauthorized?reason=email-mismatch");
    } else {
      router.push(`/dashboard/${invitation.sessionId}`);
    }
  };

  if (!data?.user) {
    return (
      <div className="bg-amber-900">
        <AuthenticationModal
          isOpen={showAuthModal}
          onClose={handleModalClose}
          isSignUp={isSignUp}
          setIsSignUp={setIsSignUp}
          isForced={true}
          email={""}
          onAuthenticated={handleAuthenticated}
        />
      </div>
    );
  }
  return <div>Redirecting...</div>;
}
