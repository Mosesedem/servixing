"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useSession } from "next-auth/react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Smartphone,
  ClipboardList,
  CreditCard,
  MessageSquare,
  Activity,
  Edit2,
  Save,
  X,
  Shield,
  Package,
} from "lucide-react";

interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  postalCode?: string;
  country: string;
  isDefault: boolean;
}

interface Device {
  id: string;
  deviceType: string;
  brand: string;
  model: string;
  serialNumber?: string;
  createdAt: string;
  workOrders: { id: string; status: string }[];
}

interface WorkOrder {
  id: string;
  status: string;
  issueDescription: string;
  createdAt: string;
  finalCost?: number;
  paymentStatus: string;
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
}

interface SupportTicket {
  id: string;
  title: string;
  status: string;
  createdAt: string;
}

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  createdAt: string;
}

interface UserData {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: string;
  createdAt: string;
  addresses: Address[];
  devices: Device[];
  workOrders: WorkOrder[];
  payments: Payment[];
  supportTickets: SupportTicket[];
  auditLogs: AuditLog[];
}

export default function UserDetails() {
  const { id } = useParams();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
  });
  const { data: session } = useSession();

  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";
  const isAdmin = session?.user?.role === "ADMIN";
  const canEdit = isSuperAdmin || isAdmin;
  const isOwner = session?.user?.id === id;

  useEffect(() => {
    if (id) fetchUser(id as string);
  }, [id]);

  const fetchUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setFormData({
          name: data.name || "",
          email: data.email,
          phone: data.phone || "",
          role: data.role,
        });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        fetchUser(id as string);
        setEditing(false);
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (
      statusLower.includes("completed") ||
      statusLower.includes("paid") ||
      statusLower.includes("closed")
    ) {
      return "bg-green-100 text-green-800 border-green-200";
    }
    if (statusLower.includes("pending") || statusLower.includes("open")) {
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
    if (statusLower.includes("cancelled") || statusLower.includes("failed")) {
      return "bg-red-100 text-red-800 border-red-200";
    }
    return "bg-blue-100 text-blue-800 border-blue-200";
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "ADMIN":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "TECHNICIAN":
        return "bg-cyan-100 text-cyan-800 border-cyan-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">User not found</p>
        </div>
      </div>
    );
  }

  if (!canEdit && !isOwner) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Access denied</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              User Profile
            </h1>
            <p className="text-gray-600">
              Manage user information and view activity
            </p>
          </div>
          {canEdit && !editing && (
            <Button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2"
            >
              <Edit2 className="h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {editing ? (
        <Card className="p-6 mb-6 shadow-md">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Edit2 className="h-5 w-5" />
            Edit User Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <Input
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <Input
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full"
              />
            </div>
            {canEdit && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value })
                  }
                  //       className="w-full"
                >
                  <option value="CUSTOMER">Customer</option>
                  <option value="TECHNICIAN">Technician</option>
                  <option value="ADMIN">Admin</option>
                  {isSuperAdmin && (
                    <option value="SUPER_ADMIN">Super Admin</option>
                  )}
                </Select>
              </div>
            )}
          </div>
          <div className="flex gap-3 mt-6">
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
            <Button
              variant="outline"
              onClick={() => setEditing(false)}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {/* Basic Info Card */}
          <Card className="p-6 mb-6 shadow-md">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium text-gray-900">
                    {user.name || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{user.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium text-gray-900">
                    {user.phone || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Role</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getRoleBadgeColor(
                      user.role
                    )}`}
                  >
                    {user.role.replace("_", " ")}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Member Since</p>
                  <p className="font-medium text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Addresses */}
          <Card className="p-6 mb-6 shadow-md">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Addresses
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({user.addresses.length})
              </span>
            </h2>
            {user.addresses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No addresses found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-semibold text-gray-900">
                        {addr.label}
                      </p>
                      {addr.isDefault && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full border border-blue-200">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm">
                      {addr.street}
                      <br />
                      {addr.city}, {addr.state} {addr.postalCode}
                      <br />
                      {addr.country}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Devices */}
          <Card className="p-6 mb-6 shadow-md">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-blue-600" />
              Devices
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({user.devices.length})
              </span>
            </h2>
            {user.devices.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Smartphone className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No devices found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {user.devices.map((device) => (
                  <div
                    key={device.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Package className="h-5 w-5 text-blue-600" />
                      <p className="font-semibold text-gray-900">
                        {device.brand} {device.model}
                      </p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-600">
                        <span className="font-medium">Type:</span>{" "}
                        {device.deviceType}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Serial:</span>{" "}
                        {device.serialNumber || "N/A"}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Work Orders:</span>{" "}
                        {device.workOrders.length}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Added:</span>{" "}
                        {new Date(device.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Work Orders */}
          <Card className="p-6 mb-6 shadow-md">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-blue-600" />
              Work Orders
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({user.workOrders.length})
              </span>
            </h2>
            {user.workOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ClipboardList className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No work orders found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {user.workOrders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            order.paymentStatus
                          )}`}
                        >
                          {order.paymentStatus}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-gray-900 mb-2">
                      {order.issueDescription}
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {order.finalCost
                        ? `₦${order.finalCost.toLocaleString()}`
                        : "Cost pending"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Payments */}
          <Card className="p-6 mb-6 shadow-md">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Payments
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({user.payments.length})
              </span>
            </h2>
            {user.payments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No payments found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {user.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-2xl font-bold text-gray-900">
                        ₦{payment.amount.toLocaleString()}
                      </p>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          payment.status
                        )}`}
                      >
                        {payment.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Support Tickets */}
          <Card className="p-6 mb-6 shadow-md">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              Support Tickets
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({user.supportTickets.length})
              </span>
            </h2>
            {user.supportTickets.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No support tickets found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {user.supportTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 mb-2">
                          {ticket.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          ticket.status
                        )}`}
                      >
                        {ticket.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Audit Logs */}
          <Card className="p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Recent Activity
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({user.auditLogs.length})
              </span>
            </h2>
            {user.auditLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No activity found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {user.auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="border-l-4 border-blue-500 pl-4 py-2 hover:bg-gray-50 transition-colors"
                  >
                    <p className="text-gray-900">
                      <span className="font-semibold">{log.action}</span> on{" "}
                      {log.entityType}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
