import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { type NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";

const setPasswordSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return errorResponse("UNAUTHORIZED", "Authentication required", 401);
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const data = setPasswordSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true },
    });

    if (!user) {
      return errorResponse("NOT_FOUND", "User not found", 404);
    }

    // If user has a password, verify current password
    if (user.password) {
      if (!data.currentPassword) {
        return errorResponse(
          "VALIDATION_ERROR",
          "Current password required",
          400
        );
      }

      const isValid = await bcrypt.compare(data.currentPassword, user.password);
      if (!isValid) {
        return errorResponse(
          "VALIDATION_ERROR",
          "Current password is incorrect",
          400
        );
      }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return successResponse({ message: "Password updated successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse("VALIDATION_ERROR", error.errors[0].message, 400);
    }
    console.error("Password update error:", error);
    return errorResponse("INTERNAL_ERROR", "Failed to update password", 500);
  }
}
