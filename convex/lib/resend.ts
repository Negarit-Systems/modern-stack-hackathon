import { Resend } from "resend";

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

export interface EmailTemplateData {
  inviterName: string;
  sessionTitle: string;
  sessionUrl: string;
  role: "editor" | "viewer";
  inviteId: string;
}

// Generate the invitation URL
export function generateInviteUrl(inviteId: string, baseUrl?: string): string {
  const base =
    baseUrl || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${base}/invites/${inviteId}`;
}

// Email template for invitations
export function getInviteEmailTemplate(data: EmailTemplateData) {
  const { inviterName, sessionTitle, sessionUrl, role, inviteId } = data;

  const roleText =
    role === "editor" ? "edit and collaborate on" : "view and comment on";
  const actionText = role === "editor" ? "Start Editing" : "View Session";

  return {
    subject: `${inviterName} invited you to ${roleText} "${sessionTitle}"`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invitation to ${sessionTitle}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e1e5e9; border-top: none; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
            .button:hover { background: #5a6fd8; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #6c757d; border-radius: 0 0 8px 8px; }
            .role-badge { display: inline-block; background: ${role === "editor" ? "#28a745" : "#17a2b8"}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-left: 8px; }
            .session-info { background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">Research Session Invitation</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">You've been invited to collaborate</p>
            </div>
            
            <div class="content">
              <h2 style="margin-top: 0;">Hello!</h2>
              <p><strong>${inviterName}</strong> has invited you to ${roleText} a research session.</p>
              
              <div class="session-info">
                <h3 style="margin: 0 0 10px 0; color: #495057;">${sessionTitle}</h3>
                <p style="margin: 0; color: #6c757d;">
                  Role: <span class="role-badge">${role === "editor" ? "Editor" : "Viewer"}</span>
                </p>
              </div>
              
              <p>Click the button below to accept the invitation and join the session:</p>
              
              <div style="text-align: center;">
                <a href="${sessionUrl}" class="button">${actionText}</a>
              </div>
              
              <p style="font-size: 14px; color: #6c757d; margin-top: 30px;">
                If the button doesn't work, you can copy and paste this link into your browser:<br>
                <a href="${sessionUrl}" style="color: #667eea; word-break: break-all;">${sessionUrl}</a>
              </p>
              
              <hr style="border: none; border-top: 1px solid #e1e5e9; margin: 30px 0;">
              
              <p style="font-size: 14px; color: #6c757d;">
                This invitation was sent by ${inviterName}. If you weren't expecting this invitation, 
                you can safely ignore this email.
              </p>
            </div>
            
            <div class="footer">
              <p>This invitation was sent from AI Research Copilot</p>
              <p style="margin: 5px 0 0 0; font-size: 12px;">
                Invitation ID: ${inviteId}
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
${inviterName} invited you to ${roleText} "${sessionTitle}"

Role: ${role === "editor" ? "Editor" : "Viewer"}

Click here to join: ${sessionUrl}

This invitation was sent by ${inviterName}. If you weren't expecting this invitation, you can safely ignore this email.

---
This invitation was sent from AI Research Copilot
Invitation ID: ${inviteId}
    `.trim(),
  };
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
      from: "AI Research Copilot <noreply@resend.dev>", // You'll need to verify your domain
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
