"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Wrench,
  Package,
  AlertCircle,
  MapPin,
  Calendar,
  Edit,
  Save,
  X,
  Loader2,
  FileText,
} from "lucide-react";
import { loadScript } from "@/lib/paystack-loader";
import { WarrantySection } from "./warranty-section";
import { PartsSearch } from "./parts-search";

interface WorkOrder {
  id: string;
  userId: string;
  deviceId: string;
  status: string;
  issueDescription: string;
  dropoffType: string;
  dispatchAddress?: any;
  dispatchFee?: number;
  estimatedCost?: number;
  finalCost?: number;
  totalAmount?: number;
  warrantyChecked: boolean;
  warrantyStatus: string;
  warrantyProvider?: string;
  warrantyExpiryDate?: string;
  paymentStatus: string;
  paymentReference?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  device: {
    id: string;
    brand: string;
    model: string;
    deviceType: string;
    serialNumber?: string;
    images: string[];
  };
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

const STATUS_PROGRESSION = [
  { value: "CREATED", label: "Created", icon: Clock },
  { value: "ACCEPTED", label: "Accepted", icon: CheckCircle },
  { value: "IN_REPAIR", label: "In Repair", icon: Wrench },
  { value: "AWAITING_PARTS", label: "Awaiting Parts", icon: Package },
  { value: "READY_FOR_PICKUP", label: "Ready for Pickup", icon: AlertCircle },
  { value: "COMPLETED", label: "Completed", icon: CheckCircle },
];

export default function WorkOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workOrderId = params.id as string;

  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    status: "",
    estimatedCost: "",
    finalCost: "",
    notes: "",
  });

  useEffect(() => {
    fetchWorkOrder();
  }, [workOrderId]);

  const fetchWorkOrder = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/work-orders/${workOrderId}`);
      if (response.ok) {
        const result = await response.json();
        const data = result.data;
        setWorkOrder(data);
        setFormData({
          status: data.status,
          estimatedCost: data.estimatedCost?.toString() || "",
          finalCost: data.finalCost?.toString() || "",
          notes: data.notes || "",
        });
      } else {
        setError("Work order not found");
      }
    } catch (err) {
      setError("Failed to load work order");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    try {
      const updateData: any = {
        status: formData.status,
      };

      if (formData.estimatedCost) {
        updateData.estimatedCost = parseFloat(formData.estimatedCost);
      }
      if (formData.finalCost) {
        updateData.finalCost = parseFloat(formData.finalCost);
      }
      if (formData.notes) {
        updateData.notes = formData.notes;
      }

      const response = await fetch(`/api/work-orders/${workOrderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const result = await response.json();
        setWorkOrder(result.data);
        setEditMode(false);
        setError("");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update work order");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    if (
      !confirm(
        "Are you sure you want to cancel this work order? This action cannot be undone."
      )
    ) {
      return;
    }

    setCancelling(true);
    try {
      const response = await fetch(`/api/work-orders/${workOrderId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/dashboard/work-orders");
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to cancel work order");
      }
    } catch (err) {
      alert("An error occurred while cancelling the work order");
    } finally {
      setCancelling(false);
    }
  };

  const handlePayment = async () => {
    setPaymentLoading(true);
    setError("");

    try {
      if (!workOrder?.finalCost && !workOrder?.estimatedCost) {
        setError("No cost set for this work order");
        setPaymentLoading(false);
        return;
      }

      const amount = workOrder.finalCost || workOrder.estimatedCost || 0;

      await loadScript();

      const initResponse = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workOrderId,
          amount,
        }),
      });

      if (!initResponse.ok) {
        const data = await initResponse.json();
        setError(data.error || "Failed to initialize payment");
        setPaymentLoading(false);
        return;
      }

      const { authorizationUrl } = await initResponse.json();
      window.location.href = authorizationUrl;
    } catch (err) {
      setError("Payment initialization failed");
      console.error("Payment error:", err);
    } finally {
      setPaymentLoading(false);
    }
  };

  const getCurrentStatusIndex = () => {
    if (!workOrder) return -1;
    return STATUS_PROGRESSION.findIndex((s) => s.value === workOrder.status);
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
      default:
        return "text-gray-600";
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case "PAID":
        return <CheckCircle className="h-5 w-5" />;
      case "FAILED":
        return <XCircle className="h-5 w-5" />;
      case "PENDING":
        return <Clock className="h-5 w-5" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent mb-4"></div>
          <p className="text-gray-600">Loading work order...</p>
        </div>
      </div>
    );
  }

  if (error && !workOrder) {
    return (
      <div className="text-center py-12">
        <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
        <h2 className="text-2xl font-semibold mb-2">Work Order Not Found</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <Link href="/dashboard/work-orders">
          <Button>Back to Work Orders</Button>
        </Link>
      </div>
    );
  }

  if (!workOrder) return null;

  const currentStatusIndex = getCurrentStatusIndex();
  const canEdit =
    workOrder.status !== "COMPLETED" && workOrder.status !== "CANCELLED";

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/work-orders"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Work Orders
        </Link>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Work Order Details</h1>
            <p className="text-gray-600 mt-1">
              Order ID: {workOrder.id.slice(0, 12)}...
            </p>
          </div>

          {canEdit && !editMode ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditMode(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={cancelling}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4 mr-2" />
                {cancelling ? "Cancelling..." : "Cancel Order"}
              </Button>
            </div>
          ) : editMode ? (
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEditMode(false);
                  setError("");
                  fetchWorkOrder();
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Status Timeline */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-6">Status Timeline</h2>
        <div className="relative">
          {/* Progress Bar */}
          <div
            className="absolute top-5 left-0 right-0 h-1 bg-gray-200"
            style={{ zIndex: 0 }}
          >
            <div
              className="h-full bg-orange-600 transition-all duration-500"
              style={{
                width: `${
                  (currentStatusIndex / (STATUS_PROGRESSION.length - 1)) * 100
                }%`,
              }}
            />
          </div>

          {/* Status Steps */}
          <div className="relative flex justify-between" style={{ zIndex: 1 }}>
            {STATUS_PROGRESSION.map((status, index) => {
              const Icon = status.icon;
              const isCompleted = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;

              return (
                <div key={status.value} className="flex flex-col items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                      isCompleted
                        ? "bg-orange-600 border-orange-600 text-white"
                        : "bg-white border-gray-300 text-gray-400"
                    } ${isCurrent ? "ring-4 ring-orange-200" : ""}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <p
                    className={`text-xs mt-2 text-center ${
                      isCompleted
                        ? "font-semibold text-gray-900"
                        : "text-gray-500"
                    }`}
                  >
                    {status.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {workOrder.status === "CANCELLED" && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <XCircle className="h-5 w-5 text-red-600" />
            <div>
              <p className="font-semibold text-red-800">
                This work order has been cancelled
              </p>
              <p className="text-sm text-red-600">
                No further actions can be taken
              </p>
            </div>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Device Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Device Information</h2>
            <div className="flex gap-4">
              {workOrder.device.images &&
                workOrder.device.images.length > 0 && (
                  <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0">
                    <Image
                      src={workOrder.device.images[0]}
                      alt={workOrder.device.model}
                      width={96}
                      height={96}
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
              <div className="flex-1">
                <Link
                  href={`/dashboard/devices/${workOrder.device.id}`}
                  className="text-lg font-semibold hover:text-orange-600 transition-colors"
                >
                  {workOrder.device.brand} {workOrder.device.model}
                </Link>
                <p className="text-sm text-gray-600 mt-1">
                  {workOrder.device.deviceType}
                </p>
                {workOrder.device.serialNumber && (
                  <p className="text-xs text-gray-500 mt-2 font-mono">
                    S/N: {workOrder.device.serialNumber}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Issue Description */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Issue Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {workOrder.issueDescription}
            </p>
          </Card>

          {/* Service Details */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Service Details</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Delivery Method</p>
                  <p className="font-semibold">
                    {workOrder.dropoffType === "DROPOFF"
                      ? "Drop-off at Service Center"
                      : "Dispatch Service"}
                  </p>
                </div>
              </div>

              {workOrder.dropoffType === "DISPATCH" &&
                workOrder.dispatchAddress && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Pickup Address</p>
                      <p className="font-semibold">
                        {workOrder.dispatchAddress.street},{" "}
                        {workOrder.dispatchAddress.city},{" "}
                        {workOrder.dispatchAddress.state}{" "}
                        {workOrder.dispatchAddress.postalCode}
                      </p>
                    </div>
                  </div>
                )}

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Warranty Check</p>
                  <p className="font-semibold">
                    {workOrder.warrantyChecked ? "Requested" : "Not Requested"}
                  </p>
                  {workOrder.warrantyStatus !== "NONE" && (
                    <p className="text-sm text-gray-600 mt-1">
                      Status: {workOrder.warrantyStatus}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Payment Section */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment
              </h2>
              <div
                className={`flex items-center gap-2 ${getPaymentStatusColor(
                  workOrder.paymentStatus
                )}`}
              >
                {getPaymentStatusIcon(workOrder.paymentStatus)}
                <span className="font-semibold capitalize">
                  {workOrder.paymentStatus}
                </span>
              </div>
            </div>

            {workOrder.paymentStatus === "PENDING" && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  {workOrder.finalCost || workOrder.estimatedCost
                    ? `Amount due: ₦${(
                        workOrder.finalCost || workOrder.estimatedCost
                      )?.toLocaleString()}`
                    : "No amount set. Please contact support."}
                </p>
                <Button
                  onClick={handlePayment}
                  disabled={paymentLoading || !workOrder.finalCost}
                  className="w-full bg-green-600 hover:bg-green-700 gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  {paymentLoading ? "Processing..." : "Pay with Paystack"}
                </Button>
              </div>
            )}

            {workOrder.paymentStatus === "PAID" && (
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <p className="text-green-800 font-semibold">
                  Payment completed successfully
                </p>
              </div>
            )}

            {workOrder.paymentStatus === "FAILED" && (
              <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
                <p className="text-red-800 font-semibold">Payment failed</p>
                <Button
                  onClick={handlePayment}
                  disabled={paymentLoading}
                  className="mt-4 w-full bg-orange-600"
                >
                  {paymentLoading ? "Retrying..." : "Retry Payment"}
                </Button>
              </div>
            )}
          </Card>

          {/* Notes */}
          {(workOrder.notes || editMode) && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Technician Notes</h2>
              {editMode ? (
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={6}
                  maxLength={2000}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent resize-none"
                  placeholder="Add notes about diagnostics, repairs, or recommendations..."
                />
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap">
                  {workOrder.notes || "No notes available"}
                </p>
              )}
            </Card>
          )}
        </div>

        {/* Right Column - Costs & Status */}
        <div className="space-y-6">
          {/* Current Status */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Current Status</h2>
            {editMode ? (
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-600"
              >
                {STATUS_PROGRESSION.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
                <option value="CANCELLED">Cancelled</option>
              </select>
            ) : (
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${getStatusColor(
                  workOrder.status
                )}`}
              >
                {STATUS_PROGRESSION.find((s) => s.value === workOrder.status)
                  ?.icon &&
                  (() => {
                    const Icon = STATUS_PROGRESSION.find(
                      (s) => s.value === workOrder.status
                    )!.icon;
                    return <Icon className="h-5 w-5" />;
                  })()}
                <span className="font-semibold">
                  {STATUS_PROGRESSION.find((s) => s.value === workOrder.status)
                    ?.label || workOrder.status}
                </span>
              </div>
            )}
          </Card>

          {/* Cost Breakdown */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Cost Breakdown</h2>
            <div className="space-y-3">
              {workOrder.dispatchFee && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Dispatch Fee:</span>
                  <span className="font-semibold">
                    ₦{workOrder.dispatchFee.toLocaleString()}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-gray-600">Estimated Cost:</span>
                {editMode ? (
                  <Input
                    type="number"
                    value={formData.estimatedCost}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        estimatedCost: e.target.value,
                      })
                    }
                    className="w-32 text-right"
                    placeholder="0.00"
                    step="0.01"
                  />
                ) : (
                  <span className="font-semibold">
                    {workOrder.estimatedCost
                      ? `₦${workOrder.estimatedCost.toLocaleString()}`
                      : "TBD"}
                  </span>
                )}
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Final Cost:</span>
                {editMode ? (
                  <Input
                    type="number"
                    value={formData.finalCost}
                    onChange={(e) =>
                      setFormData({ ...formData, finalCost: e.target.value })
                    }
                    className="w-32 text-right"
                    placeholder="0.00"
                    step="0.01"
                  />
                ) : (
                  <span className="font-semibold">
                    {workOrder.finalCost
                      ? `₦${workOrder.finalCost.toLocaleString()}`
                      : "TBD"}
                  </span>
                )}
              </div>

              {workOrder.totalAmount && (
                <>
                  <div className="border-t pt-3 flex justify-between text-lg">
                    <span className="font-bold">Total Amount:</span>
                    <span className="font-bold text-orange-600">
                      ₦{workOrder.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Dates */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Timeline</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-600" />
                <div>
                  <p className="text-gray-600">Created</p>
                  <p className="font-semibold">
                    {new Date(workOrder.createdAt).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-600" />
                <div>
                  <p className="text-gray-600">Last Updated</p>
                  <p className="font-semibold">
                    {new Date(workOrder.updatedAt).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Warranty and Parts Sections */}
      <div className="mt-6 space-y-6">
        <WarrantySection
          workOrderId={workOrderId}
          deviceId={workOrder.device.id}
          deviceBrand={workOrder.device.brand}
          currentStatus={workOrder.warrantyStatus}
          currentProvider={workOrder.warrantyProvider}
        />

        <PartsSearch
          deviceBrand={workOrder.device.brand}
          deviceModel={workOrder.device.model}
        />
      </div>
    </div>
  );
}
