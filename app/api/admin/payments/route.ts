import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/mailer";
import config from "@/lib/config";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const payments = await prisma.payment.findMany({
      include: {
        user: { select: { id: true, email: true, name: true } },
        workOrder: {
          select: {
            id: true,
            device: { select: { brand: true, model: true } },
            issueDescription: true,
          },
        },
        refunds: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const {
      paymentId,
      action,
      reason,
      sendEmail: shouldSendEmail,
    } = await req.json();

    if (!paymentId || !action) {
      return NextResponse.json(
        { error: "Payment ID and action required" },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { user: { select: { id: true, email: true, name: true } } },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    let result;

    if (action === "refund") {
      // Create refund record
      result = await prisma.refund.create({
        data: {
          paymentId,
          amount: payment.amount,
          reason: reason || "Administrative refund",
          requestedBy: session.user.id,
          status: "COMPLETED", // Assuming instant refund for admin
          processedAt: new Date(),
        },
      });

      // Update payment status
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: "REFUNDED",
          refundAmount: payment.amount,
          refundedAt: new Date(),
        },
      });

      // Log the action
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: "payment_refunded",
          entityType: "Payment",
          entityId: paymentId,
        },
      });

      // Send email notification
      if (shouldSendEmail && payment.user.email) {
        const emailHtml = `<!doctype html>
<html>
  <head>
    <meta charSet="utf-8" />
    <title>Payment Refunded</title>
  </head>
  <body style="font-family:Arial, sans-serif; color:#111;">
    <div style="max-width:640px;margin:0 auto;padding:24px;border:1px solid #eee;border-radius:12px">
      <h2 style="margin-top:0;color:#111">Payment Refunded</h2>
      <p>Hi ${payment.user.name || "there"},</p>
      <p>Your payment of ₦${payment.amount.toFixed(2)} has been refunded.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
      <p>The refund should appear in your account within 3-5 business days.</p>
      <p>If you have any questions, please contact our support team.</p>
      <p style="color:#888;font-size:12px">This is an automated email from ${
        config.app.name
      }. Please do not reply.</p>
    </div>
  </body>
</html>`;

        await sendEmail({
          to: payment.user.email,
          subject: "Your payment has been refunded",
          html: emailHtml,
          userIdForLog: payment.user.id,
        });
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error processing payment action:", error);
    return NextResponse.json(
      { error: "Failed to process payment action" },
      { status: 500 }
    );
  }
}
