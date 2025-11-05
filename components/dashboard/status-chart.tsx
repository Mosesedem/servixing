"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface StatusChartProps {
  data: {
    created: number;
    accepted: number;
    inRepair: number;
    awaitingParts: number;
    readyForPickup: number;
    completed: number;
    cancelled: number;
  };
}

const STATUS_COLORS: Record<string, string> = {
  created: "#94a3b8",
  accepted: "#3b82f6",
  inRepair: "#f59e0b",
  awaitingParts: "#ef4444",
  readyForPickup: "#8b5cf6",
  completed: "#10b981",
  cancelled: "#6b7280",
};

const STATUS_LABELS: Record<string, string> = {
  created: "Created",
  accepted: "Accepted",
  inRepair: "In Repair",
  awaitingParts: "Awaiting Parts",
  readyForPickup: "Ready for Pickup",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function StatusChart({ data }: StatusChartProps) {
  const chartData = Object.entries(data)
    .filter(([_, value]) => value > 0)
    .map(([key, value]) => ({
      name: STATUS_LABELS[key] || key,
      value,
      color: STATUS_COLORS[key] || "#6b7280",
    }));

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No orders yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Status Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
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
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
