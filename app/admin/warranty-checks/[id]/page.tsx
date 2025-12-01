"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, RefreshCw } from "lucide-react";

interface WarrantyCheck {
  id: string;
  provider: string;
  status: string;
  warrantyStatus?: string | null;
  warrantyExpiry?: string | null;
  purchaseDate?: string | null;
  coverageStart?: string | null;
  coverageEnd?: string | null;
  deviceStatus?: string | null;
  additionalNotes?: string | null;
  result?: any;
  errorMessage?: string;
  createdAt: string;
  finishedAt?: string;
  workOrderId: string;
  workOrder?: {
    id: string;
    paymentStatus: string;
    user: { name: string; email: string; phone?: string };
    device: {
      brand: string;
      model: string;
      serialNumber?: string;
      imei?: string;
    };
  } | null;
}

export default function WarrantyCheckDetails() {
  const params = useParams();
  const id = params.id as string;
  const [check, setCheck] = useState<WarrantyCheck | null>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    fetchCheck();
  }, [id]);

  const fetchCheck = async () => {
    try {
      const response = await fetch(`/api/admin/warranty-checks/${id}`);
      if (response.ok) {
        const data = await response.json();
        setCheck(data.check);
      }
    } catch (error) {
      console.error("Error fetching warranty check:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryCheck = async () => {
    setRetrying(true);
    try {
      const response = await fetch(`/api/admin/warranty-checks/${id}/retry`, {
        method: "POST",
      });
      if (response.ok) {
        fetchCheck();
      }
    } catch (error) {
      console.error("Error retrying warranty check:", error);
    } finally {
      setRetrying(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "QUEUED":
        return "bg-gray-100 text-gray-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "SUCCESS":
        return "bg-green-100 text-green-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      case "MANUAL_REQUIRED":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "PAID":
        return "bg-green-100 text-green-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      case "REFUNDED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-muted-foreground">
          Loading warranty check details...
        </div>
      </div>
    );
  }

  if (!check) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Warranty check not found</p>
          <Link href="/admin/warranty-checks">
            <Button className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Warranty Checks
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/warranty-checks">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">
          Warranty Check Details - {check.provider.toUpperCase()}
        </h1>
      </div>

      <div className="grid gap-6">
        {/* Status and Actions */}
        <Card className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Check Status</h2>
              <div className="flex items-center gap-3">
                <Badge className={getStatusColor(check.status)}>
                  {formatStatus(check.status)}
                </Badge>
                {check.finishedAt && (
                  <span className="text-sm text-muted-foreground">
                    Completed: {new Date(check.finishedAt).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {(check.status === "FAILED" ||
                check.status === "MANUAL_REQUIRED") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetryCheck}
                  disabled={retrying}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${retrying ? "animate-spin" : ""}`}
                  />
                  {retrying ? "Retrying..." : "Retry Check"}
                </Button>
              )}
              <Link href={`/admin/warranty-checks/${check.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
            </div>
          </div>

          {check.errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
              <p className="text-red-800 font-medium">Error:</p>
              <p className="text-red-700">{check.errorMessage}</p>
            </div>
          )}
        </Card>

        {/* Work Order and Payment Info */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Work Order Information</h2>
          {check.workOrder ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Work Order ID
                </p>
                <p className="font-mono">{check.workOrder.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Payment Status
                </p>
                <Badge
                  className={getPaymentStatusColor(
                    check.workOrder.paymentStatus
                  )}
                >
                  {formatStatus(check.workOrder.paymentStatus)}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Customer
                </p>
                <p>{check.workOrder.user.name}</p>
                <p className="text-sm text-muted-foreground">
                  {check.workOrder.user.email}
                </p>
                {check.workOrder.user.phone && (
                  <p className="text-sm text-muted-foreground">
                    {check.workOrder.user.phone}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Device
                </p>
                <p>
                  {check.workOrder.device.brand} {check.workOrder.device.model}
                </p>
                {check.workOrder.device.serialNumber && (
                  <p className="text-sm text-muted-foreground">
                    SN: {check.workOrder.device.serialNumber}
                  </p>
                )}
                {check.workOrder.device.imei && (
                  <p className="text-sm text-muted-foreground">
                    IMEI: {check.workOrder.device.imei}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">
              Work order information not available
            </p>
          )}
        </Card>

        {/* Warranty Details */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Warranty Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Warranty Status
              </p>
              <p>{check.warrantyStatus || "Not set"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Device Status
              </p>
              <p>{check.deviceStatus || "Not set"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Warranty Expiry
              </p>
              <p>
                {check.warrantyExpiry
                  ? new Date(check.warrantyExpiry).toLocaleDateString()
                  : "Not set"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Purchase Date
              </p>
              <p>
                {check.purchaseDate
                  ? new Date(check.purchaseDate).toLocaleDateString()
                  : "Not set"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Coverage Start
              </p>
              <p>
                {check.coverageStart
                  ? new Date(check.coverageStart).toLocaleDateString()
                  : "Not set"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Coverage End
              </p>
              <p>
                {check.coverageEnd
                  ? new Date(check.coverageEnd).toLocaleDateString()
                  : "Not set"}
              </p>
            </div>
          </div>

          {check.additionalNotes && (
            <div className="mt-4">
              <p className="text-sm font-medium text-muted-foreground">
                Additional Notes
              </p>
              <p className="whitespace-pre-wrap">{check.additionalNotes}</p>
            </div>
          )}
        </Card>

        {/* Raw Result */}
        {check.result && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Raw API Response</h2>
            <pre className="bg-gray-50 p-4 rounded text-sm overflow-x-auto">
              {JSON.stringify(check.result, null, 2)}
            </pre>
          </Card>
        )}

        {/* Timestamps */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Timestamps</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Created At
              </p>
              <p>{new Date(check.createdAt).toLocaleString()}</p>
            </div>
            {check.finishedAt && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Finished At
                </p>
                <p>{new Date(check.finishedAt).toLocaleString()}</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
