import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { paymentService } from "@/lib/services/payment.service";
import { logger } from "@/lib/logger";
import { env } from "@/lib/env";

/**
 * POST /api/webhooks/flutterwave
 * Handle Flutterwave webhook events with signature verification
 */
export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("verif-hash") || "";
    const secret = env.FLUTTERWAVE_SECRET_HASH || "";

    // Read raw body for signature verification
    const rawBody = await req.text();

    // Verify webhook signature if secret is configured
    if (secret) {
      const computed = crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex");

      if (computed !== signature) {
        logger.warn("Invalid Flutterwave webhook signature");
        return NextResponse.json({ received: true }, { status: 200 });
      }
    }

    // Parse payload
    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const data = payload.data;

    logger.info(`Flutterwave webhook received: ${event}`);

    // Process webhook event
    await paymentService.handleWebhook("flutterwave", event, data);

    logger.info(`Flutterwave webhook processed successfully: ${event}`);
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    logger.error(
      "Flutterwave webhook processing error:",
      error instanceof Error ? error : new Error(String(error))
    );
    // Always return 200 to avoid webhook retry storms
    return NextResponse.json(
      { received: true, error: "Processing error" },
      { status: 200 }
    );
  }
}
