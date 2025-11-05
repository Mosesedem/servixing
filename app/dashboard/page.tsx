import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { SpendingChart } from "@/components/dashboard/spending-chart";
import { StatusChart } from "@/components/dashboard/status-chart";
import { RecentOrders } from "@/components/dashboard/recent-orders";
import { DeviceStats } from "@/components/dashboard/device-stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Package, Headphones } from "lucide-react";

// Revalidate every 5 minutes
export const revalidate = 300;

interface DashboardData {
  summary: {
    totalOrders: number;
    activeRepairs: number;
    completedRepairs: number;
    readyForPickup: number;
    pendingPayments: number;
    totalSpent: number;
    pendingAmount: number;
    totalDevices: number;
  };
  statusBreakdown: {
    created: number;
    accepted: number;
    inRepair: number;
    awaitingParts: number;
    readyForPickup: number;
    completed: number;
    cancelled: number;
  };
  spendingTrend: Array<{
    month: string;
    amount: number;
  }>;
  deviceStats: Array<{
    type: string;
    count: number;
  }>;
  recentWorkOrders: Array<{
    id: string;
    status: any;
    deviceBrand: string;
    deviceModel: string;
    createdAt: Date;
    finalCost: number | null;
    paymentStatus: any;
  }>;
  recentActivity: {
    ordersLast30Days: number;
    completedLast30Days: number;
  };
  ticketStats: {
    open: number;
    inProgress: number;
    closed: number;
    total: number;
  };
}

