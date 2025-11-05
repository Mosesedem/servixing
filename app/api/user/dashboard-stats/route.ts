import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { WorkOrderStatus, PaymentStatus } from "@prisma/client";

// GET /api/user/dashboard-stats - Get dashboard statistics for the user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch all work orders for the user
    const workOrders = await prisma.workOrder.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      include: {
        payments: true,
        device: {
          select: {
            brand: true,
            model: true,
            deviceType: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate statistics
    const totalOrders = workOrders.length;
    const activeRepairs = workOrders.filter(
      (wo) =>
        wo.status === WorkOrderStatus.ACCEPTED ||
        wo.status === WorkOrderStatus.IN_REPAIR ||
        wo.status === WorkOrderStatus.AWAITING_PARTS
    ).length;

    const completedRepairs = workOrders.filter(
      (wo) => wo.status === WorkOrderStatus.COMPLETED
    ).length;

    const readyForPickup = workOrders.filter(
      (wo) => wo.status === WorkOrderStatus.READY_FOR_PICKUP
    ).length;

    const pendingPayments = workOrders.filter(
      (wo) => wo.paymentStatus === PaymentStatus.PENDING
    ).length;

    // Calculate total spent (from completed and paid work orders)
    const totalSpent = workOrders
      .filter(
        (wo) => wo.paymentStatus === PaymentStatus.PAID && wo.finalCost !== null
      )
      .reduce((sum, wo) => sum + Number(wo.finalCost || 0), 0);

    // Calculate pending amount (from pending payments)
    const pendingAmount = workOrders
      .filter((wo) => wo.paymentStatus === PaymentStatus.PENDING)
      .reduce((sum, wo) => sum + Number(wo.totalAmount || 0), 0);

    // Status breakdown
    const statusBreakdown = {
      created: workOrders.filter((wo) => wo.status === WorkOrderStatus.CREATED)
        .length,
      accepted: workOrders.filter(
        (wo) => wo.status === WorkOrderStatus.ACCEPTED
      ).length,
      inRepair: workOrders.filter(
        (wo) => wo.status === WorkOrderStatus.IN_REPAIR
      ).length,
      awaitingParts: workOrders.filter(
        (wo) => wo.status === WorkOrderStatus.AWAITING_PARTS
      ).length,
      readyForPickup: workOrders.filter(
        (wo) => wo.status === WorkOrderStatus.READY_FOR_PICKUP
      ).length,
      completed: workOrders.filter(
        (wo) => wo.status === WorkOrderStatus.COMPLETED
      ).length,
      cancelled: workOrders.filter(
        (wo) => wo.status === WorkOrderStatus.CANCELLED
      ).length,
    };

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentOrders = workOrders.filter(
      (wo) => new Date(wo.createdAt) >= thirtyDaysAgo
    );

    // Monthly spending trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlySpending = workOrders
      .filter(
        (wo) =>
          wo.paymentStatus === PaymentStatus.PAID &&
          new Date(wo.createdAt) >= sixMonthsAgo
      )
      .reduce((acc, wo) => {
        const month = new Date(wo.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
        });
        if (!acc[month]) {
          acc[month] = 0;
        }
        acc[month] += Number(wo.finalCost || 0);
        return acc;
      }, {} as Record<string, number>);

    // Convert to array for charts
    const spendingTrend = Object.entries(monthlySpending).map(
      ([month, amount]) => ({
        month,
        amount,
      })
    );

    // Device type breakdown
    const deviceBreakdown = workOrders.reduce((acc, wo) => {
      const deviceType = wo.device.deviceType || "Unknown";
      if (!acc[deviceType]) {
        acc[deviceType] = 0;
      }
      acc[deviceType]++;
      return acc;
    }, {} as Record<string, number>);

    const deviceStats = Object.entries(deviceBreakdown).map(
      ([type, count]) => ({
        type,
        count,
      })
    );

    // Recent work orders (last 5)
    const recentWorkOrders = workOrders.slice(0, 5).map((wo) => ({
      id: wo.id,
      status: wo.status,
      deviceBrand: wo.device.brand,
      deviceModel: wo.device.model,
      createdAt: wo.createdAt,
      finalCost: wo.finalCost ? Number(wo.finalCost) : null,
      paymentStatus: wo.paymentStatus,
    }));

    // Get total devices
    const totalDevices = await prisma.device.count({
      where: {
        userId,
        deletedAt: null,
      },
    });

    // Get support tickets count
    const supportTickets = await prisma.supportTicket.groupBy({
      by: ["status"],
      where: {
        userId,
        deletedAt: null,
      },
      _count: true,
    });

    const ticketStats = {
      open: supportTickets.find((t) => t.status === "OPEN")?._count || 0,
      inProgress:
        supportTickets.find((t) => t.status === "IN_PROGRESS")?._count || 0,
      closed: supportTickets.find((t) => t.status === "CLOSED")?._count || 0,
      total: supportTickets.reduce((sum, t) => sum + t._count, 0),
    };

    return NextResponse.json({
      summary: {
        totalOrders,
        activeRepairs,
        completedRepairs,
        readyForPickup,
        pendingPayments,
        totalSpent,
        pendingAmount,
        totalDevices,
      },
      statusBreakdown,
      spendingTrend,
      deviceStats,
      recentWorkOrders,
      recentActivity: {
        ordersLast30Days: recentOrders.length,
        completedLast30Days: recentOrders.filter(
          (wo) => wo.status === WorkOrderStatus.COMPLETED
        ).length,
      },
      ticketStats,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}
