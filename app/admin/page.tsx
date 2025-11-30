"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Users,
  FileText,
  DollarSign,
  Clock,
  TrendingUp,
  Activity,
} from "lucide-react";
import { useSession } from "next-auth/react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface Stats {
  totalUsers: number;
  totalWorkOrders: number;
  completedOrders: number;
  totalRevenue: number;
  pendingPayments: number;
  workOrderStatuses: { status: string; count: number }[];
}

interface WorkOrder {
  id: string;
  status: string;
  createdAt: string;
  user: { name: string; email: string };
  device: { brand: string; model: string };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentWorkOrders, setRecentWorkOrders] = useState<WorkOrder[]>([]);
  const { data: session } = useSession();

  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";

  const statusColors = {
    PENDING: "#fbbf24",
    ACCEPTED: "#3b82f6",
    IN_REPAIR: "#8b5cf6",
    AWAITING_PARTS: "#f59e0b",
    READY_FOR_PICKUP: "#10b981",
    COMPLETED: "#059669",
    CANCELLED: "#ef4444",
  };

  const chartData =
    stats?.workOrderStatuses.map((item) => ({
      name: item.status.replace("_", " "),
      value: item.count,
      color:
        statusColors[item.status as keyof typeof statusColors] || "#6b7280",
    })) || [];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/dashboard/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error(" Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchRecentWorkOrders = async () => {
      try {
        const response = await fetch("/api/admin/work-orders?limit=5");
        if (response.ok) {
          const data = await response.json();
          setRecentWorkOrders(data.slice(0, 5));
        }
      } catch (error) {
        console.error("Error fetching recent work orders:", error);
      }
    };

    fetchStats();
    fetchRecentWorkOrders();
  }, []);

  if (loading) {
    return (
      <div className="text-center text-muted-foreground">Loading stats...</div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center text-muted-foreground">
        Failed to load statistics
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your system.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={Users}
          title="Total Users"
          value={stats.totalUsers}
          color="bg-blue-50"
        />
        <StatCard
          icon={FileText}
          title="Work Orders"
          value={stats.totalWorkOrders}
          color="bg-purple-50"
        />
        <StatCard
          icon={TrendingUp}
          title="Completed"
          value={stats.completedOrders}
          color="bg-green-50"
        />
        {isSuperAdmin && (
          <>
            <StatCard
              icon={DollarSign}
              title="Total Revenue"
              value={`$${stats.totalRevenue?.toFixed(2)}`}
              color="bg-emerald-50"
            />
            <StatCard
              icon={Clock}
              title="Pending Payments"
              value={stats.pendingPayments}
              color="bg-orange-50"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            Work Order Status Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Work Orders</h2>
          <div className="space-y-4">
            {recentWorkOrders.length > 0 ? (
              recentWorkOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {order.device.brand} {order.device.model}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.user.name} - {order.user.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium capitalize">
                      {order.status.replace("_", " ")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No recent work orders</p>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">System Overview</h2>
        <div className="space-y-4 text-sm">
          <p className="text-muted-foreground">
            You have <strong>{stats.totalUsers}</strong> registered users with{" "}
            <strong>{stats.totalWorkOrders}</strong> total work orders.
          </p>
          <p className="text-muted-foreground">
            <strong>{stats.completedOrders}</strong> orders have been completed
            {isSuperAdmin ? (
              <>
                , generating <strong>${stats.totalRevenue.toFixed(2)}</strong>{" "}
                in revenue.
              </>
            ) : (
              "."
            )}
          </p>
          {isSuperAdmin && (
            <p className="text-muted-foreground">
              <strong>{stats.pendingPayments}</strong> work orders are awaiting
              payment.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon,
  title,
  value,
  color,
}: {
  icon: React.ComponentType<any>;
  title: string;
  value: string | number;
  color: string;
}) {
  return (
    <Card className={`${color} p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <Icon className="h-8 w-8 text-orange-600 opacity-50" />
      </div>
    </Card>
  );
}
