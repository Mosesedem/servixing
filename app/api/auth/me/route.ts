import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

import { asyncHandler } from "@/lib/middleware/error-handler";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth";

/**
 * GET /api/auth/me
 * Get current logged-in user information
 */
export const GET = asyncHandler(async (req: Request) => {
  const user = await getCurrentUser();

  if (!user) {
    return errorResponse("UNAUTHORIZED", "Not authenticated", 401);
  }

  // Get full user details from database
  const { prisma } = await import("@/lib/db");

  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      image: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!fullUser) {
    return errorResponse("NOT_FOUND", "User not found", 404);
  }

  return successResponse({ user: fullUser });
});
