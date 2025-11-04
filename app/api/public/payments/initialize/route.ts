import { NextRequest, NextResponse } from "next/server";
import { initializePaymentSchema } from "@/lib/schemas/payment";
import { paymentService } from "@/lib/services/payment.service";
import { prisma } from "@/lib/db";
import { UserRole } from "@prisma/client";
import { createRateLimiter } from "@/lib/rate-limit";

/**
 * Public: Initialize a payment without requiring auth
 * Validates payload and finds/creates a user by email to satisfy FK
 */
export async function POST(req: NextRequest) {
  try {
    // Basic rate limiting by IP
    const rl = createRateLimiter(10, "10 m");
    if (rl) {
      const ip = req.headers.get("x-forwarded-for") || "anonymous";
      const { success } = await rl.limit(`public:payments:init:${ip}`);
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
    const data = initializePaymentSchema.parse(body);

    // Ensure a user exists for this email (payments require userId)
    const email = data.email.toLowerCase();
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: { email, role: UserRole.CUSTOMER },
      });
    }

    const result = await paymentService.initializePayment({
      workOrderId: data.workOrderId,
      amount: data.amount,
      email,
      userId: user.id,
      metadata: data.metadata,
    });

    return NextResponse.json({
      success: true,
      data: {
        authorizationUrl: result.authorizationUrl,
        accessCode: result.accessCode,
        reference: result.reference,
        paymentId: result.paymentId,
      },
    });
  } catch (error: any) {
    const message = error?.message || "Failed to initialize payment";
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message } },
      { status: 500 }
    );
  }
}
