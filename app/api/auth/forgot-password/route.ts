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
      <p>You can set a new password by clicking the button below. This link will expire in 1 hour.</p>
      <p style="text-align: center; margin: 32px 0;">
        <a href="${resetUrl.toString()}" style="display: inline-block; padding: 12px 24px; background-color: #f97316; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">
          Reset password
        </a>
      </p>
      <p>If you did not request this change, you can safely ignore this email.</p>
  <p style="margin-top: 32px; color: #52606d; font-size: 14px;">This link will expire at ${resetDetails.expires.toUTCString()}.</p>
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
