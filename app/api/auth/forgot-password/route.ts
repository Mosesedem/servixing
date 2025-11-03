import { Resend } from "resend";
import { asyncHandler } from "@/lib/middleware/error-handler";
import { forgotPasswordSchema } from "@/lib/schemas/user";
import { authService } from "@/lib/services";
import { successResponse } from "@/lib/api-response";
import { logger } from "@/lib/logger";

const resendClient = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export const POST = asyncHandler(async (req: Request) => {
  const body = await req.json();
  const { email } = forgotPasswordSchema.parse(body);

  const resetDetails = await authService.requestPasswordReset(email);

  // Always return a generic message to prevent account enumeration
  const genericMessage =
    "If an account matches that email, a reset link has been sent.";

  if (!resetDetails) {
    return successResponse({ message: genericMessage });
  }

  const baseUrl = process.env.NEXTAUTH_URL || new URL(req.url).origin;
  const resetUrl = new URL("/auth/reset-password", baseUrl);
  resetUrl.searchParams.set("token", resetDetails.token);

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #1f2933;">
      <h2 style="color: #f97316;">Reset your Servixing password</h2>
      <p>Hi${resetDetails.name ? ` ${resetDetails.name}` : ""},</p>
      <p>We received a request to reset the password for your Servixing account.</p>
      <p>You can reset your password using either option below. Your code expires in 10 minutes.</p>
      <ol style="margin: 16px 0 24px; padding-left: 20px;">
        <li style="margin-bottom: 12px;">
          <strong>One-click link:</strong> Click the button to open the reset page with your code pre-filled.<br/>
          <a href="${resetUrl.toString()}" style="display: inline-block; margin-top: 12px; padding: 12px 24px; background-color: #f97316; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">Reset password</a>
        </li>
        <li>
          <strong>Manual entry:</strong> Open <a href="${baseUrl}/auth/reset-password">${baseUrl}/auth/reset-password</a> and enter this 6‑digit code:<br/>
          <div style="font-size: 24px; letter-spacing: 4px; font-weight: 700; margin-top: 8px; color: #111827;">${
            resetDetails.token
          }</div>
        </li>
      </ol>
      <p>If you did not request this change, you can safely ignore this email.</p>
      <p style="margin-top: 24px; color: #52606d; font-size: 14px;">This code expires at ${resetDetails.expires.toUTCString()}.</p>
      <hr style="margin: 32px 0; border: none; border-top: 1px solid #e4e7eb;" />
      <p style="color: #9aa5b1; font-size: 12px;">
        Served with care by the Servixing team. If you need assistance, contact support at <a href="mailto:support@servixing.com">support@servixing.com</a>.
      </p>
    </div>
  `;

  if (!resendClient) {
    logger.warn(
      "RESEND_API_KEY not configured; password reset email not sent",
      {
        email: resetDetails.email,
        resetUrl: resetUrl.toString(),
      }
    );
    return successResponse({
      message: genericMessage,
      note: "Email service is not configured; reset link logged on server.",
    });
  }

  const { error } = await resendClient.emails.send({
    from: process.env.EMAIL_FROM || "Servixing <noreply@servixing.com>",
    to: [resetDetails.email],
    subject: "Reset your Servixing password",
    html: emailHtml,
  });

  if (error) {
    logger.error("Failed to send password reset email", error);
    throw new Error(error.message || "Failed to send password reset email");
  }

  return successResponse({ message: genericMessage });
});
