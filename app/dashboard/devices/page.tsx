"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Trash2,
  Smartphone,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

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
}

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleting, setDeleting] = useState<string | null>(null);

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

  useEffect(() => {
    fetchDevices();
  }, [searchTerm, selectedType, selectedBrand, currentPage]);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
      });

      if (searchTerm) params.append("search", searchTerm);
      if (selectedType) params.append("deviceType", selectedType);
      if (selectedBrand) params.append("brand", selectedBrand);

      const response = await fetch(`/api/devices?${params}`);
      if (response.ok) {
        const result = await response.json();
        setDevices(result.data.devices);
        setTotalPages(result.data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Error fetching devices:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this device? This action cannot be undone."
      )
    )
      return;

    setDeleting(id);
    try {
      const response = await fetch(`/api/devices/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setDevices(devices.filter((d) => d.id !== id));
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete device");
      }
    } catch (error) {
      console.error("Error deleting device:", error);
      alert("An error occurred while deleting the device");
    } finally {
      setDeleting(null);
    }
  };

  const uniqueBrands = Array.from(new Set(devices.map((d) => d.brand))).sort();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Devices</h1>
          <p className="text-gray-600 mt-1">Manage your registered devices</p>
        </div>
        <Link href="/dashboard/devices/register">
          <Button className="bg-orange-600 hover:bg-orange-700 gap-2">
            <Plus className="h-4 w-4" />
            Register Device
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by brand, model..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>

          {/* Device Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">All Device Types</option>
            {DEVICE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          {/* Brand Filter */}
          <select
            value={selectedBrand}
            onChange={(e) => {
              setSelectedBrand(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">All Brands</option>
            {uniqueBrands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>

        {/* Active Filters */}
        {(searchTerm || selectedType || selectedBrand) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                Search: {searchTerm}
              </span>
            )}
            {selectedType && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                Type: {selectedType}
              </span>
            )}
            {selectedBrand && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                Brand: {selectedBrand}
              </span>
            )}
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedType("");
                setSelectedBrand("");
                setCurrentPage(1);
              }}
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              Clear all
            </button>
          </div>
        )}
      </Card>

      {/* Device List */}
      {loading ? (
        <div className="text-center text-gray-600 py-12">
          Loading devices...
        </div>
      ) : devices.length === 0 ? (
        <Card className="p-12 text-center">
          <Smartphone className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">No devices found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || selectedType || selectedBrand
              ? "Try adjusting your filters"
              : "You haven't registered any devices yet"}
          </p>
          <Link href="/dashboard/devices/register">
            <Button className="bg-orange-600 hover:bg-orange-700">
              Register Your First Device
            </Button>
          </Link>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {devices.map((device) => (
              <Card
                key={device.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Device Image */}
                <div className="aspect-video bg-gray-100 relative">
                  {device.images.length > 0 ? (
                    <Image
                      src={device.images[0]}
                      alt={`${device.brand} ${device.model}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Smartphone className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  {device.images.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      +{device.images.length - 1} more
                    </div>
                  )}
                </div>

                {/* Device Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1">
                    {device.brand} {device.model}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {device.deviceType}
                    {device.color && ` • ${device.color}`}
                  </p>

                  {device.serialNumber && (
                    <p className="text-xs text-gray-500 mb-1">
                      S/N: {device.serialNumber}
                    </p>
                  )}
                  {device.imei && (
                    <p className="text-xs text-gray-500 mb-1">
                      IMEI: {device.imei}
                    </p>
                  )}

                  <p className="text-xs text-gray-500 mt-3">
                    Registered:{" "}
                    {new Date(device.createdAt).toLocaleDateString()}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <Link
                      href={`/dashboard/devices/${device.id}`}
                      className="flex-1"
                    >
                      <Button variant="outline" className="w-full gap-2">
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      onClick={() => handleDelete(device.id)}
                      disabled={deleting === device.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
