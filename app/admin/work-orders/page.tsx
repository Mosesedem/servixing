"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";

interface WorkOrder {
  id: string;
  user: { id: string; email: string; name: string; phone: string };
  device: { brand: string; model: string };
  status: string;
  issueDescription: string;
  estimatedCost?: number;
  finalCost?: number;
  paymentStatus: string;
  createdAt: string;
}

export default function AdminWorkOrders() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");

  useEffect(() => {
    const fetchWorkOrders = async () => {
      try {
        let url = "/api/admin/work-orders";
        const params = new URLSearchParams();
        if (statusFilter) params.append("status", statusFilter);
        if (paymentFilter) params.append("paymentStatus", paymentFilter);
        if (params.toString()) url += "?" + params.toString();

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setWorkOrders(data);
        }
      } catch (error) {
        console.error(" Error fetching work orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkOrders();
  }, [statusFilter, paymentFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "created":
        return "bg-gray-100 text-gray-800";
      case "dropped_off":
        return "bg-blue-100 text-blue-800";
      case "diagnosed":
        return "bg-purple-100 text-purple-800";
      case "in_progress":
        return "bg-orange-100 text-orange-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "ready_for_pickup":
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "failed":
        return "text-red-600";
      case "initiated":
        return "text-blue-600";
      default:
        return "text-yellow-600";
    }
  };

  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Work Orders Management</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <option value="">All Statuses</option>
          <option value="created">Created</option>
          <option value="dropped_off">Dropped Off</option>
          <option value="diagnosed">Diagnosed</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="ready_for_pickup">Ready for Pickup</option>
        </Select>

        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
          <option value="">All Payments</option>
          <option value="pending">Pending</option>
          <option value="initiated">Initiated</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </Select>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground">
          Loading work orders...
        </div>
      ) : workOrders.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No work orders found</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {workOrders.map((order) => (
            <Card key={order.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {order.device.brand} {order.device.model}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {order.user.name} ({order.user.email})
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">
                    {order.issueDescription}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {formatStatus(order.status)}
                    </span>
                    <span
                      className={`text-xs font-medium ${getPaymentColor(
                        order.paymentStatus
                      )}`}
                    >
                      Payment: {formatStatus(order.paymentStatus)}
                    </span>
                    {order.finalCost && (
                      <span className="font-semibold">
                        Final: ${order.finalCost.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
                <Link href={`/admin/work-orders/${order.id}`}>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
