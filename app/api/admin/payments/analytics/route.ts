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

    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get("from");
    const dateTo = searchParams.get("to");

    const analytics = await paymentService.getPaymentAnalytics(
      dateFrom ? new Date(dateFrom) : undefined,
      dateTo ? new Date(dateTo) : undefined
    );

    return successResponse(analytics);
  } catch (error) {
    return errorResponse("INTERNAL_ERROR", "Failed to fetch analytics", 500);
  }
}
