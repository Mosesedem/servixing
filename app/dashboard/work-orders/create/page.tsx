"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Loader2, Package2 } from "lucide-react";
import Link from "next/link";
import { createWorkOrderSchema } from "@/lib/schemas/work-order";
import { z } from "zod";

interface Device {
  id: string;
  brand: string;
  model: string;
  deviceType: string;
  images: string[];
}

export default function CreateWorkOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedDeviceId = searchParams.get("deviceId");

  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1); // Multi-step form

  const [formData, setFormData] = useState({
    deviceId: preselectedDeviceId || "",
    issueDescription: "",
    dropoffType: "DROPOFF" as "DROPOFF" | "DISPATCH",
    warrantyDecision: "skipped" as "requested" | "skipped" | "requested_paid",
    dispatchAddress: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "Nigeria",
    },
  });

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await fetch("/api/devices?limit=100");
      if (response.ok) {
        const result = await response.json();
        setDevices(result.data.devices);
      }
    } catch (error) {
      console.error("Error fetching devices:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      dispatchAddress: {
        ...prev.dispatchAddress,
        [name]: value,
      },
    }));
  };

  const handleNext = () => {
    // Validate current step
    if (step === 1 && !formData.deviceId) {
      setError("Please select a device");
      return;
    }
    if (step === 2 && formData.issueDescription.length < 10) {
      setError("Issue description must be at least 10 characters");
      return;
    }

    setError(null);
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Prepare data based on dropoff type
      const submitData: any = {
        deviceId: formData.deviceId,
        issueDescription: formData.issueDescription,
        dropoffType: formData.dropoffType,
        warrantyDecision: formData.warrantyDecision,
      };

      // Add dispatch address only if DISPATCH type
      if (formData.dropoffType === "DISPATCH") {
        submitData.dispatchAddress = formData.dispatchAddress;
      }

      // Validate with Zod schema
      const validatedData = createWorkOrderSchema.parse(submitData);

      const response = await fetch("/api/work-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create work order");
      }

      const result = await response.json();
      router.push(`/dashboard/work-orders/${result.data.workOrder.id}`);
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

  const selectedDevice = devices.find((d) => d.id === formData.deviceId);

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/work-orders"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Work Orders
        </Link>
        <h1 className="text-3xl font-bold">Create Work Order</h1>
        <p className="text-gray-600 mt-1">Request a repair for your device</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                  s === step
                    ? "border-orange-600 bg-orange-600 text-white"
                    : s < step
                    ? "border-orange-600 bg-orange-600 text-white"
                    : "border-gray-300 bg-white text-gray-400"
                }`}
              >
                {s}
              </div>
              {s < 4 && (
                <div
                  className={`flex-1 h-1 mx-2 transition-colors ${
                    s < step ? "bg-orange-600" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between max-w-2xl mx-auto mt-2 text-xs text-gray-600">
          <span>Select Device</span>
          <span>Describe Issue</span>
          <span>Service Type</span>
          <span>Review</span>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-2xl mx-auto">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
        {/* Step 1: Select Device */}
        {step === 1 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Select Your Device</h2>

            {devices.length === 0 ? (
              <div className="text-center py-12">
                <Package2 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">
                  No Devices Registered
                </h3>
                <p className="text-gray-600 mb-6">
                  You need to register a device before creating a work order
                </p>
                <Link href="/dashboard/devices/register">
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    Register Device
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {devices.map((device) => (
                  <label
                    key={device.id}
                    className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.deviceId === device.id
                        ? "border-orange-600 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="deviceId"
                      value={device.id}
                      checked={formData.deviceId === device.id}
                      onChange={handleChange}
                      className="w-5 h-5 text-orange-600"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">
                        {device.brand} {device.model}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {device.deviceType}
                      </p>
                    </div>
                    {device.images.length > 0 && (
                      <img
                        src={device.images[0]}
                        alt={device.model}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                  </label>
                ))}
              </div>
            )}

            <div className="flex justify-end mt-6">
              <Button
                type="button"
                onClick={handleNext}
                disabled={!formData.deviceId || devices.length === 0}
              >
                Next
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2: Describe Issue */}
        {step === 2 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Describe the Issue</h2>

            {selectedDevice && (
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-600">Device Selected:</p>
                <p className="font-semibold">
                  {selectedDevice.brand} {selectedDevice.model}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="issueDescription" className="text-sm font-medium">
                What's wrong with your device?{" "}
                <span className="text-red-500">*</span>
              </label>
              <textarea
                id="issueDescription"
                name="issueDescription"
                value={formData.issueDescription}
                onChange={handleChange}
                rows={8}
                maxLength={2000}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent resize-none"
                placeholder="Please describe the problem in detail. Include:&#10;- What happened?&#10;- When did it start?&#10;- What have you tried?&#10;- Any error messages?"
                required
              />
              <p className="text-xs text-gray-500 text-right">
                {formData.issueDescription.length}/2000
              </p>
            </div>

            <div className="flex justify-between mt-6">
              <Button type="button" variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button type="button" onClick={handleNext}>
                Next
              </Button>
            </div>
          </Card>
        )}

        {/* Step 3: Service Type */}
        {step === 3 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Service Options</h2>

            {/* Dropoff Type */}
            <div className="space-y-4 mb-6">
              <label className="text-sm font-medium">
                How would you like to deliver your device?{" "}
                <span className="text-red-500">*</span>
              </label>

              <label
                className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.dropoffType === "DROPOFF"
                    ? "border-orange-600 bg-orange-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="dropoffType"
                  value="DROPOFF"
                  checked={formData.dropoffType === "DROPOFF"}
                  onChange={handleChange}
                  className="mt-1 w-5 h-5 text-orange-600"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">Drop-off at Service Center</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Bring your device to our service center. No additional fees.
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.dropoffType === "DISPATCH"
                    ? "border-orange-600 bg-orange-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="dropoffType"
                  value="DISPATCH"
                  checked={formData.dropoffType === "DISPATCH"}
                  onChange={handleChange}
                  className="mt-1 w-5 h-5 text-orange-600"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">Dispatch Service</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    We'll pick up your device from your location. Additional
                    fee: ₦1,000
                  </p>
                </div>
              </label>
            </div>

            {/* Dispatch Address */}
            {formData.dropoffType === "DISPATCH" && (
              <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-sm">Pickup Address</h3>
                <div className="grid grid-cols-1 gap-4">
                  <Input
                    name="street"
                    placeholder="Street Address"
                    value={formData.dispatchAddress.street}
                    onChange={handleAddressChange}
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      name="city"
                      placeholder="City"
                      value={formData.dispatchAddress.city}
                      onChange={handleAddressChange}
                      required
                    />
                    <Input
                      name="state"
                      placeholder="State"
                      value={formData.dispatchAddress.state}
                      onChange={handleAddressChange}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      name="postalCode"
                      placeholder="Postal Code"
                      value={formData.dispatchAddress.postalCode}
                      onChange={handleAddressChange}
                      required
                    />
                    <Input
                      name="country"
                      placeholder="Country"
                      value={formData.dispatchAddress.country}
                      onChange={handleAddressChange}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Warranty Check */}
            <div className="space-y-4">
              <label className="text-sm font-medium">Warranty Check</label>

              <label
                className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.warrantyDecision === "skipped"
                    ? "border-orange-600 bg-orange-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="warrantyDecision"
                  value="skipped"
                  checked={formData.warrantyDecision === "skipped"}
                  onChange={handleChange}
                  className="mt-1 w-5 h-5 text-orange-600"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">Skip Warranty Check</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Proceed without warranty verification
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.warrantyDecision === "requested_paid"
                    ? "border-orange-600 bg-orange-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="warrantyDecision"
                  value="requested_paid"
                  checked={formData.warrantyDecision === "requested_paid"}
                  onChange={handleChange}
                  className="mt-1 w-5 h-5 text-orange-600"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">Request Warranty Check</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    We'll verify your warranty status. Fee: ₦500
                  </p>
                </div>
              </label>
            </div>

            <div className="flex justify-between mt-6">
              <Button type="button" variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button type="button" onClick={handleNext}>
                Next
              </Button>
            </div>
          </Card>
        )}

        {/* Step 4: Review & Submit */}
        {step === 4 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">
              Review Your Work Order
            </h2>

            <div className="space-y-6">
              {/* Device Info */}
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">
                  Device
                </h3>
                {selectedDevice && (
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    {selectedDevice.images.length > 0 && (
                      <img
                        src={selectedDevice.images[0]}
                        alt={selectedDevice.model}
                        className="w-20 h-20 object-cover rounded"
                      />
                    )}
                    <div>
                      <p className="font-semibold">
                        {selectedDevice.brand} {selectedDevice.model}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedDevice.deviceType}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Issue */}
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">
                  Issue Description
                </h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="whitespace-pre-wrap text-sm">
                    {formData.issueDescription}
                  </p>
                </div>
              </div>

              {/* Service Options */}
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">
                  Service Options
                </h3>
                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Delivery Method:</span>
                    <span className="font-semibold text-sm">
                      {formData.dropoffType === "DROPOFF"
                        ? "Drop-off"
                        : "Dispatch Service"}
                    </span>
                  </div>
                  {formData.dropoffType === "DISPATCH" && (
                    <div className="text-sm">
                      <p className="text-gray-600 mb-1">Pickup Address:</p>
                      <p>
                        {formData.dispatchAddress.street},{" "}
                        {formData.dispatchAddress.city},{" "}
                        {formData.dispatchAddress.state}{" "}
                        {formData.dispatchAddress.postalCode},{" "}
                        {formData.dispatchAddress.country}
                      </p>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm">Warranty Check:</span>
                    <span className="font-semibold text-sm">
                      {formData.warrantyDecision === "skipped"
                        ? "Skipped"
                        : "Requested (₦500)"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Total Fees */}
              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span>Dispatch Fee:</span>
                  <span className="font-semibold">
                    {formData.dropoffType === "DISPATCH" ? "₦1,000" : "₦0"}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Warranty Check:</span>
                  <span className="font-semibold">
                    {formData.warrantyDecision === "requested_paid"
                      ? "₦500"
                      : "₦0"}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span className="text-orange-600">
                    ₦
                    {(formData.dropoffType === "DISPATCH" ? 1000 : 0) +
                      (formData.warrantyDecision === "requested_paid"
                        ? 500
                        : 0)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  * Repair costs will be estimated after device inspection
                </p>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <Button type="button" variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Work Order"
                )}
              </Button>
            </div>
          </Card>
        )}
      </form>
    </div>
  );
}
