import { Resend } from "resend";
import { EmailTemplateData, getInviteEmailTemplate } from "./emailTemplate";

// Initialize Resend with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailInviteData {
  to: string;
  inviterName: string;
  sessionTitle: string;
  sessionId: string;
  role: "editor" | "viewer";
  inviteId: string;
}

// Generate the invitation URL
export function generateInviteUrl(inviteId: string, baseUrl?: string): string {
  const base =
    baseUrl || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${base}/invites/${inviteId}`;
}

// Send invitation email
export async function sendInviteEmail(
  data: EmailInviteData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const sessionUrl = generateInviteUrl(data.inviteId);
    const templateData: EmailTemplateData = {
      inviterName: data.inviterName,
      sessionTitle: data.sessionTitle,
      sessionUrl,
      role: data.role,
      inviteId: data.inviteId,
    };

    const emailTemplate = getInviteEmailTemplate(templateData);

    const result = await resend.emails.send({
      from: "AI Research Copilot <noreply@negaritsystems.com.et>",
      to: [data.to],
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    });

    if (result.error) {
      console.error("Resend error:", result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error("Failed to send invite email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// Send batch invitation emails
export async function sendBatchInviteEmails(
  invites: EmailInviteData[]
): Promise<{
  success: boolean;
  results: Array<{
    email: string;
    success: boolean;
    messageId?: string;
    error?: string;
  }>;
}> {
  const results = await Promise.allSettled(
    invites.map(async (invite) => {
      const result = await sendInviteEmail(invite);
      return {
        email: invite.to,
        ...result,
      };
    })
  );

  const processedResults = results.map((result, index) => {
    if (result.status === "fulfilled") {
      return result.value;
    } else {
      return {
        email: invites[index].to,
        success: false,
        error: result.reason?.message || "Unknown error",
      };
    }
  });

  const allSuccessful = processedResults.every((result) => result.success);

  return {
    success: allSuccessful,
    results: processedResults,
  };
}
