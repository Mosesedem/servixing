import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/mailer";

/**
 * GET /api/admin/public-users/[id]
 * Get detailed info for a public user
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

    const userId = id;

    const user = await prisma.user.findUnique({
      where: { id: userId, password: null, deletedAt: null },
      include: {
        devices: {
          select: {
            id: true,
            deviceType: true,
            brand: true,
            model: true,
            serialNumber: true,
            createdAt: true,
          },
        },
        workOrders: {
          select: {
            id: true,
            status: true,
            issueDescription: true,
            createdAt: true,
            finalCost: true,
          },
          orderBy: { createdAt: "desc" },
        },
        supportTickets: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
        addresses: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Get public user error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/public-users/[id]
 * Update a public user
 * Admin only
 */
export async function PUT(
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

    const userId = id;
    const { name, email, phone, sendEmail: shouldSendEmail } = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        phone,
      },
    });

    // Send email notification if requested
    if (shouldSendEmail && updatedUser.email) {
      try {
        await sendEmail({
          to: updatedUser.email,
          subject: "Your Account Information Updated",
          html: `
            <h2>Hello ${updatedUser.name || "Valued Customer"},</h2>
            <p>Your account information has been updated by our admin team.</p>
            <p>If you have any questions, please contact our support team.</p>
            <br>
            <p>Best regards,<br>Servixing Team</p>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send update email:", emailError);
      }
    }

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Update public user error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/public-users/[id]
 * Soft delete a public user
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

    const userId = id;
    const { sendEmail: shouldSendEmail } = await req.json();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Soft delete
    await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });

    // Send email notification if requested
    if (shouldSendEmail && user.email) {
      try {
        await sendEmail({
          to: user.email,
          subject: "Account Deactivated",
          html: `
            <h2>Hello ${user.name || "Valued Customer"},</h2>
            <p>Your account has been deactivated by our admin team.</p>
            <p>If you believe this was done in error, please contact our support team.</p>
            <br>
            <p>Best regards,<br>Servixing Team</p>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send deletion email:", emailError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete public user error:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
