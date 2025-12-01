import { NextRequest, NextResponse } from "next/server";
import { checkWarranty } from "@/lib/warranty-check";
import { createRateLimiter } from "@/lib/rate-limit";
import { prisma } from "@/lib/db";
import { UserRole } from "@prisma/client";

/**
 * Public: Perform warranty/device check without auth.
 * Stores the check result in database for admin management.
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

    const { brand, serialNumber, imei, name, email, phone } = await req.json();

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

    // Find or create user if contact info provided
    let user = null;
    if (email) {
      user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: email.toLowerCase(),
            name: name || null,
            phone: phone || null,
            role: UserRole.CUSTOMER,
          },
        });
      }
    }

    // Create device record if user exists
    let device = null;
    if (user) {
      device = await prisma.device.findFirst({
        where: {
          userId: user.id,
          OR: [
            { serialNumber: serialNumber || undefined },
            { imei: imei || undefined },
          ].filter(Boolean),
        },
      });

      if (!device) {
        device = await prisma.device.create({
          data: {
            userId: user.id,
            deviceType: "unknown", // Will be updated when more info available
            brand,
            model: "Unknown Model",
            serialNumber: serialNumber || null,
            imei: imei || null,
            description: `Device checked via public warranty check`,
          },
        });
      }
    }

    // Create work order for warranty check
    let workOrder = null;
    if (user && device) {
      workOrder = await prisma.workOrder.create({
        data: {
          userId: user.id,
          deviceId: device.id,
          contactName: name,
          contactEmail: email,
          contactPhone: phone,
          issueDescription: `Warranty check requested for ${brand} device`,
          dropoffType: "DROPOFF",
          status: "CREATED",
          warrantyChecked: true,
          metadata: {
            submittedAt: new Date().toISOString(),
            source: "public_warranty_check",
          },
        },
      });
    }

    const result = await checkWarranty(brand, serialNumber, imei);

    // Map provider result into structured fields
    const normalizedStatus =
      result.status === "active" || result.status === "in_warranty"
        ? "SUCCESS"
        : result.status === "expired" || result.status === "out_of_warranty"
        ? "FAILED"
        : result.status === "requires_verification"
        ? "MANUAL_REQUIRED"
        : "SUCCESS";

    const warrantyCheck = await prisma.warrantyCheck.create({
      data: {
        workOrderId: workOrder?.id || null,
        provider: result.provider,
        initiatedBy: user?.id || "public",
        status: normalizedStatus,
        warrantyStatus: result.status || null,
        warrantyExpiry: result.expiryDate ? new Date(result.expiryDate) : null,
        purchaseDate: result.purchaseDate
          ? new Date(result.purchaseDate)
          : null,
        coverageStart: result.coverageStart
          ? new Date(result.coverageStart)
          : null,
        coverageEnd: result.coverageEnd ? new Date(result.coverageEnd) : null,
        deviceStatus: result.deviceStatus || null,
        result: {
          ...result,
          checkedAt: new Date().toISOString(),
          serialNumber,
          imei,
        },
        errorMessage: null,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        checkId: warrantyCheck.id,
        workOrderId: workOrder?.id,
      },
    });
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
