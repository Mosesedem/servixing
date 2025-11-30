import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { paymentService } from "@/lib/services/payment.service";
import { paystackWebhookSchema } from "@/lib/schemas/payment";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { env } from "@/lib/env";

/**
 * POST /api/webhooks/paystack
 * Handle Paystack webhook events with signature verification
 */
export async function POST(req: NextRequest) {
  try {
    const signature = (req.headers.get("x-paystack-signature") || "").trim();
    const secret = env.PAYSTACK_SECRET_KEY || "";

    // Read raw body for signature verification
    const rawBody = await req.text();

    // Verify webhook signature
    const computed = crypto
      .createHmac("sha512", secret)
      .update(rawBody)
      .digest("hex");

    if (!signature || computed !== signature) {
      logger.warn("Invalid Paystack webhook signature");
      // Return 200 to acknowledge receipt (Paystack best practice)
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // Parse and validate webhook payload
    const parsed = JSON.parse(rawBody);
    const payload = paystackWebhookSchema.parse(parsed);

    logger.info(`Paystack webhook received: ${payload.event}`);

    // Log webhook event for audit trail (commented out until DB model is confirmed)
    // await db.webhookLog.create({
    //   data: {
    //     provider: 'paystack',
    //     event: payload.event,
    //     payload: parsed,
    //     signature,
    //   },
    // }).catch((err: Error) => {
    //   logger.error('Failed to log webhook:', err);
    // });

    // Process webhook event
    await paymentService.handleWebhook("paystack", payload.event, payload.data);

    logger.info(`Webhook processed successfully: ${payload.event}`);
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    logger.error(
      "Webhook processing error:",
      error instanceof Error ? error : new Error(String(error))
    );
    // Always return 200 to avoid webhook retry storms
    return NextResponse.json(
      { received: true, error: "Processing error" },
      { status: 200 }
    );
  }
}
