import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createRateLimiter } from "@/lib/rate-limit";

/**
 * Public: Get minimal payment details by id (no auth)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rl = createRateLimiter(30, "10 m");
    if (rl) {
      const ip = request.headers.get("x-forwarded-for") || "anonymous";
      const { success } = await rl.limit(`public:payments:get:${ip}`);
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

    const { id } = await params;
    const payment = await prisma.payment.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        amount: true,
        currency: true,
        metadata: true,
        createdAt: true,
      },
    });

    if (!payment) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Payment not found" },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: payment });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: error?.message || "Failed to fetch payment",
        },
      },
      { status: 500 }
    );
  }
}
