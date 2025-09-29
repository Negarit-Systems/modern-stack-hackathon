import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email, sessionId, role, inviterName, sessionTitle } =
      await request.json();

    if (!email || !sessionId || !role || !inviterName || !sessionTitle) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Use your verified domain for production
    const fromEmail = "noreply@negaritsystems.com.et";

    const result = await resend.emails.send({
      from: `AI Research Copilot <${fromEmail}>`,
      to: [email],
      subject: `${inviterName} invited you to ${role === "editor" ? "edit" : "view"} "${sessionTitle}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; text-align: center;">Research Session Invitation</h1>
          <p><strong>${inviterName}</strong> has invited you to ${role === "editor" ? "edit and collaborate on" : "view and comment on"} a research session.</p>
          
          <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #495057;">${sessionTitle}</h3>
            <p style="margin: 0; color: #6c757d;">
              Role: <span style="background: ${role === "editor" ? "#28a745" : "#17a2b8"}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">${role === "editor" ? "Editor" : "Viewer"}</span>
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:3002/session/${sessionId}" style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
              ${role === "editor" ? "Start Editing" : "View Session"}
            </a>
          </div>
          
          <p style="font-size: 14px; color: #6c757d;">
            This invitation was sent by ${inviterName}. If you weren't expecting this invitation, you can safely ignore this email.
          </p>
        </div>
      `,
      text: `${inviterName} invited you to ${role === "editor" ? "edit" : "view"} "${sessionTitle}"\n\nRole: ${role === "editor" ? "Editor" : "Viewer"}\n\nClick here to join: http://localhost:3002/session/${sessionId}\n\nThis invitation was sent by ${inviterName}. If you weren't expecting this invitation, you can safely ignore this email.`,
    });

    if (result.error) {
      console.error("Resend error:", result.error);
      return NextResponse.json(
        { error: result.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.data?.id,
    });
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
