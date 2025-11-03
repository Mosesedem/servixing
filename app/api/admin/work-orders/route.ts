import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
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

    if (!session?.user?.id || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { workOrderId, status, notes, finalCost } = await req.json();

    if (!workOrderId) {
      return NextResponse.json(
        { error: "Work order ID required" },
        { status: 400 }
      );
    }

    const updated = await prisma.workOrder.update({
      where: { id: workOrderId },
      data: {
        ...(status && { status }),
        ...(notes && { notes }),
        ...(finalCost && { finalCost }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(" Error updating work order:", error);
    return NextResponse.json(
      { error: "Failed to update work order" },
      { status: 500 }
    );
  }
}
