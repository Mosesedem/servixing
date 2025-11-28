"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Users, FileText, DollarSign, Clock } from "lucide-react";
import { useSession } from "next-auth/react";

interface Stats {
  totalUsers: number;
  totalWorkOrders: number;
  completedOrders: number;
  totalRevenue: number;
  pendingPayments: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";

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

    fetchStats();
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
    <div>
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
          icon={FileText}
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
