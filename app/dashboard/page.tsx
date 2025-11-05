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

    const totalSpent = workOrders
      .filter(
        (wo) => wo.paymentStatus === PaymentStatus.PAID && wo.finalCost !== null
      )
      .reduce((sum, wo) => sum + Number(wo.finalCost || 0), 0);

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
        ordersLast30Days: recentOrders.length,
        completedLast30Days: recentOrders.filter(
          (wo) => wo.status === WorkOrderStatus.COMPLETED
        ).length,
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
