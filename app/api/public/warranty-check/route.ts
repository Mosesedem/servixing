import { NextRequest, NextResponse } from "next/server";
import { checkWarranty } from "@/lib/warranty-check";
import { createRateLimiter } from "@/lib/rate-limit";

/**
 * Public: Perform warranty/device check without auth.
 * Note: Rate-limited to reduce abuse.
 */
export async function POST(req: NextRequest) {
  try {
    const rl = createRateLimiter(30, "10 m");
    if (rl) {
      const ip = req.headers.get("x-forwarded-for") || "anonymous";
      const { success } = await rl.limit(`public:warranty-check:${ip}`);
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

    const { brand, serialNumber, imei } = await req.json();

    if (!brand) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Brand required" },
        },
        { status: 400 }
      );
    }

    if (!serialNumber && !imei) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Serial number or IMEI required",
          },
        },
        { status: 400 }
      );
    }

    const result = await checkWarranty(brand, serialNumber, imei);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: error?.message || "Service check failed",
        },
      },
      { status: 500 }
    );
  }
}
