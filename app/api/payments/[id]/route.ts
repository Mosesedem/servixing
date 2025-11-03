import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";
import { prisma } from "@/lib/db";
import { UserRole } from "@prisma/client";

export async function GET(
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

    const { id: paymentId } = await params;

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        workOrder: {
          select: {
            id: true,
            status: true,
            device: { select: { brand: true, model: true } },
          },
        },
      },
    });

    if (!payment) {
      return errorResponse("NOT_FOUND", "Payment not found", 404);
    }

    if (
      payment.userId !== userId &&
      role !== "ADMIN" &&
      role !== "SUPER_ADMIN"
    ) {
      return errorResponse(
        "FORBIDDEN",
        "You do not have access to this payment",
        403
      );
    }

    return successResponse(payment);
  } catch (error) {
    return errorResponse("INTERNAL_ERROR", "Failed to fetch payment", 500);
  }
}