async function getDashboardData(userId: string): Promise<DashboardData | null> {
  try {
    const { prisma } = await import("@/lib/db");
    const { WorkOrderStatus, PaymentStatus } = await import("@prisma/client");

    // Time windows
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Aggregate metrics at the database level for correctness
    const [
      workOrderStatusGroup,
      pendingPaymentsCount,
      paidAgg,
      pendingAgg,
      recentWorkOrdersRaw,
      devicesGroup,
      supportTickets,
      ordersLast30Days,
      completedLast30Days,
      totalDevices,
    ] = await Promise.all([
      // Status breakdown
      prisma.workOrder.groupBy({
        by: ["status"],
        where: { userId, deletedAt: null },
        _count: { _all: true },
      }),
      // Pending payments count
      prisma.workOrder.count({
        where: {
          userId,
          deletedAt: null,
          paymentStatus: PaymentStatus.PENDING,
        },
      }),
      // Total spent (sum of finalCost for paid work orders)
      prisma.workOrder.aggregate({
        where: {
          userId,
          deletedAt: null,
          paymentStatus: PaymentStatus.PAID,
          finalCost: { not: null },
        },
        _sum: { finalCost: true },
      }),
      // Pending amount (sum of totalAmount for pending work orders)
      prisma.workOrder.aggregate({
        where: {
          userId,
          deletedAt: null,
          paymentStatus: PaymentStatus.PENDING,
          totalAmount: { not: null },
        },
        _sum: { totalAmount: true },
      }),
      // Recent work orders
      prisma.workOrder.findMany({
        where: { userId, deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          status: true,
          createdAt: true,
          finalCost: true,
          paymentStatus: true,
          device: { select: { brand: true, model: true } },
        },
      }),
      // Device stats by type
      prisma.device.groupBy({
        by: ["deviceType"],
        where: { userId, deletedAt: null },
        _count: { _all: true },
      }),
      // Support tickets group
      prisma.supportTicket.groupBy({
        by: ["status"],
        where: { userId, deletedAt: null },
        _count: true,
      }),
      // Recent activity counts
      prisma.workOrder.count({
        where: { userId, deletedAt: null, createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.workOrder.count({
        where: {
          userId,
          deletedAt: null,
          createdAt: { gte: thirtyDaysAgo },
          status: WorkOrderStatus.COMPLETED,
        },
      }),
      // Total devices
      prisma.device.count({ where: { userId, deletedAt: null } }),
    ]);

    console.log("--- DEBUGGING DASHBOARD DATA ---");
    console.log("User ID:", userId);
    console.log(
      "Work Order Status Group:",
      JSON.stringify(workOrderStatusGroup, null, 2)
    );
    console.log("Pending Payments Count:", pendingPaymentsCount);
    console.log("Paid Aggregation:", JSON.stringify(paidAgg, null, 2));
    console.log("Pending Aggregation:", JSON.stringify(pendingAgg, null, 2));
    console.log(
      "Recent Work Orders Raw:",
      JSON.stringify(recentWorkOrdersRaw, null, 2)
    );
    console.log("Devices Group:", JSON.stringify(devicesGroup, null, 2));
    console.log("Support Tickets:", JSON.stringify(supportTickets, null, 2));
    console.log("Orders Last 30 Days:", ordersLast30Days);
    console.log("Completed Last 30 Days:", completedLast30Days);
    console.log("Total Devices:", totalDevices);

    // Additional diagnostic queries
    const totalWorkOrdersAllStatuses = await prisma.workOrder.count({
      where: { userId },
    });
    const totalWorkOrdersIncludingDeleted = await prisma.workOrder.count({
      where: { userId, deletedAt: { not: null } },
    });
    const totalDevicesAllStatuses = await prisma.device.count({
      where: { userId },
    });

    console.log("\n--- DIAGNOSTIC INFO ---");
    console.log(
      "Total Work Orders (including deleted):",
      totalWorkOrdersAllStatuses
    );
    console.log("Soft-deleted Work Orders:", totalWorkOrdersIncludingDeleted);
    console.log("Total Devices (including deleted):", totalDevicesAllStatuses);
    console.log(
      "Non-deleted Work Orders:",
      totalWorkOrdersAllStatuses - totalWorkOrdersIncludingDeleted
    );

    if (totalWorkOrdersAllStatuses === 0 && totalDevicesAllStatuses === 0) {
      console.log(
        "\n⚠️  WARNING: This user has NO work orders or devices in the database."
      );
      console.log(
        "   This is expected for a new user. Create devices and work orders to see data."
      );
    } else if (totalWorkOrdersIncludingDeleted > 0) {
      console.log(
        "\n⚠️  WARNING: All work orders for this user are soft-deleted (deletedAt IS NOT NULL)."
      );
    }
    console.log("---------------------------------\n");

    // Build status breakdown from groupBy
    const statusBreakdown = {
      created:
        workOrderStatusGroup.find((s) => s.status === WorkOrderStatus.CREATED)
          ?._count._all || 0,
      accepted:
        workOrderStatusGroup.find((s) => s.status === WorkOrderStatus.ACCEPTED)
          ?._count._all || 0,
      inRepair:
        workOrderStatusGroup.find((s) => s.status === WorkOrderStatus.IN_REPAIR)
          ?._count._all || 0,
      awaitingParts:
        workOrderStatusGroup.find(
          (s) => s.status === WorkOrderStatus.AWAITING_PARTS
        )?._count._all || 0,
      readyForPickup:
        workOrderStatusGroup.find(
          (s) => s.status === WorkOrderStatus.READY_FOR_PICKUP
        )?._count._all || 0,
      completed:
        workOrderStatusGroup.find((s) => s.status === WorkOrderStatus.COMPLETED)
          ?._count._all || 0,
      cancelled:
        workOrderStatusGroup.find((s) => s.status === WorkOrderStatus.CANCELLED)
          ?._count._all || 0,
    };

    const totalOrders = Object.values(statusBreakdown).reduce(
      (sum, n) => sum + n,
      0
    );
    const activeRepairs =
      statusBreakdown.accepted +
      statusBreakdown.inRepair +
      statusBreakdown.awaitingParts;
    const completedRepairs = statusBreakdown.completed;
    const readyForPickup = statusBreakdown.readyForPickup;
    const pendingPayments = pendingPaymentsCount;

    const totalSpent = Number(paidAgg._sum.finalCost || 0);
    const pendingAmount = Number(pendingAgg._sum.totalAmount || 0);

    // Spending trend (last 6 months)
    const paidLastSix = await prisma.workOrder.findMany({
      where: {
        userId,
        deletedAt: null,
        paymentStatus: PaymentStatus.PAID,
        finalCost: { not: null },
        createdAt: { gte: sixMonthsAgo },
      },
      select: { createdAt: true, finalCost: true },
      orderBy: { createdAt: "asc" },
    });

    const monthlySpending = paidLastSix.reduce((acc, wo) => {
      const month = new Date(wo.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });
      if (!acc[month]) acc[month] = 0;
      acc[month] += Number(wo.finalCost || 0);
      return acc;
    }, {} as Record<string, number>);

    const spendingTrend = Object.entries(monthlySpending).map(
      ([month, amount]) => ({ month, amount })
    );

    // Device stats from groupBy
    const deviceStats = devicesGroup.map((d) => ({
      type: d.deviceType || "Unknown",
      count: d._count._all,
    }));

    // Recent work orders (last 5)
    const recentWorkOrders = recentWorkOrdersRaw.map((wo) => ({
      id: wo.id,
      status: wo.status,
      deviceBrand: wo.device?.brand || "",
      deviceModel: wo.device?.model || "",
      createdAt: wo.createdAt,
      finalCost: wo.finalCost ? Number(wo.finalCost) : null,
      paymentStatus: wo.paymentStatus,
    }));

    // Tickets
    const ticketStats = {
      open: supportTickets.find((t) => t.status === "OPEN")?._count || 0,
      inProgress:
        supportTickets.find((t) => t.status === "IN_PROGRESS")?._count || 0,
      closed: supportTickets.find((t) => t.status === "CLOSED")?._count || 0,
      total: supportTickets.reduce((sum, t) => sum + t._count, 0),
    };

    return {
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
        ordersLast30Days,
        completedLast30Days,
      },
      ticketStats,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return null;
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const data = await getDashboardData(session.user.id);

  // If data fetch fails, show a fallback with empty state
  if (!data) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome, {session?.user?.name}!
          </h1>
          <p className="text-muted-foreground">
            Manage your devices and repair orders
          </p>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Unable to load dashboard data. Please refresh the page.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {session?.user?.name}!
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your repairs today
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards summary={data.summary} />

      {/* Activity Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Orders (Last 30 Days)
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.recentActivity.ordersLast30Days}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.recentActivity.completedLast30Days} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Registered Devices
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.summary.totalDevices}
            </div>
            <p className="text-xs text-muted-foreground">
              Manage in device settings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Support Tickets
            </CardTitle>
            <Headphones className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.ticketStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {data.ticketStats.open} open tickets
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <StatusChart data={data.statusBreakdown} />
        <DeviceStats data={data.deviceStats} />
      </div>

      {/* Spending Trend */}
      <SpendingChart data={data.spendingTrend} />

      {/* Recent Orders */}
      <RecentOrders orders={data.recentWorkOrders} />
    </main>
  );
}
