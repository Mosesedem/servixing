import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { asyncHandler } from "@/lib/middleware/error-handler";
import { successResponse, errorResponse } from "@/lib/api-response";
import { z } from "zod";
import { db } from "@/lib/db";

const updateProviderSchema = z.object({
  provider: z.enum(["paystack", "etegram", "flutterwave"]),
});

export const POST = asyncHandler(
  async (req: Request, { params }: { params: { id: string } }) => {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;

    if (!userId) {
      return errorResponse("UNAUTHORIZED", "Authentication required", 401);
    }

    const body = await req.json();
    const data = updateProviderSchema.parse(body);

    // Find and update the payment
    const payment = await db.payment.findUnique({
      where: { id: params.id },
    });

    if (!payment) {
      return errorResponse("NOT_FOUND", "Payment not found", 404);
    }

    if (payment.userId !== userId) {
      return errorResponse("FORBIDDEN", "Access denied", 403);
    }

    if (payment.status !== "PENDING") {
      return errorResponse(
        "BAD_REQUEST",
        "Can only update provider for pending payments",
        400
      );
    }

    // Update the provider
    const updatedPayment = await db.payment.update({
      where: { id: params.id },
      data: { provider: data.provider },
    });

    return successResponse({
      payment: {
        id: updatedPayment.id,
        provider: updatedPayment.provider,
        status: updatedPayment.status,
      },
    });
  }
);
