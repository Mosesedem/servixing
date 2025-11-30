import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const workOrderId = id;

    const workOrder = await prisma.workOrder.findUnique({
      where: { id: workOrderId },
      select: {
        id: true,
        contactName: true,
        contactEmail: true,
        contactPhone: true,
        status: true,
        issueDescription: true,
        problemType: true,
        dropoffType: true,
        dispatchAddress: true,
        dispatchFee: true,
        estimatedCost: true,
        finalCost: true,
        totalAmount: true,
        costBreakdown: true,
        warrantyChecked: true,
        warrantyStatus: true,
        warrantyProvider: true,
        warrantyExpiryDate: true,
        warrantyDecision: true,
        paymentStatus: true,
        paymentMethod: true,
        paymentReference: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            address: true,
          },
        },
        device: {
          select: {
            id: true,
            brand: true,
            model: true,
            serialNumber: true,
            imei: true,
            color: true,
            deviceType: true,
            description: true,
            images: true,
          },
        },
        payments: {
          include: {
            refunds: true,
          },
        },
        parts: true,
        warrantyChecks: true,
        supportTickets: {
          include: {
            messages: {
              include: {
                user: { select: { name: true } },
              },
              orderBy: { createdAt: "asc" },
            },
          },
        },
      },
    });

    if (!workOrder) {
      return NextResponse.json(
        { error: "Work order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(workOrder);
  } catch (error) {
    console.error("Error fetching work order:", error);
    return NextResponse.json(
      { error: "Failed to fetch work order" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const workOrderId = id;

    const body = await req.json();
    const {
      status,
      notes,
      estimatedCost,
      finalCost,
      totalAmount,
      costBreakdown,
      paymentStatus,
      paymentMethod,
      paymentReference,
      dispatchFee,
      warrantyDecision,
    } = body;

    const updateData: any = {};

    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (estimatedCost !== undefined) updateData.estimatedCost = estimatedCost;
    if (finalCost !== undefined) updateData.finalCost = finalCost;
    if (totalAmount !== undefined) updateData.totalAmount = totalAmount;
    if (costBreakdown !== undefined) updateData.costBreakdown = costBreakdown;
    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
    if (paymentReference !== undefined)
      updateData.paymentReference = paymentReference;
    if (dispatchFee !== undefined) updateData.dispatchFee = dispatchFee;
    if (warrantyDecision !== undefined)
      updateData.warrantyDecision = warrantyDecision;

    const updatedWorkOrder = await prisma.workOrder.update({
      where: { id: workOrderId },
      data: updateData,
      select: {
        id: true,
        contactName: true,
        contactEmail: true,
        contactPhone: true,
        status: true,
        issueDescription: true,
        problemType: true,
        dropoffType: true,
        dispatchAddress: true,
        dispatchFee: true,
        estimatedCost: true,
        finalCost: true,
        totalAmount: true,
        costBreakdown: true,
        warrantyChecked: true,
        warrantyStatus: true,
        warrantyProvider: true,
        warrantyExpiryDate: true,
        warrantyDecision: true,
        paymentStatus: true,
        paymentMethod: true,
        paymentReference: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            address: true,
          },
        },
        device: {
          select: {
            id: true,
            brand: true,
            model: true,
            serialNumber: true,
            imei: true,
            color: true,
            deviceType: true,
            description: true,
            images: true,
          },
        },
        payments: {
          include: {
            refunds: true,
          },
        },
        parts: true,
        warrantyChecks: true,
        supportTickets: {
          include: {
            messages: {
              include: {
                user: { select: { name: true } },
              },
              orderBy: { createdAt: "asc" },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedWorkOrder);
  } catch (error) {
    console.error("Error updating work order:", error);
    return NextResponse.json(
      { error: "Failed to update work order" },
      { status: 500 }
    );
  }
}
