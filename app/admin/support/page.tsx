"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/loading-spinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, MessageSquare } from "lucide-react";

interface TicketRow {
  id: string;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
  user?: { name?: string | null; email?: string | null; phone?: string | null };
  device?: { deviceType?: string; brand?: string; model?: string } | null;
  dropoffType?: string | null;
  address?: { city?: string; state?: string } | null;
  imagesCount: number;
}

export default function AdminSupportQueuePage() {
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [rows, setRows] = useState<TicketRow[]>([]);
  const [editingTicket, setEditingTicket] = useState<TicketRow | null>(null);
  const [sendEmail, setSendEmail] = useState(true);
  const [notes, setNotes] = useState("");

  const [q, setQ] = useState(params.get("q") || "");
  const [status, setStatus] = useState(params.get("status") || "");
  const [priority, setPriority] = useState(params.get("priority") || "");
  const [dropoffType, setDropoffType] = useState(
    params.get("dropoffType") || ""
  );
  const [deviceType, setDeviceType] = useState(params.get("deviceType") || "");
  const [brand, setBrand] = useState(params.get("brand") || "");
  const [hasImages, setHasImages] = useState(params.get("hasImages") || "");
  const [city, setCity] = useState(params.get("city") || "");
  const [state, setStateVal] = useState(params.get("state") || "");

  const queryString = useMemo(() => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (status) sp.set("status", status);
    if (priority) sp.set("priority", priority);
    if (dropoffType) sp.set("dropoffType", dropoffType);
    if (deviceType) sp.set("deviceType", deviceType);
    if (brand) sp.set("brand", brand);
    if (hasImages) sp.set("hasImages", hasImages);
    if (city) sp.set("city", city);
    if (state) sp.set("state", state);
    return sp.toString();
  }, [
    q,
    status,
    priority,
    dropoffType,
    deviceType,
    brand,
    hasImages,
    city,
    state,
  ]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/support/tickets?${queryString}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error?.message || "Failed to load tickets");
      }
      const data = await res.json();
      setRows(data.data || []);
      router.replace(`/admin/support?${queryString}`);
    } catch (e: any) {
      setError(e.message || "Error loading tickets");
    } finally {
      setLoading(false);
    }
  }

  const handleStatusUpdate = async (ticketId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/support/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          notes,
          sendEmail,
        }),
      });
      if (res.ok) {
        load();
        setEditingTicket(null);
        setNotes("");
      }
    } catch (err) {
      console.error("Failed to update ticket:", err);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Support Queue Management</h1>
      <Card className="p-4 space-y-3">
        <div className="grid md:grid-cols-4 gap-3">
          <Input
            placeholder="Search..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            className="border rounded px-2 py-2"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="OPEN">OPEN</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="PENDING">PENDING</option>
            <option value="CLOSED">CLOSED</option>
          </select>
          <select
            className="border rounded px-2 py-2"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="">All Priority</option>
            <option value="low">low</option>
            <option value="normal">normal</option>
            <option value="high">high</option>
            <option value="urgent">urgent</option>
          </select>
          <select
            className="border rounded px-2 py-2"
            value={dropoffType}
            onChange={(e) => setDropoffType(e.target.value)}
          >
            <option value="">All Service Types</option>
            <option value="DROPOFF">DROPOFF</option>
            <option value="DISPATCH">DISPATCH</option>
          </select>
          <Input
            placeholder="Device Type"
            value={deviceType}
            onChange={(e) => setDeviceType(e.target.value)}
          />
          <Input
            placeholder="Brand"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          />
          <select
            className="border rounded px-2 py-2"
            value={hasImages}
            onChange={(e) => setHasImages(e.target.value)}
          >
            <option value="">Images: Any</option>
            <option value="true">Has images</option>
            <option value="false">No images</option>
          </select>
          <Input
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <Input
            placeholder="State"
            value={state}
            onChange={(e) => setStateVal(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <Button onClick={load} disabled={loading}>
            {loading ? (
              <span className="inline-flex items-center">
                <LoadingSpinner />
                <span className="ml-2">Loading...</span>
              </span>
            ) : (
              "Apply Filters"
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setQ("");
              setStatus("");
              setPriority("");
              setDropoffType("");
              setDeviceType("");
              setBrand("");
              setHasImages("");
              setCity("");
              setStateVal("");
            }}
          >
            Reset
          </Button>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="px-4 py-2">Created</th>
                <th className="px-4 py-2">Customer</th>
                <th className="px-4 py-2">Device</th>
                <th className="px-4 py-2">Service</th>
                <th className="px-4 py-2">Location</th>
                <th className="px-4 py-2">Priority</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Images</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-4 py-2 whitespace-nowrap">
                    {new Date(r.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">
                    <div className="font-medium">{r.user?.name || "—"}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.user?.email}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    {r.device?.brand || ""} {r.device?.deviceType || ""}{" "}
                    {r.device?.model ? `(${r.device.model})` : ""}
                  </td>
                  <td className="px-4 py-2">{r.dropoffType || "—"}</td>
                  <td className="px-4 py-2">
                    {r.address?.city || ""}
                    {r.address?.state ? `, ${r.address.state}` : ""}
                  </td>
                  <td className="px-4 py-2">{r.priority}</td>
                  <td className="px-4 py-2">{r.status}</td>
                  <td className="px-4 py-2">{r.imagesCount}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingTicket(r)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update Ticket Status</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                New Status
                              </label>
                              <Select
                                value={editingTicket?.status || ""}
                                onValueChange={(value) =>
                                  setEditingTicket(
                                    editingTicket
                                      ? { ...editingTicket, status: value }
                                      : null
                                  )
                                }
                              >
                                <option value="OPEN">Open</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="PENDING">Pending</option>
                                <option value="CLOSED">Closed</option>
                              </Select>
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
                                  editingTicket &&
                                  handleStatusUpdate(
                                    editingTicket.id,
                                    editingTicket.status
                                  )
                                }
                              >
                                Update Status
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setEditingTicket(null);
                                  setNotes("");
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && !loading && (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-muted-foreground"
                    colSpan={9}
                  >
                    No tickets found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
