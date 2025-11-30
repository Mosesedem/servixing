"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, User, Phone, Mail, MapPin } from "lucide-react";

interface WorkOrderDetails {
  id: string;
  user: {
    id: string;
    email: string;
    name: string;
    phone: string;
    address?: string;
  };
  device: {
    id: string;
    brand: string;
    model: string;
    serialNumber?: string;
    imei?: string;
    color?: string;
    deviceType: string;
    description?: string;
  };
  status: string;
  issueDescription: string;
  problemType?: string;
  dropoffType: string;
  dispatchAddress?: any;
  dispatchFee?: number;
  estimatedCost?: number;
  finalCost?: number;
  totalAmount?: number;
  costBreakdown?: any;
  warrantyChecked: boolean;
  warrantyStatus: string;
  warrantyProvider?: string;
  warrantyExpiryDate?: string;
  warrantyDecision?: string;
  paymentStatus: string;
  paymentMethod?: string;
  paymentReference?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  payments: any[];
  parts: any[];
  warrantyChecks: any[];
  supportTickets: any[];
}

export default function WorkOrderDetails() {
  const params = useParams();
  const id = params.id as string;
  const [workOrder, setWorkOrder] = useState<WorkOrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkOrder();
  }, [id]);

  const fetchWorkOrder = async () => {
    try {
      const response = await fetch(`/api/admin/work-orders/${id}`);
      if (response.ok) {
        const data = await response.json();
        setWorkOrder(data);
      }
    } catch (error) {
      console.error("Error fetching work order:", error);
    } finally {
      setLoading(false);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading work order details...</div>
      </div>
    );
  }

  if (!workOrder) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Work order not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/admin/work-orders">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Work Orders
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">
          Work Order #{workOrder.id.slice(-8)}
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-semibold">{workOrder.user.name}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {workOrder.user.email}
              </p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Phone className="h-4 w-4" />
                {workOrder.user.phone}
              </p>
              {workOrder.user.address && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {workOrder.user.address}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Device Information */}
        <Card>
          <CardHeader>
            <CardTitle>Device Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-semibold">
                {workOrder.device.brand} {workOrder.device.model}
              </p>
              {workOrder.device.serialNumber && (
                <p className="text-sm text-muted-foreground">
                  Serial: {workOrder.device.serialNumber}
                </p>
              )}
              {workOrder.device.imei && (
                <p className="text-sm text-muted-foreground">
                  IMEI: {workOrder.device.imei}
                </p>
              )}
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">{workOrder.device.deviceType}</Badge>
                {workOrder.device.color && (
                  <Badge variant="outline">{workOrder.device.color}</Badge>
                )}
                {workOrder.device.description && (
                  <Badge variant="outline">
                    {workOrder.device.description}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Work Order Details */}
        <Card>
          <CardHeader>
            <CardTitle>Work Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(workOrder.status)}>
                {formatStatus(workOrder.status)}
              </Badge>
              <Badge className={getPaymentColor(workOrder.paymentStatus)}>
                {formatStatus(workOrder.paymentStatus)}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium">Issue Description</p>
              <p className="text-sm text-muted-foreground">
                {workOrder.issueDescription}
              </p>
            </div>
            {workOrder.problemType && (
              <div>
                <p className="text-sm font-medium">Problem Type</p>
                <p className="text-sm text-muted-foreground">
                  {workOrder.problemType}
                </p>
              </div>
            )}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Created: {new Date(workOrder.createdAt).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>

        {/* Cost Information */}
        <Card>
          <CardHeader>
            <CardTitle>Cost Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {workOrder.estimatedCost && (
              <div>
                <p className="text-sm font-medium">Estimated Cost</p>
                <p className="text-sm">
                  {formatCurrency(workOrder.estimatedCost)}
                </p>
              </div>
            )}
            {workOrder.finalCost && (
              <div>
                <p className="text-sm font-medium">Final Cost</p>
                <p className="text-sm">{formatCurrency(workOrder.finalCost)}</p>
              </div>
            )}
            {workOrder.totalAmount && (
              <div>
                <p className="text-sm font-medium">Total Amount</p>
                <p className="text-sm">
                  {formatCurrency(workOrder.totalAmount)}
                </p>
              </div>
            )}
            {workOrder.dispatchFee && (
              <div>
                <p className="text-sm font-medium">Dispatch Fee</p>
                <p className="text-sm">
                  {formatCurrency(workOrder.dispatchFee)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Warranty Information */}
      {workOrder.warrantyChecked && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Warranty Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {formatStatus(workOrder.warrantyStatus)}
              </Badge>
              {workOrder.warrantyProvider && (
                <Badge variant="outline">{workOrder.warrantyProvider}</Badge>
              )}
            </div>
            {workOrder.warrantyExpiryDate && (
              <p className="text-sm">
                Expires:{" "}
                {new Date(workOrder.warrantyExpiryDate).toLocaleDateString()}
              </p>
            )}
            {workOrder.warrantyDecision && (
              <p className="text-sm">Decision: {workOrder.warrantyDecision}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payments */}
      {workOrder.payments.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {workOrder.payments.map((payment) => (
                <div key={payment.id} className="border rounded p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        {formatCurrency(payment.amount)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Status: {formatStatus(payment.status)}
                      </p>
                      {payment.paystackReference && (
                        <p className="text-sm text-muted-foreground">
                          Ref: {payment.paystackReference}
                        </p>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Parts */}
      {workOrder.parts.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Parts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {workOrder.parts.map((part) => (
                <div key={part.id} className="border rounded p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{part.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(part.price)} × {part.quantity}
                      </p>
                      <Badge variant="outline">
                        {formatStatus(part.orderStatus)}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {workOrder.notes && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{workOrder.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
