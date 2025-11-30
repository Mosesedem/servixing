import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

/**
 * POST /api/admin/warranty-checks/[id]/retry
 * Retry a warranty check
 * Admin only
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (
      !adminUser ||
      (adminUser.role !== "ADMIN" && adminUser.role !== "SUPER_ADMIN")
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const checkId = id;

    // Reset the check to QUEUED status
    const updatedCheck = await prisma.warrantyCheck.update({
      where: { id: checkId },
      data: {
        status: "QUEUED",
        finishedAt: null,
        errorMessage: null,
      },
    });

    // TODO: Trigger the actual warranty check process here
    // This would typically involve calling the warranty check service

    return NextResponse.json({ check: updatedCheck });
  } catch (error) {
    console.error("Retry warranty check error:", error);
    return NextResponse.json(
      { error: "Failed to retry warranty check" },
      { status: 500 }
    );
  }
}
