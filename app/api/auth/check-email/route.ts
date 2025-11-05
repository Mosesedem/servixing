import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/services";
import { z } from "zod";

const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

/**
 * POST /api/auth/check-email
 * Check if an email is registered and its account status
 * Useful for providing better UX on signup/login forms
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = emailSchema.parse(body);

    const status = await authService.checkAccountStatus(email);

    // Don't expose too much information for security
    // Only return what's necessary for UX
    return NextResponse.json({
      exists: status.exists,
      isRegistered: status.isRegistered,
      needsPasswordSetup: status.isPublicUser,
      message: status.isPublicUser
        ? "This email has been used for service requests. You can claim this account by registering or using 'Forgot Password'."
        : status.isRegistered
        ? "An account with this email already exists. Please sign in."
        : "This email is available for registration.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    console.error("Check email error:", error);
    return NextResponse.json(
      { error: "Failed to check email status" },
      { status: 500 }
    );
  }
}
