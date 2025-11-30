"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
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
} from "lucide-react";

interface WarrantyResult {
  status: string;
  provider: string;
  expiryDate?: string;
  deviceStatus?: string;
}

export default function WarrantyDeviceCheckPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment");

  const [formData, setFormData] = useState({
    brand: "",
    serialNumber: "",
    imei: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WarrantyResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (paymentId) {
      verifyPaymentAndCheck();
    }
  }, [paymentId]);

  const verifyPaymentAndCheck = async () => {
    if (!paymentId) return;

    setLoading(true);
    try {
      // Get payment details (public endpoint)
      const paymentRes = await fetch(`/api/public/payments/${paymentId}`);

      if (!paymentRes.ok) {
        throw new Error("Failed to fetch payment details");
      }

      const paymentResponse = await paymentRes.json();
      const paymentData = paymentResponse.data || paymentResponse;

      // Check if payment is already verified and paid
      if (paymentData.status !== "PAID") {
        // Verify payment
        const verifyRes = await fetch("/api/public/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference: paymentId }),
        });

        if (!verifyRes.ok) {
          throw new Error("Payment verification failed");
        }

        const verifyData = await verifyRes.json();

        if (
          verifyData.data?.status !== "success" &&
          verifyData.status !== "success"
        ) {
          throw new Error("Payment not successful");
        }
      }

      // Get metadata from payment
      const { brand, serialNumber, imei } = paymentData.metadata || {};

      if (!brand || !serialNumber) {
        throw new Error("Invalid payment metadata");
      }

      // Perform the check
      const checkRes = await fetch("/api/public/warranty-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand, serialNumber, imei }),
      });

      if (!checkRes.ok) {
        const errorData = await checkRes.json();
        throw new Error(errorData.error || "Check failed");
      }

      const checkData = await checkRes.json();
      setResult(checkData.data || checkData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.brand || (!formData.serialNumber && !formData.imei)) {
      setError("Please fill in the required fields");
      return;
    }

    // Use session email if available, otherwise require an email in the form
    const email = session?.user?.email || formData.email;
    if (!email) {
      setError("Please provide an email for payment receipt.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/public/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: 100, // ₦100
          email,
          provider: "paystack", // Default to paystack for now, can be made configurable
          metadata: {
            service: "warranty-check",
            ...formData,
          },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.error?.message || "Payment initialization failed"
        );
      }

      const data = await res.json();

      // Redirect to centralized checkout instead of directly to Paystack
      const params = new URLSearchParams({
        amount: "100",
        email,
        description: "Warranty & Device Status Check",
        metadata: JSON.stringify({
          service: "warranty-check",
          ...formData,
        }),
      });

      window.location.href = `/payment/checkout?${params.toString()}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  // Public page: allow usage without login

  if (result) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <section className="bg-linear-to-br from-orange-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              href="/services"
              className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Services
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold">
              Device Check Results
            </h1>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="p-6 sm:p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Check Complete</h2>
              <p className="text-muted-foreground">
                Here are the results for your device
              </p>
            </div>

            <div className="space-y-6">
              {/* Warranty Status */}
              <div className="p-6 border rounded-lg bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-start gap-4">
                  {result.status === "active" ? (
                    <CheckCircle className="h-8 w-8 text-green-600 shrink-0" />
                  ) : result.status === "expired" ? (
                    <XCircle className="h-8 w-8 text-red-600 shrink-0" />
                  ) : (
                    <AlertCircle className="h-8 w-8 text-yellow-600 shrink-0" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">
                      Warranty Status
                    </h3>
                    <p className="text-muted-foreground capitalize mb-2">
                      {result.status.replace("_", " ")}
                    </p>
                    {result.expiryDate && (
                      <p className="text-sm text-muted-foreground">
                        Expires:{" "}
                        {new Date(result.expiryDate).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">
                      Provider:{" "}
                      <span className="capitalize">{result.provider}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Device Status */}
              {result.deviceStatus && (
                <div className="p-6 border rounded-lg bg-gray-50 dark:bg-gray-900/50">
                  <div className="flex items-start gap-4">
                    {result.deviceStatus === "clean" ? (
                      <CheckCircle className="h-8 w-8 text-green-600 shrink-0" />
                    ) : (
                      <XCircle className="h-8 w-8 text-red-600 shrink-0" />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">
                        Device Status
                      </h3>
                      <p className="text-muted-foreground capitalize mb-2">
                        {result.deviceStatus}
                      </p>
                      {result.deviceStatus === "clean" ? (
                        <p className="text-sm text-green-600">
                          ✓ Device is not reported stolen or blacklisted
                        </p>
                      ) : (
                        <p className="text-sm text-red-600">
                          ⚠ This device may be reported stolen or blacklisted
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Info Box */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900 dark:text-blue-100">
                    <p className="font-semibold mb-1">
                      What do these results mean?
                    </p>
                    <ul className="space-y-1 text-blue-800 dark:text-blue-200">
                      <li>
                        • <strong>Active:</strong> Device is covered under
                        manufacturer warranty
                      </li>
                      <li>
                        • <strong>Expired:</strong> Warranty coverage has ended
                      </li>
                      <li>
                        • <strong>Clean:</strong> Device is not blacklisted or
                        reported stolen
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Link href="/services" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Back to Services
                  </Button>
                </Link>
                <Link href="/services/warranty-device-check" className="flex-1">
                  <Button className="w-full bg-orange-600 hover:bg-orange-700">
                    Check Another Device
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-linear-to-br from-orange-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/services"
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Services
          </Link>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 mb-4">
              <Shield className="h-8 w-8 text-orange-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Warranty & Device Status Check
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Check warranty status and device status for Apple and Dell devices
            </p>
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
              <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
                Service Fee: ₦100
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">What We Check</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Warranty status & expiry</li>
                  <li>• Device blacklist status</li>
                  <li>• IMEI validation</li>
                  <li>• Coverage details</li>
                </ul>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-start gap-3">
              <Smartphone className="h-6 w-6 text-blue-600 shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Supported Brands</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Apple </li>
                  <li>• Dell</li>
                  <li>• More brands coming soon</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* Form Card */}
        <Card className="p-6 sm:p-8">
          <h2 className="text-2xl font-bold mb-6">Enter Device Information</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Brand Selection */}
            <div className="space-y-2">
              <label htmlFor="brand" className="text-sm font-medium">
                Device Brand <span className="text-red-500">*</span>
              </label>
              <select
                id="brand"
                value={formData.brand}
                onChange={(e) =>
                  setFormData({ ...formData, brand: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                required
              >
                <option value="">Select a brand</option>
                <option value="apple">Apple</option>
                <option value="dell">Dell</option>
              </select>
            </div>

            {/* Email (shown if not logged in) */}
            {!session?.user?.email && (
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email <span className="text-red-500">*</span>
                </label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="you@example.com"
                  className="w-full"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  We'll send your receipt and results to this address.
                </p>
              </div>
            )}

            {/* Serial Number */}
            <div className="space-y-2">
              <label htmlFor="serialNumber" className="text-sm font-medium">
                Serial Number <span className="text-red-500">*</span>
              </label>
              <Input
                id="serialNumber"
                value={formData.serialNumber}
                onChange={(e) =>
                  setFormData({ ...formData, serialNumber: e.target.value })
                }
                placeholder="Enter device serial number"
                className="w-full"
                required
              />
              <p className="text-xs text-muted-foreground">
                Find your serial number in Settings or on the device label
              </p>
            </div>

            {/* IMEI (Optional) */}
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
                placeholder="Enter IMEI for device status check"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                IMEI is required for blacklist status check on mobile devices
              </p>
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
                  <p className="font-semibold mb-1">Secure Payment</p>
                  <p className="text-blue-800 dark:text-blue-200">
                    You'll be redirected to a secure payment page. After
                    successful payment, results will be displayed automatically.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || !formData.brand || !formData.serialNumber}
              className="w-full bg-orange-600 hover:bg-orange-700 h-12 text-base font-semibold"
            >
              {loading ? (
                <>
                  <LoadingSpinner />
                  <span className="ml-2">Processing...</span>
                </>
              ) : (
                `Pay ₦100 & Check Device`
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
