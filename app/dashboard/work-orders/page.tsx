"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  FileText,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Clock,
  Wrench,
  Package,
  XCircle,
} from "lucide-react";

interface WorkOrder {
  id: string;
  deviceId: string;
  device: { brand: string; model: string; serialNumber?: string };
  status: string;
  issueDescription: string;
  estimatedCost?: number;
  finalCost?: number;
  paymentStatus: string;
  dropoffType: string;
  createdAt: string;
}

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "CREATED", label: "Created" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "IN_REPAIR", label: "In Repair" },
  { value: "AWAITING_PARTS", label: "Awaiting Parts" },
  { value: "READY_FOR_PICKUP", label: "Ready for Pickup" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: "", label: "All Payments" },
  { value: "PENDING", label: "Pending" },
  { value: "PAID", label: "Paid" },
  { value: "FAILED", label: "Failed" },
  { value: "REFUNDED", label: "Refunded" },
];

export default function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchWorkOrders();
  }, [statusFilter, paymentFilter, currentPage]);

  const fetchWorkOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
      });

      if (statusFilter) params.append("status", statusFilter);
      if (paymentFilter) params.append("paymentStatus", paymentFilter);

      const response = await fetch(`/api/work-orders?${params}`);
      if (response.ok) {
        const result = await response.json();
        setWorkOrders(result.data || []);
        setTotalPages(result.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching work orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "CREATED":
        return <Clock className="h-4 w-4" />;
      case "ACCEPTED":
        return <CheckCircle className="h-4 w-4" />;
      case "IN_REPAIR":
        return <Wrench className="h-4 w-4" />;
      case "AWAITING_PARTS":
        return <Package className="h-4 w-4" />;
      case "READY_FOR_PICKUP":
        return <AlertCircle className="h-4 w-4" />;
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4" />;
      case "CANCELLED":
        return <XCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CREATED":
        return "bg-gray-100 text-gray-800 border-gray-300";
      case "ACCEPTED":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "IN_REPAIR":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "AWAITING_PARTS":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "READY_FOR_PICKUP":
        return "bg-green-100 text-green-800 border-green-300";
      case "COMPLETED":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "text-green-600";
      case "FAILED":
        return "text-red-600";
      case "PENDING":
        return "text-yellow-600";
      case "REFUNDED":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Client-side search filter
  const filteredWorkOrders = workOrders.filter((order) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      order.device.brand.toLowerCase().includes(searchLower) ||
      order.device.model.toLowerCase().includes(searchLower) ||
      order.issueDescription.toLowerCase().includes(searchLower) ||
      order.id.toLowerCase().includes(searchLower)
    );
  });

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Work Orders</h1>
            <p className="text-gray-600 mt-1">
              Track your device repair requests
            </p>
          </div>
          <Link href="/dashboard/work-orders/create">
            <Button className="bg-orange-600 hover:bg-orange-700 gap-2">
              <Plus className="h-4 w-4" />
              Create Work Order
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by device, issue, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Payment Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
            >
              {PAYMENT_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Active Filters */}
          {(searchTerm || statusFilter || paymentFilter) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                  Search: {searchTerm}
                </span>
              )}
              {statusFilter && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Status: {formatStatus(statusFilter)}
                </span>
              )}
              {paymentFilter && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  Payment: {formatStatus(paymentFilter)}
                </span>
              )}
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("");
                  setPaymentFilter("");
                  setCurrentPage(1);
                }}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Clear all
              </button>
            </div>
          )}
        </Card>

        {/* Work Orders List */}
        {loading ? (
          <div className="text-center text-gray-600 py-12">
            Loading work orders...
          </div>
        ) : filteredWorkOrders.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">
              {workOrders.length === 0
                ? "No work orders yet"
                : "No matching work orders"}
            </h3>
            <p className="text-gray-600 mb-6">
              {workOrders.length === 0
                ? "Create your first work order to request a device repair"
                : "Try adjusting your filters or search term"}
            </p>
            {workOrders.length === 0 && (
              <Link href="/dashboard/work-orders/create">
                <Button className="bg-orange-600 hover:bg-orange-700">
                  Create Your First Work Order
                </Button>
              </Link>
            )}
          </Card>
        ) : (
          <>
            <div className="grid gap-4">
              {filteredWorkOrders.map((order) => (
                <Card
                  key={order.id}
                  className="p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {order.device.brand} {order.device.model}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            Order ID: {order.id.slice(0, 8)}...
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {getStatusIcon(order.status)}
                            {formatStatus(order.status)}
                          </span>
                        </div>
                      </div>

                      {/* Issue Description */}
                      <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                        {order.issueDescription}
                      </p>

                      {/* Details Row */}
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <span className="text-gray-600">Payment:</span>
                          <span
                            className={`font-semibold ${getPaymentStatusColor(
                              order.paymentStatus
                            )}`}
                          >
                            {formatStatus(order.paymentStatus)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-gray-600">Service:</span>
                          <span className="font-medium">
                            {order.dropoffType === "DROPOFF"
                              ? "Drop-off"
                              : "Dispatch"}
                          </span>
                        </div>

                        {order.estimatedCost && (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-600">Est. Cost:</span>
                            <span className="font-medium">
                              ₦{order.estimatedCost.toLocaleString()}
                            </span>
                          </div>
                        )}

                        {order.finalCost && (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-600">Final:</span>
                            <span className="font-semibold text-orange-600">
                              ₦{order.finalCost.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Date */}
                      <p className="text-xs text-gray-500 mt-3">
                        Created:{" "}
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center">
                      <Link href={`/dashboard/work-orders/${order.id}`}>
                        <Button variant="outline" className="w-full sm:w-auto">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
