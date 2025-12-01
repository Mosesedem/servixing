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
import { Trash2, Edit, RefreshCw } from "lucide-react";

interface WarrantyCheck {
  id: string;
  provider: string;
  status: string;
  // Structured fields from DB
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
  workOrder: {
    id: string;
    user: { name: string; email: string };
    device: {
      brand: string;
      model: string;
      serialNumber?: string;
      imei?: string;
    };
  };
}

export default function AdminWarrantyChecks() {
  const [checks, setChecks] = useState<WarrantyCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [editingCheck, setEditingCheck] = useState<WarrantyCheck | null>(null);
  const [sendEmail, setSendEmail] = useState(true);
  const [newStatus, setNewStatus] = useState("");
  const [formWarrantyStatus, setFormWarrantyStatus] = useState("");
  const [formWarrantyExpiry, setFormWarrantyExpiry] = useState("");
  const [formPurchaseDate, setFormPurchaseDate] = useState("");
  const [formCoverageStart, setFormCoverageStart] = useState("");
  const [formCoverageEnd, setFormCoverageEnd] = useState("");
  const [formDeviceStatus, setFormDeviceStatus] = useState("");
  const [formNotes, setFormNotes] = useState("");

  useEffect(() => {
    fetchChecks();
  }, [statusFilter, searchTerm, page]);

  const fetchChecks = async () => {
    try {
      let url = "/api/admin/warranty-checks";
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (searchTerm) params.append("search", searchTerm);
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (params.toString()) url += "?" + params.toString();

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setChecks(data.checks);
        setTotal(data.total);
      }
    } catch (error) {
      console.error("Error fetching warranty checks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (checkId: string, status: string) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/warranty-checks/${checkId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          sendEmail,
          warrantyStatus: formWarrantyStatus || null,
          warrantyExpiry: formWarrantyExpiry || null,
          purchaseDate: formPurchaseDate || null,
          coverageStart: formCoverageStart || null,
          coverageEnd: formCoverageEnd || null,
          deviceStatus: formDeviceStatus || null,
          additionalNotes: formNotes || null,
        }),
      });
      if (response.ok) {
        fetchChecks();
        setEditingCheck(null);
        setNewStatus("");
        setFormWarrantyStatus("");
        setFormWarrantyExpiry("");
        setFormPurchaseDate("");
        setFormCoverageStart("");
        setFormCoverageEnd("");
        setFormDeviceStatus("");
        setFormNotes("");
      }
    } catch (error) {
      console.error("Error updating warranty check:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteCheck = async (checkId: string) => {
    if (!confirm("Are you sure you want to delete this warranty check?"))
      return;
    try {
      const response = await fetch(`/api/admin/warranty-checks/${checkId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sendEmail }),
      });
      if (response.ok) {
        fetchChecks();
      }
    } catch (error) {
      console.error("Error deleting warranty check:", error);
    }
  };

  const handleRetryCheck = async (checkId: string) => {
    try {
      const response = await fetch(
        `/api/admin/warranty-checks/${checkId}/retry`,
        {
          method: "POST",
        }
      );
      if (response.ok) {
        fetchChecks();
      }
    } catch (error) {
      console.error("Error retrying warranty check:", error);
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

  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Warranty Checks Management</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by provider, device, or user..."
          className="w-[300px]"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="QUEUED">Queued</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="SUCCESS">Success</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
            <SelectItem value="MANUAL_REQUIRED">Manual Required</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground">
          Loading warranty checks...
        </div>
      ) : checks.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No warranty checks found</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {checks.map((check) => (
            <Card key={check.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {check.provider.toUpperCase()} Warranty Check
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {check.workOrder?.user
                          ? `${check.workOrder.user.name} (${check.workOrder.user.email})`
                          : "User information not available"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {check.workOrder?.device ? (
                          <>
                            {check.workOrder.device.brand}{" "}
                            {check.workOrder.device.model}
                            {check.workOrder.device.serialNumber &&
                              ` - SN: ${check.workOrder.device.serialNumber}`}
                            {check.workOrder.device.imei &&
                              ` - IMEI: ${check.workOrder.device.imei}`}
                          </>
                        ) : (
                          "Device information not available"
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                        check.status
                      )}`}
                    >
                      {formatStatus(check.status)}
                    </span>
                    {check.finishedAt && (
                      <span className="text-muted-foreground">
                        Completed: {new Date(check.finishedAt).toLocaleString()}
                      </span>
                    )}
                  </div>

                  {check.errorMessage && (
                    <p className="text-sm text-red-600 mt-2">
                      Error: {check.errorMessage}
                    </p>
                  )}

                  {check.result && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                      <strong>Result:</strong>{" "}
                      {JSON.stringify(check.result, null, 2)}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {(check.status === "FAILED" ||
                    check.status === "MANUAL_REQUIRED") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRetryCheck(check.id)}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  )}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingCheck(check);
                          setNewStatus(check.status);
                          setFormWarrantyStatus(check.warrantyStatus || "");
                          setFormWarrantyExpiry(
                            check.warrantyExpiry
                              ? check.warrantyExpiry.substring(0, 10)
                              : ""
                          );
                          setFormPurchaseDate(
                            check.purchaseDate
                              ? check.purchaseDate.substring(0, 10)
                              : ""
                          );
                          setFormCoverageStart(
                            check.coverageStart
                              ? check.coverageStart.substring(0, 10)
                              : ""
                          );
                          setFormCoverageEnd(
                            check.coverageEnd
                              ? check.coverageEnd.substring(0, 10)
                              : ""
                          );
                          setFormDeviceStatus(check.deviceStatus || "");
                          setFormNotes(check.additionalNotes || "");
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Update Warranty Check Status</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            New Status
                          </label>
                          <Select
                            value={newStatus}
                            onValueChange={setNewStatus}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="QUEUED">Queued</SelectItem>
                              <SelectItem value="IN_PROGRESS">
                                In Progress
                              </SelectItem>
                              <SelectItem value="SUCCESS">Success</SelectItem>
                              <SelectItem value="FAILED">Failed</SelectItem>
                              <SelectItem value="MANUAL_REQUIRED">
                                Manual Required
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Warranty Status
                            </label>
                            <Input
                              value={formWarrantyStatus}
                              onChange={(e) =>
                                setFormWarrantyStatus(e.target.value)
                              }
                              placeholder="e.g. In Warranty, Out of Warranty"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Device Status
                            </label>
                            <Input
                              value={formDeviceStatus}
                              onChange={(e) =>
                                setFormDeviceStatus(e.target.value)
                              }
                              placeholder="e.g. Clean, Blacklisted"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Warranty Expiry Date
                            </label>
                            <Input
                              type="date"
                              value={formWarrantyExpiry}
                              onChange={(e) =>
                                setFormWarrantyExpiry(e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Purchase Date
                            </label>
                            <Input
                              type="date"
                              value={formPurchaseDate}
                              onChange={(e) =>
                                setFormPurchaseDate(e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Coverage Start
                            </label>
                            <Input
                              type="date"
                              value={formCoverageStart}
                              onChange={(e) =>
                                setFormCoverageStart(e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Coverage End
                            </label>
                            <Input
                              type="date"
                              value={formCoverageEnd}
                              onChange={(e) =>
                                setFormCoverageEnd(e.target.value)
                              }
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Additional Notes (included in email)
                          </label>
                          <textarea
                            className="w-full border rounded-md px-3 py-2 text-sm"
                            rows={4}
                            value={formNotes}
                            onChange={(e) => setFormNotes(e.target.value)}
                            placeholder="Add any manual findings or comments for the customer..."
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
                            Send email notification
                          </label>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() =>
                              editingCheck &&
                              handleStatusUpdate(editingCheck.id, newStatus)
                            }
                            disabled={updating}
                          >
                            {updating ? "Updating..." : "Update Status"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setEditingCheck(null);
                              setNewStatus("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCheck(check.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Link href={`/admin/work-orders/${check.workOrderId}`}>
                    <Button variant="outline" size="sm">
                      View Work Order
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
