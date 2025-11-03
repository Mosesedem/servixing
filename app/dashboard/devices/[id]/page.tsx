"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/image-upload";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Save,
  X,
  Calendar,
  Tag,
  Hash,
  FileText,
  Package,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Wrench,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { updateDeviceSchema } from "@/lib/schemas/device";
import { z } from "zod";

interface Device {
  id: string;
  brand: string;
  model: string;
  deviceType: string;
  color?: string;
  serialNumber?: string;
  imei?: string;
  description?: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

interface WorkOrder {
  id: string;
  status: string;
  issueDescription: string;
  paymentStatus: string;
  estimatedCost?: number;
  finalCost?: number;
  createdAt: string;
  updatedAt: string;
}

const DEVICE_TYPES = [
  "Smartphone",
  "Tablet",
  "Laptop",
  "Desktop",
  "Smartwatch",
  "Gaming Console",
  "TV",
  "Other",
];

const BRANDS = [
  "Apple",
  "Samsung",
  "Google",
  "Huawei",
  "Xiaomi",
  "OnePlus",
  "Sony",
  "LG",
  "Dell",
  "HP",
  "Lenovo",
  "Asus",
  "Microsoft",
  "Other",
];

export default function DeviceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const deviceId = params.id as string;

  const [device, setDevice] = useState<Device | null>(null);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [workOrdersLoading, setWorkOrdersLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [formData, setFormData] = useState({
    deviceType: "",
    brand: "",
    model: "",
    serialNumber: "",
    imei: "",
    color: "",
    description: "",
    newImages: [] as File[],
  });

  useEffect(() => {
    fetchDevice();
    fetchWorkOrders();
  }, [deviceId]);

  const fetchDevice = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/devices/${deviceId}`);
      if (response.ok) {
        const result = await response.json();
        const deviceData = result.data;
        setDevice(deviceData);
        setFormData({
          deviceType: deviceData.deviceType,
          brand: deviceData.brand,
          model: deviceData.model,
          serialNumber: deviceData.serialNumber || "",
          imei: deviceData.imei || "",
          color: deviceData.color || "",
          description: deviceData.description || "",
          newImages: [],
        });
      } else {
        setError("Device not found");
      }
    } catch (err) {
      setError("Failed to load device");
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkOrders = async () => {
    setWorkOrdersLoading(true);
    try {
      const response = await fetch(`/api/work-orders?deviceId=${deviceId}`);
      if (response.ok) {
        const result = await response.json();
        setWorkOrders(result.data || []);
      }
    } catch (err) {
      console.error("Failed to load work orders:", err);
    } finally {
      setWorkOrdersLoading(false);
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
        return <Clock className="h-4 w-4" />;
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
      default:
        return "text-gray-600";
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      // Upload new images if any
      let newImageUrls: string[] = [];
      if (formData.newImages.length > 0) {
        const uploadFormData = new FormData();
        formData.newImages.forEach((file) => {
          uploadFormData.append("images", file);
        });

        const uploadResponse = await fetch("/api/devices/upload", {
          method: "POST",
          body: uploadFormData,
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          newImageUrls = uploadData.data.urls;
        }
      }

      // Combine existing and new images
      const allImages = [...(device?.images || []), ...newImageUrls];

      // Validate and update device
      const updateData = updateDeviceSchema.parse({
        deviceType: formData.deviceType,
        brand: formData.brand,
        model: formData.model,
        serialNumber: formData.serialNumber || undefined,
        imei: formData.imei || undefined,
        color: formData.color || undefined,
        description: formData.description || undefined,
        images: allImages,
      });

      const response = await fetch(`/api/devices/${deviceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const result = await response.json();
        setDevice(result.data);
        setEditMode(false);
        setFormData((prev) => ({ ...prev, newImages: [] }));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update device");
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this device? This action cannot be undone and will fail if the device has active work orders."
      )
    ) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/devices/${deviceId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/dashboard/devices");
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to delete device");
      }
    } catch (err) {
      alert("An error occurred while deleting the device");
    } finally {
      setDeleting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const nextImage = () => {
    if (device && device.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % device.images.length);
    }
  };

  const prevImage = () => {
    if (device && device.images.length > 0) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + device.images.length) % device.images.length
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent mb-4"></div>
          <p className="text-gray-600">Loading device...</p>
        </div>
      </div>
    );
  }

  if (error && !device) {
    return (
      <div className="text-center py-12">
        <Smartphone className="h-16 w-16 mx-auto mb-4 text-gray-400" />
        <h2 className="text-2xl font-semibold mb-2">Device Not Found</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <Link href="/dashboard/devices">
          <Button>Back to Devices</Button>
        </Link>
      </div>
    );
  }

  if (!device) return null;

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/devices"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Devices
        </Link>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">
              {device.brand} {device.model}
            </h1>
            <p className="text-gray-600 mt-1">{device.deviceType}</p>
          </div>

          {!editMode ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditMode(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={deleting}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEditMode(false);
                  setError(null);
                  fetchDevice();
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Images */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Images</h2>
            {device.images.length > 0 ? (
              <div className="space-y-4">
                {/* Main Image */}
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
                  <Image
                    src={device.images[currentImageIndex]}
                    alt={`${device.brand} ${device.model}`}
                    fill
                    className="object-contain"
                  />

                  {device.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 text-white text-sm px-3 py-1 rounded">
                        {currentImageIndex + 1} / {device.images.length}
                      </div>
                    </>
                  )}
                </div>

                {/* Thumbnail Grid */}
                {device.images.length > 1 && (
                  <div className="grid grid-cols-5 gap-2">
                    {device.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          index === currentImageIndex
                            ? "border-orange-600 ring-2 ring-orange-600 ring-offset-2"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="relative w-full h-full">
                          <Image
                            src={image}
                            alt={`Thumbnail ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Smartphone className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-600">No images available</p>
                </div>
              </div>
            )}

            {/* Add Images in Edit Mode */}
            {editMode && (
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-4">Add More Images</h3>
                <ImageUpload
                  value={formData.newImages}
                  onChange={(files) =>
                    setFormData((prev) => ({ ...prev, newImages: files }))
                  }
                  maxFiles={10 - device.images.length}
                  maxSize={5}
                  disabled={saving}
                />
              </div>
            )}
          </Card>

          {/* Description */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            {editMode ? (
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={6}
                maxLength={1000}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                placeholder="Add a description for this device..."
              />
            ) : (
              <p className="text-gray-700 whitespace-pre-wrap">
                {device.description || "No description provided"}
              </p>
            )}
          </Card>
        </div>

        {/* Right Column - Details */}
        <div className="space-y-6">
          {/* Device Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Device Information</h2>
            <div className="space-y-4">
              {/* Device Type */}
              <div>
                <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Device Type
                </label>
                {editMode ? (
                  <select
                    name="deviceType"
                    value={formData.deviceType}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {DEVICE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="mt-1 font-medium">{device.deviceType}</p>
                )}
              </div>

              {/* Brand */}
              <div>
                <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Brand
                </label>
                {editMode ? (
                  <select
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {BRANDS.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="mt-1 font-medium">{device.brand}</p>
                )}
              </div>

              {/* Model */}
              <div>
                <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Model
                </label>
                {editMode ? (
                  <Input
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 font-medium">{device.model}</p>
                )}
              </div>

              {/* Color */}
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Color
                </label>
                {editMode ? (
                  <Input
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="mt-1"
                    placeholder="e.g., Space Gray"
                  />
                ) : (
                  <p className="mt-1 font-medium">
                    {device.color || "Not specified"}
                  </p>
                )}
              </div>

              {/* Serial Number */}
              <div>
                <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Serial Number
                </label>
                {editMode ? (
                  <Input
                    name="serialNumber"
                    value={formData.serialNumber}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 font-medium font-mono text-sm">
                    {device.serialNumber || "Not specified"}
                  </p>
                )}
              </div>

              {/* IMEI */}
              <div>
                <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  IMEI
                </label>
                {editMode ? (
                  <Input
                    name="imei"
                    value={formData.imei}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 font-medium font-mono text-sm">
                    {device.imei || "Not specified"}
                  </p>
                )}
              </div>

              {/* Dates */}
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span>Registered:</span>
                  <span className="font-medium">
                    {new Date(device.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText className="h-4 w-4" />
                  <span>Last Updated:</span>
                  <span className="font-medium">
                    {new Date(device.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Work Order History */}
      <div className="mt-8">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Work Order History</h2>
            <Link href={`/dashboard/work-orders/create?deviceId=${deviceId}`}>
              <Button>
                <Wrench className="h-4 w-4 mr-2" />
                Create Work Order
              </Button>
            </Link>
          </div>

          {workOrdersLoading ? (
            <div className="text-center py-8">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-current border-r-transparent mb-2"></div>
              <p className="text-gray-600">Loading work orders...</p>
            </div>
          ) : workOrders.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Wrench className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-600 mb-4">
                No work orders found for this device
              </p>
              <Link href={`/dashboard/work-orders/create?deviceId=${deviceId}`}>
                <Button variant="outline">Create First Work Order</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {workOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/dashboard/work-orders/${order.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-orange-600 hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <p className="font-semibold text-lg mb-1 line-clamp-2">
                        {order.issueDescription}
                      </p>
                      <p className="text-sm text-gray-600">
                        Order ID: {order.id.slice(0, 12)}...
                      </p>
                    </div>
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border text-sm font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(order.status)}
                      <span>
                        {order.status
                          .split("_")
                          .map(
                            (word) =>
                              word.charAt(0) + word.slice(1).toLowerCase()
                          )
                          .join(" ")}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex gap-6 text-sm">
                      <div>
                        <span className="text-gray-600">Payment: </span>
                        <span
                          className={`font-semibold capitalize ${getPaymentStatusColor(
                            order.paymentStatus
                          )}`}
                        >
                          {order.paymentStatus}
                        </span>
                      </div>
                      {(order.finalCost || order.estimatedCost) && (
                        <div>
                          <span className="text-gray-600">Cost: </span>
                          <span className="font-semibold">
                            ₦
                            {(order.finalCost ||
                              order.estimatedCost)!.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
