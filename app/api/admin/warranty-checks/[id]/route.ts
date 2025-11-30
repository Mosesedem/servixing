import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/mailer";

/**
 * GET /api/admin/warranty-checks/[id]
 * Get detailed info for a warranty check
 * Admin only
 */
export async function GET(
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

    const check = await prisma.warrantyCheck.findUnique({
      where: { id: checkId },
      include: {
        workOrder: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
            device: true,
          },
        },
      },
    });

    if (!check) {
      return NextResponse.json(
        { error: "Warranty check not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ check });
  } catch (error) {
    console.error("Get warranty check error:", error);
    return NextResponse.json(
      { error: "Failed to fetch warranty check" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/warranty-checks/[id]
 * Update a warranty check
 * Admin only
 */
export async function PATCH(
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
    const { status, sendEmail: shouldSendEmail } = await req.json();

    const updateData: any = { status };

    if (
      status === "SUCCESS" ||
      status === "FAILED" ||
      status === "MANUAL_REQUIRED"
    ) {
      updateData.finishedAt = new Date();
    }

    const updatedCheck = await prisma.warrantyCheck.update({
      where: { id: checkId },
      data: updateData,
      include: {
        workOrder: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
            device: {
              select: {
                brand: true,
                model: true,
              },
            },
          },
        },
      },
    });

    // Send email notification if requested
    if (shouldSendEmail && updatedCheck.workOrder?.user?.email) {
      const statusMessages = {
        SUCCESS: "Your warranty check has been completed successfully.",
        FAILED:
          "Your warranty check has failed. Manual verification may be required.",
        MANUAL_REQUIRED: "Your warranty check requires manual verification.",
      };
      const statusMessage =
        statusMessages[status as keyof typeof statusMessages] ||
        "Your warranty check status has been updated.";

      try {
        await sendEmail({
          to: updatedCheck.workOrder.user.email,
          subject: "Warranty Check Status Update",
          html: `
            <h2>Hello ${
              updatedCheck.workOrder.user.name || "Valued Customer"
            },</h2>
            <p>${statusMessage}</p>
            <p><strong>Provider:</strong> ${updatedCheck.provider.toUpperCase()}</p>
            <p><strong>Device:</strong> ${
              updatedCheck.workOrder.device.brand
            } ${updatedCheck.workOrder.device.model}</p>
            <br>
            <p>Best regards,<br>Servixing Team</p>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send warranty check email:", emailError);
      }
    }

    return NextResponse.json({ check: updatedCheck });
  } catch (error) {
    console.error("Update warranty check error:", error);
    return NextResponse.json(
      { error: "Failed to update warranty check" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/warranty-checks/[id]
 * Delete a warranty check
 * Admin only
 */
export async function DELETE(
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

    if (!adminUser || adminUser.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden - Super Admin only" },
        { status: 403 }
      );
    }

    const checkId = id;
    const { sendEmail: shouldSendEmail } = await req.json();

    const check = await prisma.warrantyCheck.findUnique({
      where: { id: checkId },
      include: {
        workOrder: {
          include: {
            user: {
              select: { email: true, name: true },
            },
            device: {
              select: { brand: true, model: true },
            },
          },
        },
      },
    });

    if (!check) {
      return NextResponse.json(
        { error: "Warranty check not found" },
        { status: 404 }
      );
    }

    // Delete the check
    await prisma.warrantyCheck.delete({
      where: { id: checkId },
    });

    // Send email notification if requested
    if (shouldSendEmail && check.workOrder?.user?.email) {
      try {
        await sendEmail({
          to: check.workOrder.user.email,
          subject: "Warranty Check Update",
          html: `
            <h2>Hello ${check.workOrder.user.name || "Valued Customer"},</h2>
            <p>Your warranty check for ${check.provider.toUpperCase()} has been removed from our system.</p>
            <p><strong>Device:</strong> ${check.workOrder.device.brand} ${
            check.workOrder.device.model
          }</p>
            <p>If you have any questions, please contact our support team.</p>
            <br>
            <p>Best regards,<br>Servixing Team</p>
          `,
        });
      } catch (emailError) {
        console.error(
          "Failed to send warranty check deletion email:",
          emailError
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete warranty check error:", error);
    return NextResponse.json(
      { error: "Failed to delete warranty check" },
      { status: 500 }
    );
  }
}
