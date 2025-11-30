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
import { Trash2, Edit } from "lucide-react";

interface PartRequest {
  id: string;
  ebayItemId: string;
  title: string;
  partNumber?: string;
  price: number;
  currency: string;
  quantity: number;
  orderStatus: string;
  workOrderId?: string;
  workOrder?: {
    id: string;
    user: { name: string; email: string };
    device: { brand: string; model: string };
  };
  createdAt: string;
}

export default function AdminPartsRequests() {
  const [parts, setParts] = useState<PartRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [editingPart, setEditingPart] = useState<PartRequest | null>(null);
  const [sendEmail, setSendEmail] = useState(true);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    fetchParts();
  }, [statusFilter, searchTerm, page]);

  const fetchParts = async () => {
    try {
      let url = "/api/admin/parts-requests";
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (searchTerm) params.append("search", searchTerm);
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (params.toString()) url += "?" + params.toString();

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setParts(data.parts);
        setTotal(data.total);
      }
    } catch (error) {
      console.error("Error fetching parts requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (partId: string, status: string) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/parts-requests/${partId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderStatus: status,
          sendEmail,
        }),
      });
      if (response.ok) {
        fetchParts();
        setEditingPart(null);
        setNewStatus("");
      }
    } catch (error) {
      console.error("Error updating part status:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeletePart = async (partId: string) => {
    if (!confirm("Are you sure you want to delete this part request?")) return;
    try {
      const response = await fetch(`/api/admin/parts-requests/${partId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sendEmail }),
      });
      if (response.ok) {
        fetchParts();
      }
    } catch (error) {
      console.error("Error deleting part:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ORDERED":
        return "bg-blue-100 text-blue-800";
      case "SHIPPED":
        return "bg-yellow-100 text-yellow-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
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
      <h1 className="text-3xl font-bold mb-6">Parts Requests Management</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by title, part number, or work order..."
          className="w-[300px]"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ORDERED">Ordered</SelectItem>
            <SelectItem value="SHIPPED">Shipped</SelectItem>
            <SelectItem value="DELIVERED">Delivered</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground">
          Loading parts requests...
        </div>
      ) : parts.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No parts requests found</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {parts.map((part) => (
            <Card key={part.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{part.title}</h3>
                      {part.partNumber && (
                        <p className="text-sm text-muted-foreground">
                          Part Number: {part.partNumber}
                        </p>
                      )}
                      {part.workOrder && (
                        <p className="text-sm text-muted-foreground">
                          For: {part.workOrder.user.name} -{" "}
                          {part.workOrder.device.brand}{" "}
                          {part.workOrder.device.model}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="font-semibold">
                      {part.currency} {Number(part.price).toFixed(2)} x{" "}
                      {part.quantity}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                        part.orderStatus
                      )}`}
                    >
                      {formatStatus(part.orderStatus)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingPart(part);
                          setNewStatus(part.orderStatus);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Update Part Status</DialogTitle>
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
                              <SelectItem value="ORDERED">Ordered</SelectItem>
                              <SelectItem value="SHIPPED">Shipped</SelectItem>
                              <SelectItem value="DELIVERED">
                                Delivered
                              </SelectItem>
                              <SelectItem value="CANCELLED">
                                Cancelled
                              </SelectItem>
                            </SelectContent>
                          </Select>
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
                              editingPart &&
                              handleStatusUpdate(editingPart.id, newStatus)
                            }
                            disabled={updating}
                          >
                            {updating ? "Updating..." : "Update Status"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setEditingPart(null);
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
                    onClick={() => handleDeletePart(part.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  {part.workOrderId && (
                    <Link href={`/admin/work-orders/${part.workOrderId}`}>
                      <Button variant="outline" size="sm">
                        View Work Order
                      </Button>
                    </Link>
                  )}
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
