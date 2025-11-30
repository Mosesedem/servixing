import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/mailer";
import config from "@/lib/config";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";
    const isOwner = session.user.id === (await params).id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const userId = (await params).id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        addresses: true,
        devices: {
          select: {
            id: true,
            deviceType: true,
            brand: true,
            model: true,
            serialNumber: true,
            createdAt: true,
            workOrders: { select: { id: true, status: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        workOrders: {
          select: {
            id: true,
            status: true,
            issueDescription: true,
            createdAt: true,
            finalCost: true,
            paymentStatus: true,
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
        supportTickets: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
        auditLogs: {
          select: {
            id: true,
            action: true,
            entityType: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";
    const isOwner = session.user.id === (await params).id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name, email, phone, role } = await req.json();
    const userId = (await params).id;

    // Only admins can change role
    if (role && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Only SUPER_ADMIN can assign SUPER_ADMIN role
    if (role === "SUPER_ADMIN" && userRole !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Only super admins can assign super admin role" },
        { status: 403 }
      );
    }

    // Get current user data for audit log
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, phone: true, role: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (role !== undefined) updateData.role = role;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, email: true, name: true, phone: true, role: true },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "user_updated",
        entityType: "User",
        entityId: userId,
        oldValue: JSON.stringify(currentUser),
        newValue: JSON.stringify(updateData),
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || (session.user as any).role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden - Super admin required" },
        { status: 403 }
      );
    }

    const { sendEmail: shouldSendEmail } = await req.json();
    const userId = (await params).id;

    // Get user info before deletion
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Soft delete by setting deletedAt
    await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "user_deleted",
        entityType: "User",
        entityId: userId,
      },
    });

    // Send email notification if requested
    if (shouldSendEmail && user.email) {
      const emailHtml = `<!doctype html>
<html>
  <head>
    <meta charSet="utf-8" />
    <title>Account Deactivated</title>
  </head>
  <body style="font-family:Arial, sans-serif; color:#111;">
    <div style="max-width:640px;margin:0 auto;padding:24px;border:1px solid #eee;border-radius:12px">
      <h2 style="margin-top:0;color:#111">Account Deactivated</h2>
      <p>Hi ${user.name || "there"},</p>
      <p>Your account has been deactivated by an administrator.</p>
      <p>If you believe this was done in error, please contact our support team.</p>
      <p style="color:#888;font-size:12px">This is an automated email from ${
        config.app.name
      }. Please do not reply.</p>
    </div>
  </body>
</html>`;

      await sendEmail({
        to: user.email,
        subject: "Your account has been deactivated",
        html: emailHtml,
        userIdForLog: userId,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
