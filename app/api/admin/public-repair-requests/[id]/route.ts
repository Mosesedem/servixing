import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/mailer";
import { Prisma } from "@prisma/client";

/**
 * GET /api/admin/public-repair-requests/[id]
 * Get detailed info for a public repair request
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

    const requestId = id;

    const request = await prisma.workOrder.findUnique({
      where: { id: requestId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            password: true,
            addresses: true,
          },
        },
        device: true,
        payments: {
          orderBy: { createdAt: "desc" },
        },
        parts: {
          include: {
            workOrder: false, // Avoid circular
          },
        },
        warrantyChecks: true,
        supportTickets: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!request) {
      return NextResponse.json(
        { error: "Repair request not found" },
        { status: 404 }
      );
    }

    // Check if it's a public user
    if (request.user.password !== null) {
      return NextResponse.json(
        { error: "Not a public repair request" },
        { status: 404 }
      );
    }

    return NextResponse.json({ request });
  } catch (error) {
    console.error("Get public repair request error:", error);
    return NextResponse.json(
      { error: "Failed to fetch repair request" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/public-repair-requests/[id]
 * Update a public repair request
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

    const requestId = id;
    const {
      status,
      notes,
      finalCost,
      sendEmail: shouldSendEmail,
    } = await req.json();

    const updateData: any = {};
    if (status) updateData.status = status;
    if (notes) updateData.notes = notes;
    if (finalCost !== undefined) updateData.finalCost = finalCost;

    const updatedRequest = await prisma.workOrder.update({
      where: { id: requestId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        device: {
          select: {
            brand: true,
            model: true,
          },
        },
      },
    });

    // Send email notification if requested
    if (shouldSendEmail && updatedRequest.user.email) {
      const statusMessages = {
        ACCEPTED:
          "Your repair request has been accepted and is being processed.",
        IN_REPAIR: "Your device is now in repair.",
        AWAITING_PARTS: "We're waiting for parts to arrive for your repair.",
        READY_FOR_PICKUP: "Your device is ready for pickup.",
        COMPLETED: "Your repair has been completed.",
        CANCELLED: "Your repair request has been cancelled.",
      };
      const statusMessage =
        statusMessages[status as keyof typeof statusMessages] ||
        "Your repair request status has been updated.";

      try {
        await sendEmail({
          to: updatedRequest.user.email,
          subject: "Repair Request Status Update",
          html: `
            <h2>Hello ${updatedRequest.user.name || "Valued Customer"},</h2>
            <p>${statusMessage}</p>
            <p><strong>Device:</strong> ${updatedRequest.device.brand} ${
            updatedRequest.device.model
          }</p>
            <p><strong>Issue:</strong> ${updatedRequest.issueDescription}</p>
            ${
              finalCost
                ? `<p><strong>Final Cost:</strong> $${finalCost}</p>`
                : ""
            }
            ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ""}
            <br>
            <p>Best regards,<br>Servixing Team</p>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send status update email:", emailError);
      }
    }

    return NextResponse.json({ request: updatedRequest });
  } catch (error) {
    console.error("Update public repair request error:", error);
    return NextResponse.json(
      { error: "Failed to update repair request" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/public-repair-requests/[id]
 * Soft delete a public repair request
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

    const requestId = id;
    const { sendEmail: shouldSendEmail } = await req.json();

    const request = await prisma.workOrder.findUnique({
      where: { id: requestId },
      include: {
        user: {
          select: { email: true, name: true },
        },
        device: {
          select: { brand: true, model: true },
        },
      },
    });

    if (!request) {
      return NextResponse.json(
        { error: "Repair request not found" },
        { status: 404 }
      );
    }

    // Soft delete
    await prisma.workOrder.update({
      where: { id: requestId },
      data: { deletedAt: new Date() },
    });

    // Send email notification if requested
    if (shouldSendEmail && request.user.email) {
      try {
        await sendEmail({
          to: request.user.email,
          subject: "Repair Request Cancelled",
          html: `
            <h2>Hello ${request.user.name || "Valued Customer"},</h2>
            <p>Your repair request for ${request.device.brand} ${
            request.device.model
          } has been cancelled.</p>
            <p>If you have any questions, please contact our support team.</p>
            <br>
            <p>Best regards,<br>Servixing Team</p>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send cancellation email:", emailError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete public repair request error:", error);
    return NextResponse.json(
      { error: "Failed to delete repair request" },
      { status: 500 }
    );
  }
}
