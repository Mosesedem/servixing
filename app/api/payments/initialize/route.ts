import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { asyncHandler } from "@/lib/middleware/error-handler";
import { successResponse } from "@/lib/api-response";
import { initializePaymentSchema } from "@/lib/schemas/payment";
import { paymentService } from "@/lib/services/payment.service";

export const POST = asyncHandler(async (req: Request) => {
  const session = await getServerSession(authOptions);

  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId || !session?.user?.email) {
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Unauthorized" },
      }),
      { status: 401, headers: { "content-type": "application/json" } }
    );
  }

  const body = await req.json();
  const data = initializePaymentSchema.parse({
    ...body,
    email: session.user.email,
  });

  const result = await paymentService.initializePayment({
    workOrderId: data.workOrderId,
    amount: data.amount,
    email: data.email,
    userId: userId,
    metadata: data.metadata,
  });

  return successResponse({
    authorizationUrl: result.authorizationUrl,
    accessCode: result.accessCode,
    reference: result.reference,
    paymentId: result.paymentId,
  });
});
