import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/mailer";

/**
 * GET /api/admin/parts-requests/[id]
 * Get detailed info for a part request
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

    const partId = id;

    const part = await prisma.part.findUnique({
      where: { id: partId },
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

    if (!part) {
      return NextResponse.json(
        { error: "Part request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ part });
  } catch (error) {
    console.error("Get part request error:", error);
    return NextResponse.json(
      { error: "Failed to fetch part request" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/parts-requests/[id]
 * Update a part request
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

    const partId = id;
    const { orderStatus, sendEmail: shouldSendEmail } = await req.json();

    const updatedPart = await prisma.part.update({
      where: { id: partId },
      data: { orderStatus },
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

    // Send email notification if requested and there's a work order
    if (shouldSendEmail && updatedPart.workOrder?.user?.email) {
      const statusMessages = {
        ORDERED: "Your part has been ordered and is on its way.",
        SHIPPED: "Your part has been shipped.",
        DELIVERED: "Your part has been delivered.",
        CANCELLED: "Your part order has been cancelled.",
      };
      const statusMessage =
        statusMessages[orderStatus as keyof typeof statusMessages] ||
        "Your part status has been updated.";

      try {
        await sendEmail({
          to: updatedPart.workOrder.user.email,
          subject: "Part Order Status Update",
          html: `
            <h2>Hello ${
              updatedPart.workOrder.user.name || "Valued Customer"
            },</h2>
            <p>${statusMessage}</p>
            <p><strong>Part:</strong> ${updatedPart.title}</p>
            <p><strong>Device:</strong> ${updatedPart.workOrder.device.brand} ${
            updatedPart.workOrder.device.model
          }</p>
            <br>
            <p>Best regards,<br>Servixing Team</p>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send part status email:", emailError);
      }
    }

    return NextResponse.json({ part: updatedPart });
  } catch (error) {
    console.error("Update part request error:", error);
    return NextResponse.json(
      { error: "Failed to update part request" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/parts-requests/[id]
 * Delete a part request
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

    const partId = id;
    const { sendEmail: shouldSendEmail } = await req.json();

    const part = await prisma.part.findUnique({
      where: { id: partId },
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

    if (!part) {
      return NextResponse.json(
        { error: "Part request not found" },
        { status: 404 }
      );
    }

    // Delete the part
    await prisma.part.delete({
      where: { id: partId },
    });

    // Send email notification if requested
    if (shouldSendEmail && part.workOrder?.user?.email) {
      try {
        await sendEmail({
          to: part.workOrder.user.email,
          subject: "Part Order Cancelled",
          html: `
            <h2>Hello ${part.workOrder.user.name || "Valued Customer"},</h2>
            <p>Your part order for "${part.title}" has been cancelled.</p>
            <p><strong>Device:</strong> ${part.workOrder.device.brand} ${
            part.workOrder.device.model
          }</p>
            <p>If you have any questions, please contact our support team.</p>
            <br>
            <p>Best regards,<br>Servixing Team</p>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send part cancellation email:", emailError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete part request error:", error);
    return NextResponse.json(
      { error: "Failed to delete part request" },
      { status: 500 }
    );
  }
}
