import { NextRequest, NextResponse } from "next/server";
import { createRateLimiter } from "@/lib/rate-limit";
import { prisma } from "@/lib/db";

/**
 * Public: Check status of warranty/device check by email, serial number, or IMEI
 */
export async function POST(req: NextRequest) {
  try {
    const rl = createRateLimiter(30, "10 m");
    if (rl) {
      const ip = req.headers.get("x-forwarded-for") || "anonymous";
      const { success } = await rl.limit(`public:warranty-check-status:${ip}`);
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

    const { email, serialNumber, imei } = await req.json();

    if (!email && !serialNumber && !imei) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "At least one search criteria required",
          },
        },
        { status: 400 }
      );
    }

    // Build where clause for finding warranty check
    const whereConditions: any[] = [];

    if (email) {
      whereConditions.push({
        workOrder: {
          user: {
            email: email.toLowerCase(),
          },
        },
      });
    }

    if (serialNumber) {
      whereConditions.push({
        workOrder: {
          device: {
            serialNumber: serialNumber,
          },
        },
      });
    }

    if (imei) {
      whereConditions.push({
        workOrder: {
          device: {
            imei: imei,
          },
        },
      });
    }

    const warrantyCheck = await prisma.warrantyCheck.findFirst({
      where: {
        OR: whereConditions,
      },
      include: {
        workOrder: {
          select: {
            id: true,
            paymentStatus: true,
            user: true,
            device: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!warrantyCheck) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message:
              "No warranty check found matching the provided information",
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      status: warrantyCheck.status,
      provider: warrantyCheck.provider,
      warrantyStatus: warrantyCheck.warrantyStatus,
      warrantyExpiry: warrantyCheck.warrantyExpiry,
      deviceStatus: warrantyCheck.deviceStatus,
      paymentStatus: warrantyCheck.workOrder?.paymentStatus || "UNKNOWN",
      errorMessage: warrantyCheck.errorMessage,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: error?.message || "Status check failed",
        },
      },
      { status: 500 }
    );
  }
}
