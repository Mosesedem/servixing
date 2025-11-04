import { NextRequest, NextResponse } from "next/server";
import { verifyPaymentSchema } from "@/lib/schemas/payment";
import { paymentService } from "@/lib/services/payment.service";
import { createRateLimiter } from "@/lib/rate-limit";

/**
 * Public: Verify a payment by reference without requiring auth
 */
export async function POST(req: NextRequest) {
  try {
    const rl = createRateLimiter(20, "10 m");
    if (rl) {
      const ip = req.headers.get("x-forwarded-for") || "anonymous";
      const { success } = await rl.limit(`public:payments:verify:${ip}`);
      if (!success) {
        return NextResponse.json(
          {
            success: false,
            error: { code: "RATE_LIMIT", message: "Too many requests" },
          },
          { status: 429 }
        );
      }
    }

    const body = await req.json();
    const data = verifyPaymentSchema.parse(body);

    const result = await paymentService.verifyPayment(data.reference);

    return NextResponse.json({
      success: true,
      data: {
        status: result.status,
        amount: result.amount,
        payment: {
          id: result.payment.id,
          status: result.payment.status,
          amount: result.payment.amount,
          currency: result.payment.currency,
          metadata: result.payment.metadata,
          createdAt: result.payment.createdAt,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: error?.message || "Verification failed",
        },
      },
      { status: 500 }
    );
  }
}
