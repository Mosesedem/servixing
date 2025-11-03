import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { checkWarranty } from "@/lib/warranty-check";
import { type NextRequest, NextResponse } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return errorResponse("UNAUTHORIZED", "Authentication required", 401);
    }

    const { brand, serialNumber, imei } = await req.json();

    if (!brand) {
      return errorResponse("VALIDATION_ERROR", "Brand required", 400);
    }

    if (!serialNumber && !imei) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Serial number or IMEI required",
        400
      );
    }

    // Perform the check
    const result = await checkWarranty(brand, serialNumber, imei);

    return successResponse(result);
  } catch (error) {
    console.error("[WARRANTY_CHECK] Service error:", error);
    return errorResponse("INTERNAL_ERROR", "Service check failed", 500);
  }
}
