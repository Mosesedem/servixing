import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { asyncHandler } from "@/lib/middleware/error-handler";
import { successResponse } from "@/lib/api-response";
import { verifyPaymentSchema } from "@/lib/schemas/payment";
import { paymentService } from "@/lib/services/payment.service";

export const POST = asyncHandler(async (req: Request) => {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;

  if (!userId) {
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Unauthorized" },
      }),
      { status: 401, headers: { "content-type": "application/json" } }
    );
  }

  const body = await req.json();
  const data = verifyPaymentSchema.parse(body);

  const result = await paymentService.verifyPayment(data.reference);

  return successResponse({
    status: result.status,
    amount: result.amount,
    payment: result.payment,
  });
});
