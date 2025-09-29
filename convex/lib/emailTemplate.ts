export interface EmailTemplateData {
  inviterName: string;
  sessionTitle: string;
  sessionUrl: string;
  role: "editor" | "viewer";
  inviteId: string;
}

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
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #2d3748; margin: 0; padding: 0; background: #f4f6f8; }
            .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
            .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 40px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 26px; font-weight: 700; }
            .header p { margin: 8px 0 0; opacity: 0.85; font-size: 16px; }
            .content { padding: 32px; }
            .content h2 { margin-top: 0; font-size: 20px; color: #1a202c; }
            .content p { margin: 12px 0; font-size: 16px; color: #4a5568; }
            .button { display: inline-block; background: #6366f1; color: white !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 6px rgba(99,102,241,0.3); transition: background 0.2s ease; }
            .button:hover { background: #4f46e5; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 14px; color: #718096; border-top: 1px solid #edf2f7; }
            .footer p { margin: 6px 0; }
            .role-badge { display: inline-block; background: ${role === "editor" ? "#10b981" : "#0ea5e9"}; color: white; padding: 5px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; margin-left: 8px; }
            .session-info { background: #f9fafb; padding: 18px; border-radius: 8px; margin: 20px 0; border: 1px solid #edf2f7; }
            a { color: #6366f1; text-decoration: none; }
            a:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Research Session Invitation</h1>
              <p>You've been invited to collaborate</p>
            </div>

            <div class="content">
              <h2>Hello!</h2>
              <p><strong>${inviterName}</strong> has invited you to ${roleText} a research session.</p>

              <div class="session-info">
                <h3 style="margin: 0 0 10px 0; color: #2d3748;">${sessionTitle}</h3>
                <p style="margin: 0; color: #4a5568;">
                  Role: <span class="role-badge">${role === "editor" ? "Editor" : "Viewer"}</span>
                </p>
              </div>

              <p>Click the button below to accept the invitation and join the session:</p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${sessionUrl}" class="button">${actionText}</a>
              </div>

              <p style="font-size: 14px; color: #718096; margin-top: 30px;">
                If the button doesn't work, you can copy and paste this link into your browser:<br>
                <a href="${sessionUrl}" style="word-break: break-all;">${sessionUrl}</a>
              </p>

              <hr style="border: none; border-top: 1px solid #edf2f7; margin: 30px 0;">

              <p style="font-size: 14px; color: #718096;">
                This invitation was sent by ${inviterName}. If you weren't expecting this invitation,
                you can safely ignore this email.
              </p>
            </div>

            <div class="footer">
              <p>This invitation was sent from <strong>AI Research Copilot</strong></p>
              <p style="font-size: 12px;">Invitation ID: ${inviteId}</p>
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
