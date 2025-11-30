"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  Edit,
  Save,
  X,
} from "lucide-react";

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
    images: string[];
  };
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
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
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<WorkOrderDetails>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchWorkOrder();
  }, [id]);

  const fetchWorkOrder = async () => {
    try {
      const response = await fetch(`/api/admin/work-orders/${id}`);
      if (response.ok) {
        const data = await response.json();
        setWorkOrder(data);
        setFormData(data);
      }
    } catch (error) {
      console.error("Error fetching work order:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/work-orders/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const updatedData = await response.json();
        setWorkOrder(updatedData);
        setFormData(updatedData);
        setEditMode(false);
      } else {
        console.error("Failed to update work order");
      }
    } catch (error) {
      console.error("Error updating work order:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(workOrder || {});
    setEditMode(false);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
        <div className="flex gap-2">
          {!editMode ? (
            <Button onClick={() => setEditMode(true)} variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          ) : (
            <>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save"}
              </Button>
              <Button onClick={handleCancel} variant="outline">
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </>
          )}
        </div>
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

        {/* Contact Information */}
        {(workOrder.contactName ||
          workOrder.contactEmail ||
          workOrder.contactPhone) && (
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {workOrder.contactName && (
                <p className="text-sm">Name: {workOrder.contactName}</p>
              )}
              {workOrder.contactEmail && (
                <p className="text-sm">Email: {workOrder.contactEmail}</p>
              )}
              {workOrder.contactPhone && (
                <p className="text-sm">Phone: {workOrder.contactPhone}</p>
              )}
            </CardContent>
          </Card>
        )}

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
              {workOrder.device.images &&
                workOrder.device.images.length > 0 && (
                  <div>
                    <p className="text-sm font-medium">Device Images</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {workOrder.device.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Device image ${index + 1}`}
                          className="w-20 h-20 object-cover rounded"
                        />
                      ))}
                    </div>
                  </div>
                )}
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
              {editMode ? (
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange("status", value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CREATED">Created</SelectItem>
                    <SelectItem value="ACCEPTED">Accepted</SelectItem>
                    <SelectItem value="IN_REPAIR">In Repair</SelectItem>
                    <SelectItem value="AWAITING_PARTS">
                      Awaiting Parts
                    </SelectItem>
                    <SelectItem value="READY_FOR_PICKUP">
                      Ready For Pickup
                    </SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge className={getStatusColor(workOrder.status)}>
                  {formatStatus(workOrder.status)}
                </Badge>
              )}
              {editMode ? (
                <Select
                  value={formData.paymentStatus}
                  onValueChange={(value) =>
                    handleInputChange("paymentStatus", value)
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge className={getPaymentColor(workOrder.paymentStatus)}>
                  {formatStatus(workOrder.paymentStatus)}
                </Badge>
              )}
            </div>
            {editMode ? (
              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Input
                  id="paymentMethod"
                  value={formData.paymentMethod || ""}
                  onChange={(e) =>
                    handleInputChange("paymentMethod", e.target.value)
                  }
                />
              </div>
            ) : (
              workOrder.paymentMethod && (
                <div>
                  <p className="text-sm font-medium">Payment Method</p>
                  <p className="text-sm text-muted-foreground">
                    {workOrder.paymentMethod}
                  </p>
                </div>
              )
            )}
            {editMode ? (
              <div>
                <Label htmlFor="paymentReference">Payment Reference</Label>
                <Input
                  id="paymentReference"
                  value={formData.paymentReference || ""}
                  onChange={(e) =>
                    handleInputChange("paymentReference", e.target.value)
                  }
                />
              </div>
            ) : (
              workOrder.paymentReference && (
                <div>
                  <p className="text-sm font-medium">Payment Reference</p>
                  <p className="text-sm text-muted-foreground">
                    {workOrder.paymentReference}
                  </p>
                </div>
              )
            )}
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
              Created: {new Date(workOrder.createdAt).toLocaleDateString()} |
              Updated: {new Date(workOrder.updatedAt).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>

        {/* Cost Information */}
        <Card>
          <CardHeader>
            <CardTitle>Cost Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {editMode ? (
              <div>
                <Label htmlFor="estimatedCost">Estimated Cost</Label>
                <Input
                  id="estimatedCost"
                  type="number"
                  value={formData.estimatedCost || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "estimatedCost",
                      parseFloat(e.target.value) || 0
                    )
                  }
                />
              </div>
            ) : (
              workOrder.estimatedCost && (
                <div>
                  <p className="text-sm font-medium">Estimated Cost</p>
                  <p className="text-sm">
                    {formatCurrency(workOrder.estimatedCost)}
                  </p>
                </div>
              )
            )}
            {editMode ? (
              <div>
                <Label htmlFor="finalCost">Final Cost</Label>
                <Input
                  id="finalCost"
                  type="number"
                  value={formData.finalCost || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "finalCost",
                      parseFloat(e.target.value) || 0
                    )
                  }
                />
              </div>
            ) : (
              workOrder.finalCost && (
                <div>
                  <p className="text-sm font-medium">Final Cost</p>
                  <p className="text-sm">
                    {formatCurrency(workOrder.finalCost)}
                  </p>
                </div>
              )
            )}
            {editMode ? (
              <div>
                <Label htmlFor="totalAmount">Total Amount</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  value={formData.totalAmount || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "totalAmount",
                      parseFloat(e.target.value) || 0
                    )
                  }
                />
              </div>
            ) : (
              workOrder.totalAmount && (
                <div>
                  <p className="text-sm font-medium">Total Amount</p>
                  <p className="text-sm">
                    {formatCurrency(workOrder.totalAmount)}
                  </p>
                </div>
              )
            )}
            {editMode ? (
              <div>
                <Label htmlFor="dispatchFee">Dispatch Fee</Label>
                <Input
                  id="dispatchFee"
                  type="number"
                  value={formData.dispatchFee || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "dispatchFee",
                      parseFloat(e.target.value) || 0
                    )
                  }
                />
              </div>
            ) : (
              workOrder.dispatchFee && (
                <div>
                  <p className="text-sm font-medium">Dispatch Fee</p>
                  <p className="text-sm">
                    {formatCurrency(workOrder.dispatchFee)}
                  </p>
                </div>
              )
            )}
            {editMode ? (
              <div>
                <Label htmlFor="costBreakdown">Cost Breakdown</Label>
                <Textarea
                  id="costBreakdown"
                  value={
                    typeof formData.costBreakdown === "object"
                      ? JSON.stringify(formData.costBreakdown, null, 2)
                      : formData.costBreakdown || ""
                  }
                  onChange={(e) =>
                    handleInputChange("costBreakdown", e.target.value)
                  }
                />
              </div>
            ) : (
              workOrder.costBreakdown && (
                <div>
                  <p className="text-sm font-medium">Cost Breakdown</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {typeof workOrder.costBreakdown === "object"
                      ? JSON.stringify(workOrder.costBreakdown, null, 2)
                      : workOrder.costBreakdown}
                  </p>
                </div>
              )
            )}
          </CardContent>
        </Card>
      </div>

      {/* Service Type */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Service Type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm font-medium">Dropoff Type</p>
            <p className="text-sm text-muted-foreground">
              {formatStatus(workOrder.dropoffType)}
            </p>
          </div>
          {workOrder.dispatchAddress && (
            <div>
              <p className="text-sm font-medium">Dispatch Address</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {typeof workOrder.dispatchAddress === "object"
                  ? JSON.stringify(workOrder.dispatchAddress, null, 2)
                  : workOrder.dispatchAddress}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

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
            {editMode ? (
              <div>
                <Label htmlFor="warrantyDecision">Warranty Decision</Label>
                <Textarea
                  id="warrantyDecision"
                  value={formData.warrantyDecision || ""}
                  onChange={(e) =>
                    handleInputChange("warrantyDecision", e.target.value)
                  }
                />
              </div>
            ) : (
              workOrder.warrantyDecision && (
                <p className="text-sm">
                  Decision: {workOrder.warrantyDecision}
                </p>
              )
            )}
          </CardContent>
        </Card>
      )}

      {/* Support Tickets */}
      {workOrder.supportTickets.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Support Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {workOrder.supportTickets.map((ticket) => (
                <div key={ticket.id} className="border rounded p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{ticket.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Status: {formatStatus(ticket.status)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Priority: {ticket.priority}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warranty Checks */}
      {workOrder.warrantyChecks.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Warranty Checks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {workOrder.warrantyChecks.map((check) => (
                <div key={check.id} className="border rounded p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{check.provider}</p>
                      <p className="text-sm text-muted-foreground">
                        Status: {formatStatus(check.status)}
                      </p>
                      {check.result && (
                        <p className="text-sm text-muted-foreground">
                          Result:{" "}
                          {typeof check.result === "object"
                            ? JSON.stringify(check.result, null, 2)
                            : check.result}
                        </p>
                      )}
                      {check.errorMessage && (
                        <p className="text-sm text-red-600">
                          Error: {check.errorMessage}
                        </p>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Initiated:{" "}
                      {new Date(check.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
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
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          {editMode ? (
            <Textarea
              value={formData.notes || ""}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Add notes..."
            />
          ) : (
            <p className="text-sm whitespace-pre-wrap">
              {workOrder.notes || "No notes"}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
