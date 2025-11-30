"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface WorkOrder {
  id: string;
  user: { id: string; email: string; name: string; phone: string };
  device: { brand: string; model: string };
  status: string;
  issueDescription: string;
  estimatedCost?: string;
  finalCost?: string;
  paymentStatus: string;
  createdAt: string;
}

export default function AdminWorkOrders() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [editingOrder, setEditingOrder] = useState<WorkOrder | null>(null);
  const [sendEmail, setSendEmail] = useState(true);
  const [notes, setNotes] = useState("");
  const [finalCost, setFinalCost] = useState("");

  useEffect(() => {
    fetchWorkOrders();
  }, [statusFilter, paymentFilter, searchTerm, page]);

  const fetchWorkOrders = async () => {
    try {
      let url = "/api/admin/work-orders";
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (paymentFilter) params.append("paymentStatus", paymentFilter);
      if (searchTerm) params.append("search", searchTerm);
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (params.toString()) url += "?" + params.toString();

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setWorkOrders(data.workOrders);
        setTotal(data.total);
      }
    } catch (error) {
      console.error(" Error fetching work orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdating(true);
    try {
      const response = await fetch("/api/admin/work-orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workOrderId: orderId,
          status: newStatus,
          notes: notes || undefined,
          finalCost: finalCost ? parseFloat(finalCost) : undefined,
          sendEmail,
        }),
      });
      if (response.ok) {
        fetchWorkOrders();
        setEditingOrder(null);
        setNotes("");
        setFinalCost("");
      }
    } catch (error) {
      console.error("Error updating work order:", error);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CREATED":
        return "bg-gray-100 text-gray-800";
      case "ACCEPTED":
        return "bg-blue-100 text-blue-800";
      case "IN_REPAIR":
        return "bg-purple-100 text-purple-800";
      case "AWAITING_PARTS":
        return "bg-orange-100 text-orange-800";
      case "READY_FOR_PICKUP":
        return "bg-emerald-100 text-emerald-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "text-green-600";
      case "FAILED":
        return "text-red-600";
      case "PENDING":
        return "text-yellow-600";
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
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by user, device, or issue..."
          className="w-[300px]"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CREATED">Created</SelectItem>
            <SelectItem value="ACCEPTED">Accepted</SelectItem>
            <SelectItem value="IN_REPAIR">In Repair</SelectItem>
            <SelectItem value="AWAITING_PARTS">Awaiting Parts</SelectItem>
            <SelectItem value="READY_FOR_PICKUP">Ready for Pickup</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Payments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
            <SelectItem value="REFUNDED">Refunded</SelectItem>
          </SelectContent>
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
                        Final: ${Number(order.finalCost).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingOrder(order)}
                      >
                        Update Status
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Update Work Order Status</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            New Status
                          </label>
                          <Select
                            value={editingOrder?.status || ""}
                            onValueChange={(value) =>
                              setEditingOrder(
                                editingOrder
                                  ? { ...editingOrder, status: value }
                                  : null
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="CREATED">Created</SelectItem>
                              <SelectItem value="ACCEPTED">Accepted</SelectItem>
                              <SelectItem value="IN_REPAIR">
                                In Repair
                              </SelectItem>
                              <SelectItem value="AWAITING_PARTS">
                                Awaiting Parts
                              </SelectItem>
                              <SelectItem value="READY_FOR_PICKUP">
                                Ready for Pickup
                              </SelectItem>
                              <SelectItem value="COMPLETED">
                                Completed
                              </SelectItem>
                              <SelectItem value="CANCELLED">
                                Cancelled
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Final Cost (optional)
                          </label>
                          <Input
                            type="number"
                            step="0.01"
                            value={finalCost}
                            onChange={(e) => setFinalCost(e.target.value)}
                            placeholder="Enter final cost"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Notes (optional)
                          </label>
                          <Input
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add notes"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="sendEmail"
                            checked={sendEmail}
                            onCheckedChange={(checked) =>
                              setSendEmail(checked === true)
                            }
                          />
                          <label
                            htmlFor="sendEmail"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Send email notification to customer
                          </label>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() =>
                              editingOrder &&
                              handleStatusUpdate(
                                editingOrder.id,
                                editingOrder.status
                              )
                            }
                            disabled={updating}
                          >
                            {updating ? "Updating..." : "Update Status"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setEditingOrder(null);
                              setNotes("");
                              setFinalCost("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Link href={`/admin/work-orders/${order.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > limit && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {Math.ceil(total / limit)}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={page >= Math.ceil(total / limit)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
