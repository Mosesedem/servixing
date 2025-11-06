"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { createDeviceSchema } from "@/lib/schemas/device";
import { z } from "zod";

// Common device types
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

// Common brands
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

type FormData = {
  deviceType: string;
  brand: string;
  model: string;
  serialNumber: string;
  imei: string;
  color: string;
  description: string;
  images: File[];
};

export default function RegisterDevicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    deviceType: "",
    brand: "",
    model: "",
    serialNumber: "",
    imei: "",
    color: "",
    description: "",
    images: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Upload images first
      let imageUrls: string[] = [];

      if (formData.images.length > 0) {
        const uploadFormData = new FormData();
        formData.images.forEach((file) => {
          uploadFormData.append("images", file);
        });

        const uploadResponse = await fetch("/api/devices/upload", {
          method: "POST",
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || "Failed to upload images");
        }

        const uploadData = await uploadResponse.json();
        // Our upload endpoint returns { data: { images: string[] } }
        imageUrls = uploadData?.data?.images || [];
      }

      // Validate device data
      const deviceData = createDeviceSchema.parse({
        deviceType: formData.deviceType,
        brand: formData.brand,
        model: formData.model,
        serialNumber: formData.serialNumber || undefined,
        imei: formData.imei || undefined,
        color: formData.color || undefined,
        description: formData.description || undefined,
        images: imageUrls,
      });

      // Create device
      const response = await fetch("/api/devices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(deviceData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to register device");
      }

      const result = await response.json();
      // API returns { data: { device: { id, ... } } }
      const newId = result?.data?.device?.id || result?.data?.id;
      if (!newId) throw new Error("Device created but ID missing in response");
      router.push(`/dashboard/devices/${newId}`);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
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

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/devices"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Devices
        </Link>
        <h1 className="text-3xl font-bold">Register New Device</h1>
        <p className="text-gray-600 mt-2">
          Add your device to track repairs and warranty information
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Device Information */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Device Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Device Type */}
            <div className="space-y-2">
              <label htmlFor="deviceType" className="text-sm font-medium">
                Device Type <span className="text-red-500">*</span>
              </label>
              <select
                id="deviceType"
                name="deviceType"
                value={formData.deviceType}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select device type</option>
                {DEVICE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand */}
            <div className="space-y-2">
              <label htmlFor="brand" className="text-sm font-medium">
                Brand <span className="text-red-500">*</span>
              </label>
              <select
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select brand</option>
                {BRANDS.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            {/* Model */}
            <div className="space-y-2">
              <label htmlFor="model" className="text-sm font-medium">
                Model <span className="text-red-500">*</span>
              </label>
              <Input
                id="model"
                name="model"
                type="text"
                value={formData.model}
                onChange={handleInputChange}
                required
                placeholder="e.g., iPhone 15 Pro"
              />
            </div>

            {/* Color */}
            <div className="space-y-2">
              <label htmlFor="color" className="text-sm font-medium">
                Color
              </label>
              <Input
                id="color"
                name="color"
                type="text"
                value={formData.color}
                onChange={handleInputChange}
                placeholder="e.g., Space Gray"
              />
            </div>

            {/* Serial Number */}
            <div className="space-y-2">
              <label htmlFor="serialNumber" className="text-sm font-medium">
                Serial Number
              </label>
              <Input
                id="serialNumber"
                name="serialNumber"
                type="text"
                value={formData.serialNumber}
                onChange={handleInputChange}
                placeholder="e.g., C02ABC123DEF"
              />
            </div>

            {/* IMEI */}
            <div className="space-y-2">
              <label htmlFor="imei" className="text-sm font-medium">
                IMEI
              </label>
              <Input
                id="imei"
                name="imei"
                type="text"
                value={formData.imei}
                onChange={handleInputChange}
                placeholder="e.g., 123456789012345"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2 mt-6">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              maxLength={1000}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              placeholder="Additional notes about your device (optional)"
            />
            <p className="text-xs text-gray-500 text-right">
              {formData.description.length}/1000
            </p>
          </div>
        </Card>

        {/* Device Images */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Device Images</h2>
          <ImageUpload
            value={formData.images}
            onChange={(files) =>
              setFormData((prev) => ({ ...prev, images: files }))
            }
            maxFiles={10}
            maxSize={5}
            disabled={loading}
          />
          <p className="text-sm text-gray-500 mt-4">
            Upload clear images of your device to help with identification and
            repair tracking
          </p>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              "Register Device"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
