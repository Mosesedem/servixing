import { NextRequest, NextResponse } from "next/server";
import { verifyPaymentSchema } from "@/lib/schemas/payment";
import { paymentService } from "@/lib/services/payment.service";
import { createRateLimiter } from "@/lib/rate-limit";
import { prisma } from "@/lib/db";

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

    // If provider verification succeeded, persist authoritative status to DB
    if (result.status === "success" || result.payment?.status === "PAID") {
      // Load the payment to get workOrder + metadata context
      const payment = await prisma.payment.findUnique({
        where: { id: result.payment.id },
        include: {
          workOrder: {
            include: {
              device: true,
              warrantyChecks: { orderBy: { createdAt: "desc" }, take: 1 },
            },
          },
        },
      });

      if (payment) {
        // Update payment + workOrder status to PAID atomically
        await prisma.$transaction([
          prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: "PAID",
              webhookVerified: true,
              webhookVerifiedAt: new Date(),
            },
          }),
          payment.workOrder
            ? prisma.workOrder.update({
                where: { id: payment.workOrder.id },
                data: { paymentStatus: "PAID" },
              })
            : prisma.payment.update({ where: { id: payment.id }, data: {} }), // no-op to keep array length
        ]);

        // Auto-create warranty check when this payment is for warranty-check and none exists yet
        const isWarrantyCheck =
          payment.metadata &&
          (payment.metadata as any)?.service === "warranty-check";
        const hasExistingCheck = !!payment.workOrder?.warrantyChecks?.[0];

        if (isWarrantyCheck && payment.workOrder && !hasExistingCheck) {
          const device = payment.workOrder.device;
          if (device) {
            const { checkWarranty } = await import("@/lib/warranty-check");
            const res = await checkWarranty(
              device.brand,
              device.serialNumber || undefined,
              device.imei || undefined
            );

            const normalizedStatus =
              res.status === "active" || res.status === "in_warranty"
                ? "SUCCESS"
                : res.status === "expired" || res.status === "out_of_warranty"
                ? "FAILED"
                : res.status === "requires_verification"
                ? "MANUAL_REQUIRED"
                : "SUCCESS";

            await prisma.warrantyCheck.create({
              data: {
                workOrderId: payment.workOrder.id,
                provider: res.provider,
                initiatedBy: "payment_verify",
                status: normalizedStatus,
                warrantyStatus: res.status || null,
                warrantyExpiry: res.expiryDate
                  ? new Date(res.expiryDate)
                  : null,
                purchaseDate: res.purchaseDate
                  ? new Date(res.purchaseDate)
                  : null,
                coverageStart: res.coverageStart
                  ? new Date(res.coverageStart)
                  : null,
                coverageEnd: res.coverageEnd ? new Date(res.coverageEnd) : null,
                deviceStatus: res.deviceStatus || null,
                result: {
                  ...res,
                  checkedAt: new Date().toISOString(),
                  serialNumber: device.serialNumber,
                  imei: device.imei,
                },
                errorMessage: null,
              },
            });
          }
        }
      }
    }

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
