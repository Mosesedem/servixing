import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// POST /api/user/invoices/[id]/email - Email invoice to user
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get payment (invoice) with work order details
    const payment = await prisma.payment.findFirst({
      where: {
        id,
        workOrder: {
          userId: session.user.id,
        },
      },
      include: {
        workOrder: {
          include: {
            device: true,
            user: true,
          },
        },
      },
    });

    if (!payment || !payment.workOrder) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Format currency
    const formatCurrency = (amount: number, currency: string) => {
      return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: currency,
      }).format(amount);
    };

    // Format date
    const formatDate = (date: Date) => {
      return new Date(date).toLocaleDateString("en-NG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    // Create email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #2563eb;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background-color: #f9fafb;
              padding: 30px;
              border: 1px solid #e5e7eb;
            }
            .invoice-details {
              background-color: white;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .detail-label {
              font-weight: bold;
              color: #6b7280;
            }
            .total {
              font-size: 24px;
              font-weight: bold;
              color: #2563eb;
              text-align: right;
              margin-top: 20px;
              padding-top: 20px;
              border-top: 2px solid #2563eb;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 14px;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: bold;
            }
            .status-paid {
              background-color: #d1fae5;
              color: #065f46;
            }
            .status-pending {
              background-color: #fef3c7;
              color: #92400e;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Invoice #${payment.id.slice(-8).toUpperCase()}</h1>
            <p>Servixing - Device Repair Service</p>
          </div>
          
          <div class="content">
            <p>Dear ${payment.workOrder.user.name || "Customer"},</p>
            <p>Thank you for choosing Servixing. Please find your invoice details below:</p>
            
            <div class="invoice-details">
              <div class="detail-row">
                <span class="detail-label">Invoice Number:</span>
                <span>#${payment.id.slice(-8).toUpperCase()}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Invoice Date:</span>
                <span>${formatDate(payment.createdAt)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="status-badge ${
                  payment.status === "PAID" ? "status-paid" : "status-pending"
                }">
                  ${payment.status}
                </span>
              </div>
              
              <div style="margin-top: 30px;">
                <h3 style="color: #1f2937; margin-bottom: 15px;">Service Details</h3>
                <div class="detail-row">
                  <span class="detail-label">Device:</span>
                  <span>${payment.workOrder.device?.brand || ""} ${
      payment.workOrder.device?.model || ""
    }</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Device Type:</span>
                  <span>${payment.workOrder.device?.deviceType || "N/A"}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Issue:</span>
                  <span>${payment.workOrder.issueDescription}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Work Order Status:</span>
                  <span>${payment.workOrder.status}</span>
                </div>
              </div>
              
              <div class="total">
                Total: ${formatCurrency(
                  parseFloat(payment.amount.toString()),
                  payment.currency
                )}
              </div>
            </div>
            
            <p style="margin-top: 20px;">
              If you have any questions about this invoice, please don't hesitate to contact us.
            </p>
          </div>
          
          <div class="footer">
            <p><strong>Servixing</strong></p>
            <p>Professional Device Repair Services</p>
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </body>
      </html>
    `;

    // Send email
    const { data, error } = await resend.emails.send({
      from: "Servixing <noreply@servixing.com>",
      to: [session.user.email],
      subject: `Invoice #${payment.id.slice(-8).toUpperCase()} - Servixing`,
      html: emailHtml,
    });

    if (error) {
      console.error("Resend email error:", error);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    // Log notification
    await prisma.notificationLog.create({
      data: {
        userId: session.user.id,
        type: "email",
        subject: `Invoice #${payment.id.slice(-8).toUpperCase()}`,
        content: `Invoice emailed to ${session.user.email}`,
        status: "sent",
        sentAt: new Date(),
      },
    });

    return NextResponse.json({ message: "Invoice emailed successfully", data });
  } catch (error) {
    console.error("Email invoice error:", error);
    return NextResponse.json(
      { error: "Failed to email invoice" },
      { status: 500 }
    );
  }
}
