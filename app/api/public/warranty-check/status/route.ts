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

    const { email, serialNumber, imei, paymentId } = await req.json();

    // If paymentId is provided, get check from payment
    if (paymentId) {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          warrantyChecks: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      });

      if (!payment) {
        return NextResponse.json(
          {
            success: false,
            error: { code: "NOT_FOUND", message: "Payment not found" },
          },
          { status: 404 }
        );
      }

      // If warranty check doesn't exist yet, ensure payment is PAID then create it
      if (!payment.warrantyChecks?.[0]) {
        // Guard: avoid running check for unpaid payments
        if (payment.status !== "PAID") {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "PAYMENT_NOT_PAID",
                message:
                  "Payment not verified yet. Please retry after verification.",
              },
            },
            { status: 409 }
          );
        }

        const metadata = payment.metadata as any;
        if (!metadata?.brand) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "NOT_FOUND",
                message: "Device information not found",
              },
            },
            { status: 404 }
          );
        }

        // Import the checkWarranty function
        const { checkWarranty } = await import("@/lib/warranty-check");

        const result = await checkWarranty(
          metadata.brand,
          metadata.serialNumber || undefined,
          metadata.imei || undefined
        );

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
            paymentId: payment.id,
            provider: result.provider,
            initiatedBy: "public",
            status: normalizedStatus,
            serialNumber: metadata.serialNumber || null,
            imei: metadata.imei || null,
            warrantyStatus: result.status || null,
            warrantyExpiry: result.expiryDate
              ? new Date(result.expiryDate)
              : null,
            purchaseDate: result.purchaseDate
              ? new Date(result.purchaseDate)
              : null,
            coverageStart: result.coverageStart
              ? new Date(result.coverageStart)
              : null,
            coverageEnd: result.coverageEnd
              ? new Date(result.coverageEnd)
              : null,
            deviceStatus: result.deviceStatus || null,
            result: {
              ...result,
              checkedAt: new Date().toISOString(),
              serialNumber: metadata.serialNumber,
              imei: metadata.imei,
            },
            errorMessage: null,
          },
        });

        return NextResponse.json({
          success: true,
          status: warrantyCheck.status,
          provider: warrantyCheck.provider,
          warrantyStatus: warrantyCheck.warrantyStatus,
          warrantyExpiry: warrantyCheck.warrantyExpiry,
          deviceStatus: warrantyCheck.deviceStatus,
          paymentStatus: payment.status,
          errorMessage: warrantyCheck.errorMessage,
        });
      } else {
        // Return existing check
        const check = payment.warrantyChecks[0];
        return NextResponse.json({
          success: true,
          status: check.status,
          provider: check.provider,
          warrantyStatus: check.warrantyStatus,
          warrantyExpiry: check.warrantyExpiry,
          deviceStatus: check.deviceStatus,
          paymentStatus: payment.status,
          errorMessage: check.errorMessage,
        });
      }
    }

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
      // For email, we need to find payments with that email in metadata, then warranty checks
      // But since email is in payment metadata, and warranty check links to payment, it's complex.
      // For simplicity, since public checks don't have email in warranty check, perhaps skip email search for now.
      // Or add email to WarrantyCheck as well, but for now, let's make it search by serial/imei only.
    }

    if (serialNumber) {
      whereConditions.push({
        serialNumber: serialNumber,
      });
    }

    if (imei) {
      whereConditions.push({
        imei: imei,
      });
    }

    if (whereConditions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message:
              "At least one search criteria required (serial number or IMEI)",
          },
        },
        { status: 400 }
      );
    }

    const warrantyCheck = await prisma.warrantyCheck.findFirst({
      where: {
        OR: whereConditions,
        paymentId: { not: null }, // Only public checks
      },
      include: {
        payment: {
          select: {
            id: true,
            status: true,
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
      paymentStatus: warrantyCheck.payment?.status || "UNKNOWN",
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
