import { NextResponse } from "next/server";
import crypto from "crypto";
import { paymentService } from "@/lib/services/payment.service";
import { paystackWebhookSchema } from "@/lib/schemas/payment";

export async function POST(req: Request) {
  try {
    const signature = (req.headers.get("x-paystack-signature") || "").trim();
    const secret = process.env.PAYSTACK_SECRET_KEY || "";

    // Read raw body for signature verification
    const rawBody = await req.text();

    const computed = crypto
      .createHmac("sha512", secret)
      .update(rawBody)
      .digest("hex");

    if (!signature || computed !== signature) {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const parsed = JSON.parse(rawBody);
    const payload = paystackWebhookSchema.parse(parsed);

    await paymentService.handleWebhook(payload.event, payload.data);

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    // Always return 200 to avoid webhook retries storm; errors are logged in service
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
