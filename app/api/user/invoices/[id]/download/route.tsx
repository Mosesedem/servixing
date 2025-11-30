import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { renderToBuffer } from "@react-pdf/renderer";
import InvoiceGenerator from "@/components/invoice-generator";

// GET /api/user/invoices/[id]/download - Download invoice as PDF
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
            device: {
              select: {
                brand: true,
                model: true,
              },
            },
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!payment || !payment.workOrder) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Prepare invoice data for PDF
    const workOrder = payment.workOrder!;
    const invoiceData = {
      id: payment.id,
      workOrderId: payment.workOrderId!,
      workOrder: {
        id: workOrder.id,
        deviceType: (workOrder as any).deviceType,
        issueDescription: workOrder.issueDescription,
        status: workOrder.status,
        createdAt: workOrder.createdAt.toISOString(),
        device: workOrder.device
          ? {
              manufacturer: workOrder.device.brand,
              model: workOrder.device.model,
            }
          : undefined,
      },
      amount: parseFloat(payment.amount.toString()),
      currency: payment.currency,
      status: payment.status,
      paidAt: payment.webhookVerifiedAt?.toISOString() || null,
      createdAt: payment.createdAt.toISOString(),
      user: {
        name: workOrder.user.name || workOrder.user.email,
        email: workOrder.user.email,
        phone: workOrder.user.phone || undefined,
      },
    };

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      <InvoiceGenerator invoice={invoiceData} />
    );

    return new Response(pdfBuffer as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${payment.id.slice(
          -8
        )}.pdf"`,
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
