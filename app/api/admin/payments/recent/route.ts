import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";
import { paymentService } from "@/lib/services/payment.service";
import { UserRole } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role as UserRole | undefined;

    if (!role || (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
      return errorResponse("FORBIDDEN", "Admin privileges required", 403);
    }

    const recent = await paymentService.getRecentPayments(10);

    return successResponse(recent);
  } catch (error) {
    return errorResponse(
      "INTERNAL_ERROR",
      "Failed to fetch recent payments",
      500
    );
  }
}
