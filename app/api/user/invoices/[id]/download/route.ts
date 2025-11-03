import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/user/invoices/[id]/download - Download invoice as HTML (for now)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
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

    // Generate HTML invoice
    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Invoice #${payment.id.slice(-8).toUpperCase()}</title>
          <style>
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
              line-height: 1.6;
              color: #1f2937;
              max-width: 800px;
              margin: 0 auto;
              padding: 40px 20px;
            }
            .invoice-header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 40px;
              padding-bottom: 20px;
              border-bottom: 3px solid #2563eb;
            }
            .company-info h1 {
              color: #2563eb;
              margin: 0 0 10px 0;
              font-size: 32px;
            }
            .company-info p {
              margin: 0;
              color: #6b7280;
            }
            .invoice-number {
              text-align: right;
            }
            .invoice-number h2 {
              margin: 0 0 10px 0;
              color: #374151;
              font-size: 24px;
            }
            .invoice-number p {
              margin: 0;
              color: #6b7280;
            }
            .status-badge {
              display: inline-block;
              padding: 6px 16px;
              border-radius: 16px;
              font-size: 14px;
              font-weight: 600;
              margin-top: 10px;
            }
            .status-paid {
              background-color: #d1fae5;
              color: #065f46;
            }
            .status-pending {
              background-color: #fef3c7;
              color: #92400e;
            }
            .invoice-details {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 40px;
              margin-bottom: 40px;
            }
            .detail-section h3 {
              color: #374151;
              font-size: 14px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              margin: 0 0 15px 0;
            }
            .detail-section p {
              margin: 0 0 8px 0;
              color: #6b7280;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            .items-table thead {
              background-color: #f9fafb;
            }
            .items-table th {
              text-align: left;
              padding: 12px;
              font-weight: 600;
              color: #374151;
              border-bottom: 2px solid #e5e7eb;
            }
            .items-table td {
              padding: 12px;
              border-bottom: 1px solid #e5e7eb;
            }
            .total-section {
              display: flex;
              justify-content: flex-end;
              margin-top: 30px;
            }
            .total-box {
              width: 300px;
              background-color: #f9fafb;
              padding: 20px;
              border-radius: 8px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
              color: #6b7280;
            }
            .total-row.grand-total {
              margin-top: 15px;
              padding-top: 15px;
              border-top: 2px solid #2563eb;
              font-size: 20px;
              font-weight: 700;
              color: #1f2937;
            }
            .footer {
              margin-top: 60px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              color: #6b7280;
              font-size: 14px;
            }
            .no-print {
              margin-bottom: 20px;
              text-align: center;
            }
            .print-button {
              background-color: #2563eb;
              color: white;
              padding: 12px 24px;
              border: none;
              border-radius: 8px;
              font-size: 16px;
              cursor: pointer;
              font-weight: 600;
            }
            .print-button:hover {
              background-color: #1d4ed8;
            }
          </style>
        </head>
        <body>
          <div class="no-print">
            <button class="print-button" onclick="window.print()">Print / Save as PDF</button>
          </div>
          
          <div class="invoice-header">
            <div class="company-info">
              <h1>Servixing</h1>
              <p>Professional Device Repair Services</p>
              <p>Lagos, Nigeria</p>
            </div>
            <div class="invoice-number">
              <h2>INVOICE</h2>
              <p>#${payment.id.slice(-8).toUpperCase()}</p>
              <p>${formatDate(payment.createdAt)}</p>
              <span class="status-badge ${
                payment.status === "PAID" ? "status-paid" : "status-pending"
              }">
                ${payment.status}
              </span>
            </div>
          </div>
          
          <div class="invoice-details">
            <div class="detail-section">
              <h3>Bill To</h3>
              <p><strong>${
                payment.workOrder.user.name || "Customer"
              }</strong></p>
              <p>${payment.workOrder.user.email || ""}</p>
              <p>${payment.workOrder.user.phone || ""}</p>
            </div>
            <div class="detail-section">
              <h3>Service Details</h3>
              <p><strong>Work Order:</strong> #${
                payment.workOrderId?.slice(-8).toUpperCase() || "N/A"
              }</p>
              <p><strong>Device:</strong> ${
                payment.workOrder.device?.brand || ""
              } ${payment.workOrder.device?.model || ""}</p>
              <p><strong>Status:</strong> ${payment.workOrder.status}</p>
            </div>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Details</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Repair Service</strong></td>
                <td>${payment.workOrder.issueDescription}</td>
                <td style="text-align: right;">${formatCurrency(
                  parseFloat(payment.amount.toString()),
                  payment.currency
                )}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="total-section">
            <div class="total-box">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>${formatCurrency(
                  parseFloat(payment.amount.toString()),
                  payment.currency
                )}</span>
              </div>
              <div class="total-row grand-total">
                <span>Total:</span>
                <span>${formatCurrency(
                  parseFloat(payment.amount.toString()),
                  payment.currency
                )}</span>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>Thank you for choosing Servixing!</strong></p>
            <p>For any questions about this invoice, please contact us.</p>
            <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
              This is a computer-generated invoice and is valid without signature.
            </p>
          </div>
        </body>
      </html>
    `;

    return new NextResponse(invoiceHtml, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `inline; filename="invoice-${payment.id.slice(
          -8
        )}.html"`,
      },
    });
  } catch (error) {
    console.error("Download invoice error:", error);
    return NextResponse.json(
      { error: "Failed to generate invoice" },
      { status: 500 }
    );
  }
}
