"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight } from "lucide-react";
import { WorkOrderStatus, PaymentStatus } from "@prisma/client";

interface RecentOrdersProps {
  orders: Array<{
    id: string;
    status: WorkOrderStatus;
    deviceBrand: string;
    deviceModel: string;
    createdAt: Date;
    finalCost: number | null;
    paymentStatus: PaymentStatus;
  }>;
}

const STATUS_VARIANTS: Record<
  WorkOrderStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  CREATED: "outline",
  ACCEPTED: "default",
  IN_REPAIR: "secondary",
  AWAITING_PARTS: "destructive",
  READY_FOR_PICKUP: "default",
  COMPLETED: "default",
  CANCELLED: "destructive",
};

const STATUS_LABELS: Record<WorkOrderStatus, string> = {
  CREATED: "Created",
  ACCEPTED: "Accepted",
  IN_REPAIR: "In Repair",
  AWAITING_PARTS: "Awaiting Parts",
  READY_FOR_PICKUP: "Ready",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export function RecentOrders({ orders }: RecentOrdersProps) {
  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground mb-4">No orders yet</p>
            <Link
              href="/services"
              className="text-sm text-primary hover:underline"
            >
              Book a repair service
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Orders</CardTitle>
        <Link
          href="/dashboard/work-orders"
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          View all
          <ArrowRight className="h-4 w-4" />
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/dashboard/work-orders/${order.id}`}
              className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium">
                    {order.deviceBrand} {order.deviceModel}
                  </p>
                  <Badge variant={STATUS_VARIANTS[order.status]}>
                    {STATUS_LABELS[order.status]}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(order.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
              {order.finalCost && (
                <div className="text-right">
                  <p className="font-semibold">
                    {formatCurrency(order.finalCost)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {order.paymentStatus === PaymentStatus.PAID
                      ? "Paid"
                      : "Pending"}
                  </p>
                </div>
              )}
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
