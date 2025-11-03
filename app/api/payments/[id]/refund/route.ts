import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";
import { paymentService } from "@/lib/services/payment.service";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { UserRole } from "@prisma/client";

const refundSchema = z.object({
  amount: z.number().positive().optional(),
  reason: z.string().min(3).max(500),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;
    const role = (session?.user as any)?.role as UserRole | undefined;

    if (!userId) {
      return errorResponse("UNAUTHORIZED", "Authentication required", 401);
    }

    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return errorResponse("FORBIDDEN", "Admin privileges required", 403);
    }

    const { id: paymentId } = await params;

    // Ensure payment exists and is PAID
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });
    if (!payment) {
      return errorResponse("NOT_FOUND", "Payment not found", 404);
    }

    const body = await request.json();
    const data = refundSchema.parse(body);

    const result = await paymentService.initiateRefund({
      paymentId,
      amount: data.amount,
      reason: data.reason,
      requestedBy: userId,
    });

    return successResponse(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse("VALIDATION_ERROR", error.errors[0].message, 400);
    }
    return errorResponse("INTERNAL_ERROR", "Failed to initiate refund", 500);
  }
}
