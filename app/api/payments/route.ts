import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";
import { paymentService } from "@/lib/services/payment.service";

/**
 * GET /api/payments
 * Get payment history for logged-in user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse("UNAUTHORIZED", "Authentication required", 401);
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");

    const result = await paymentService.getPaymentHistory(
      session.user.id,
      page,
      limit
    );

    // Filter by status if provided
    let payments = result.payments;
    if (status && status !== "all") {
      payments = payments.filter((p) => p.status === status);
    }

    return successResponse({
      payments,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Payment history error:", error);
    return errorResponse(
      "INTERNAL_ERROR",
      "Failed to fetch payment history",
      500
    );
  }
}
