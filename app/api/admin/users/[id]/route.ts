import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/mailer";
import config from "@/lib/config";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { role, sendEmail: shouldSendEmail } = await req.json();
    const userId = params.id;

    if (!role) {
      return NextResponse.json({ error: "Role is required" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, email: true, name: true, role: true },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "user_role_updated",
        entityType: "User",
        entityId: userId,
        oldValue: JSON.stringify({ role: "previous" }), // You'd need to fetch old value
        newValue: JSON.stringify({ role }),
      },
    });

    // Send email notification if requested
    if (shouldSendEmail && updatedUser.email) {
      const emailHtml = `<!doctype html>
<html>
  <head>
    <meta charSet="utf-8" />
    <title>Account Role Updated</title>
  </head>
  <body style="font-family:Arial, sans-serif; color:#111;">
    <div style="max-width:640px;margin:0 auto;padding:24px;border:1px solid #eee;border-radius:12px">
      <h2 style="margin-top:0;color:#111">Account Role Updated</h2>
      <p>Hi ${updatedUser.name || "there"},</p>
      <p>Your account role has been updated to <strong>${role.toLowerCase()}</strong>.</p>
      <p>If you have any questions, please contact our support team.</p>
      <p style="color:#888;font-size:12px">This is an automated email from ${
        config.app.name
      }. Please do not reply.</p>
    </div>
  </body>
</html>`;

      await sendEmail({
        to: updatedUser.email,
        subject: "Your account role has been updated",
        html: emailHtml,
        userIdForLog: userId,
      });
    }

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
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { sendEmail: shouldSendEmail } = await req.json();
    const userId = params.id;

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
