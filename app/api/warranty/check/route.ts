import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkWarranty } from "@/lib/warranty-check";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { deviceId, workOrderId } = await req.json();

    if (!deviceId) {
      return NextResponse.json(
        { error: "Device ID required" },
        { status: 400 }
      );
    }

    // Verify device belongs to user
    const device = await prisma.device.findUnique({
      where: { id: deviceId },
    });

    if (!device || device.userId !== session.user.id) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    // Check warranty
    const warranty = await checkWarranty(
      device.brand,
      device.serialNumber || undefined,
      device.imei || undefined
    );

    // If work order provided, update it with mapped status
    if (workOrderId) {
      // Map warranty status to WarrantyStatus enum
      const warrantyStatusMap: Record<
        string,
        | "IN_WARRANTY"
        | "OUT_OF_WARRANTY"
        | "PENDING"
        | "NONE"
        | "MANUAL_REQUIRED"
      > = {
        active: "IN_WARRANTY",
        expired: "OUT_OF_WARRANTY",
        unknown: "MANUAL_REQUIRED",
        not_applicable: "NONE",
        requires_verification: "PENDING",
      };

      const mappedStatus =
        warrantyStatusMap[warranty.status] || "MANUAL_REQUIRED";

      await prisma.workOrder.update({
        where: { id: workOrderId },
        data: {
          warrantyStatus: mappedStatus,
          warrantyProvider: warranty.provider,
        },
      });
    }

    return NextResponse.json(warranty);
  } catch (error) {
    console.error("[v0] Warranty check error:", error);
    return NextResponse.json(
      { error: "Warranty check failed" },
      { status: 500 }
    );
  }
}
