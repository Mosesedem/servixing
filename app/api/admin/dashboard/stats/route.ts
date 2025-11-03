import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const [
      totalUsers,
      totalWorkOrders,
      completedOrders,
      totalRevenue,
      pendingPayments,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.workOrder.count(),
      prisma.workOrder.count({ where: { status: "COMPLETED" } }),
      prisma.workOrder.aggregate({
        where: { status: "COMPLETED", paymentStatus: "PAID" },
        _sum: { finalCost: true },
      }),
      prisma.workOrder.count({ where: { paymentStatus: "PENDING" } }),
    ]);

    return NextResponse.json({
      totalUsers,
      totalWorkOrders,
      completedOrders,
      totalRevenue: totalRevenue._sum.finalCost || 0,
      pendingPayments,
    });
  } catch (error) {
    console.error(" Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
