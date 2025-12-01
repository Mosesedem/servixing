"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/loading-spinner";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Shield,
  Smartphone,
  ArrowLeft,
  Info,
  Search,
} from "lucide-react";

interface WarrantyResult {
  status: string;
  provider: string;
  warrantyStatus?: string;
  warrantyExpiry?: string;
  deviceStatus?: string;
  paymentStatus?: string;
  errorMessage?: string;
}

export default function WarrantyDeviceCheckStatusPage() {
  const [formData, setFormData] = useState({
    email: "",
    serialNumber: "",
    imei: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WarrantyResult | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email && !formData.serialNumber && !formData.imei) {
      setError("Please provide at least one search criteria");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/public/warranty-check/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Check failed");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return <CheckCircle className="h-8 w-8 text-green-600" />;
      case "FAILED":
        return <XCircle className="h-8 w-8 text-red-600" />;
      case "IN_PROGRESS":
        return <LoadingSpinner />;
      default:
        return <AlertCircle className="h-8 w-8 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "text-green-600";
      case "FAILED":
        return "text-red-600";
      case "IN_PROGRESS":
        return "text-blue-600";
      default:
        return "text-yellow-600";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-linear-to-br from-orange-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/services/warranty-device-check"
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Device Check
          </Link>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 mb-4">
              <Shield className="h-8 w-8 text-orange-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Check Device Status
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Enter your details to check the status of your warranty and device
              check
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Form Card */}
        <Card className="p-6 sm:p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Check Your Device Status</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email (Optional)
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Enter your email address"
                className="w-full"
              />
            </div>

            {/* Serial Number */}
            <div className="space-y-2">
              <label htmlFor="serialNumber" className="text-sm font-medium">
                Serial Number (Optional)
              </label>
              <Input
                id="serialNumber"
                value={formData.serialNumber}
                onChange={(e) =>
                  setFormData({ ...formData, serialNumber: e.target.value })
                }
                placeholder="Enter device serial number"
                className="w-full"
              />
            </div>

            {/* IMEI */}
            <div className="space-y-2">
              <label htmlFor="imei" className="text-sm font-medium">
                IMEI (Optional)
              </label>
              <Input
                id="imei"
                value={formData.imei}
                onChange={(e) =>
                  setFormData({ ...formData, imei: e.target.value })
                }
                placeholder="Enter IMEI"
                className="w-full"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800 dark:text-red-200">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900 dark:text-blue-100">
                  <p className="font-semibold mb-1">Status Check</p>
                  <p className="text-blue-800 dark:text-blue-200">
                    Provide at least one piece of information to check your
                    device status.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={
                loading ||
                (!formData.email && !formData.serialNumber && !formData.imei)
              }
              className="w-full bg-orange-600 hover:bg-orange-700 h-12 text-base font-semibold"
            >
              {loading ? (
                <>
                  <LoadingSpinner />
                  <span className="ml-2">Checking...</span>
                </>
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  Check Status
                </>
              )}
            </Button>
          </form>
        </Card>

        {/* Results */}
        {result && (
          <Card className="p-6 sm:p-8">
            <div className="text-center mb-6">
              {getStatusIcon(result.status)}
              <h2 className="text-2xl font-bold mt-4 mb-2">Check Results</h2>
              <p className={`text-lg ${getStatusColor(result.status)}`}>
                {result.status === "SUCCESS"
                  ? "Check Completed"
                  : result.status === "IN_PROGRESS"
                  ? "Check In Progress"
                  : result.status === "FAILED"
                  ? "Check Failed"
                  : "Manual Review Required"}
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Provider
                  </p>
                  <p className="capitalize">{result.provider}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Payment Status
                  </p>
                  <p
                    className={
                      result.paymentStatus === "PAID"
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {result.paymentStatus || "Unknown"}
                  </p>
                </div>
              </div>

              {result.status === "SUCCESS" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Warranty Status
                      </p>
                      <p>{result.warrantyStatus || "Not available"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Device Status
                      </p>
                      <p>{result.deviceStatus || "Not available"}</p>
                    </div>
                    {result.warrantyExpiry && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Warranty Expiry
                        </p>
                        <p>
                          {new Date(result.warrantyExpiry).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {result.status === "FAILED" && result.errorMessage && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    {result.errorMessage}
                  </p>
                </div>
              )}

              {result.status === "IN_PROGRESS" && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Your check is still processing. Please check back later.
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
