import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/mailer";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("paymentStatus");

    const where: any = {};
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;

    const workOrders = await prisma.workOrder.findMany({
      where,
      include: {
        user: { select: { id: true, email: true, name: true, phone: true } },
        device: { select: { brand: true, model: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(workOrders);
  } catch (error) {
    console.error(" Error fetching work orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch work orders" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const {
      workOrderId,
      status,
      notes,
      finalCost,
      sendEmail: shouldSendEmail,
    } = await req.json();

    if (!workOrderId) {
      return NextResponse.json(
        { error: "Work order ID required" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (notes) updateData.notes = notes;
    if (finalCost !== undefined) updateData.finalCost = finalCost;

    const updated = await prisma.workOrder.update({
      where: { id: workOrderId },
      data: updateData,
      include: {
        user: { select: { id: true, email: true, name: true } },
        device: { select: { brand: true, model: true } },
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "work_order_updated",
        entityType: "WorkOrder",
        entityId: workOrderId,
        newValue: JSON.stringify(updateData),
      },
    });

    // Send email notification if requested
    if (shouldSendEmail && updated.user.email) {
      let subject = "Work Order Update";
      let message = `Your work order for ${updated.device.brand} ${updated.device.model} has been updated.`;

      if (status) {
        const statusMessages = {
          ACCEPTED:
            "Your repair request has been accepted and work will begin soon.",
          IN_REPAIR: "Your device is now being repaired.",
          AWAITING_PARTS:
            "We're waiting for parts to arrive before continuing with your repair.",
          READY_FOR_PICKUP: "Your device is ready for pickup!",
          COMPLETED: "Your repair has been completed successfully.",
          CANCELLED: "Your work order has been cancelled.",
        };
        message =
          statusMessages[status as keyof typeof statusMessages] || message;
        subject = `Work Order ${status.toLowerCase().replace("_", " ")}`;
      }

      if (finalCost) {
        message += ` Final cost: $${finalCost.toFixed(2)}`;
      }

      const emailHtml = `<!doctype html>
<html>
  <head>
    <meta charSet="utf-8" />
    <title>${subject}</title>
  </head>
  <body style="font-family:Arial, sans-serif; color:#111;">
    <div style="max-width:640px;margin:0 auto;padding:24px;border:1px solid #eee;border-radius:12px">
      <h2 style="margin-top:0;color:#111">${subject}</h2>
      <p>Hi ${updated.user.name || "there"},</p>
      <p>${message}</p>
      ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ""}
      <p>If you have any questions, please contact our support team.</p>
      <p style="color:#888;font-size:12px">This is an automated email from ServiXing. Please do not reply.</p>
    </div>
  </body>
</html>`;

      await sendEmail({
        to: updated.user.email,
        subject,
        html: emailHtml,
        userIdForLog: updated.user.id,
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error(" Error updating work order:", error);
    return NextResponse.json(
      { error: "Failed to update work order" },
      { status: 500 }
    );
  }
}
