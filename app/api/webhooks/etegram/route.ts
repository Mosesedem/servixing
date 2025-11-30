import { NextRequest, NextResponse } from "next/server";
import { paymentService } from "@/lib/services/payment.service";
import { logger } from "@/lib/logger";

/**
 * POST /api/webhooks/etegram
 * Handle Etegram webhook events
 */
export async function POST(req: NextRequest) {
  try {
    // Read raw body
    const rawBody = await req.text();
    const payload = JSON.parse(rawBody);

    const event = payload.event;
    const data = payload.data;

    logger.info(`Etegram webhook received: ${event}`);

    // Process webhook event
    await paymentService.handleWebhook("etegram", event, data);

    logger.info(`Etegram webhook processed successfully: ${event}`);
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    logger.error(
      "Etegram webhook processing error:",
      error instanceof Error ? error : new Error(String(error))
    );
    // Always return 200 to avoid webhook retry storms
    return NextResponse.json(
      { received: true, error: "Processing error" },
      { status: 200 }
    );
  }
}
