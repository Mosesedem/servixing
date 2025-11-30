import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const [
      totalUsers,
      totalWorkOrders,
      completedOrders,
      totalRevenue,
      pendingPayments,
      workOrderStatuses,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.workOrder.count(),
      prisma.workOrder.count({ where: { status: "COMPLETED" } }),
      prisma.workOrder.aggregate({
        where: { status: "COMPLETED", paymentStatus: "PAID" },
        _sum: { finalCost: true },
      }),
      prisma.workOrder.count({ where: { paymentStatus: "PENDING" } }),
      prisma.workOrder.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
    ]);

    const stats = {
      totalUsers,
      totalWorkOrders,
      completedOrders,
      totalRevenue: Number(totalRevenue._sum.finalCost || 0),
      pendingPayments,
      workOrderStatuses: workOrderStatuses.map((item) => ({
        status: item.status,
        count: item._count.status,
      })),
    };

    // For regular admins, remove financial data
    if (userRole === "ADMIN") {
      const { totalRevenue, pendingPayments, ...adminStats } = stats;
      return NextResponse.json(adminStats);
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error(" Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
