"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/image-upload";
import { LoadingSpinner } from "@/components/loading-spinner";
import {
  ArrowLeft,
  CheckCircle,
  Shield,
  Clock,
  Info,
  AlertCircle,
} from "lucide-react";

export default function BookRepairPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [images, setImages] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    phone: "",
    deviceType: "",
    brand: "",
    model: "",
    issue: "",
    dropoffType: "DROPOFF" as "DROPOFF" | "DISPATCH",
    // Structured address fields for better detail
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    landmark: "",
    // Optional extra request from customer
    customerRequest: "",
    // Honeypot (spam protection)
    hp: "",
  });

  const deviceTypes = [
    "Smartphone",
    "Laptop",
    "Tablet",
    "Desktop",
    "Monitor",
    "Smartwatch",
    "Other",
  ];

  const brands = [
    "Apple",
    "Samsung",
    "Dell",
    "HP",
    "Lenovo",
    "Asus",
    "Acer",
    "Microsoft",
    "Google",
    "OnePlus",
    "Xiaomi",
    "Huawei",
    "Sony",
    "LG",
    "Other",
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate required fields
      if (
        !formData.name ||
        !formData.email ||
        !formData.phone ||
        !formData.deviceType ||
        !formData.brand ||
        !formData.issue
      ) {
        setError("Please fill in all required fields");
        setLoading(false);
        return;
      }

      // If dispatch, validate structured address fields
      if (formData.dropoffType === "DISPATCH") {
        if (!formData.addressLine1 || !formData.city || !formData.state) {
          setError(
            "Please provide address line 1, city, and state for dispatch"
          );
          setLoading(false);
          return;
        }
      }

      // Validate images count and size (client-side)
      if (images.length > 3) {
        setError("Maximum 3 images allowed");
        setLoading(false);
        return;
      }
      for (const file of images) {
        if (file.size > 5 * 1024 * 1024) {
          setError("Each image must be 5MB or smaller");
          setLoading(false);
          return;
        }
      }

      // Build full address string if dispatch
      const addressText =
        formData.dropoffType === "DISPATCH"
          ? [
              formData.addressLine1,
              formData.addressLine2,
              `${formData.city}${formData.state ? ", " + formData.state : ""}`,
              formData.postalCode,
              formData.landmark ? `Landmark: ${formData.landmark}` : "",
            ]
              .filter(Boolean)
              .join("\n")
          : "Drop-off at service center";

      // Authenticated vs Guest submission flows
      let imageUrls: string[] = [];
      if (session?.user?.id) {
        // Logged-in: upload images first, then create ticket
        if (images.length > 0) {
          const fd = new FormData();
          images.forEach((file) => fd.append("images", file));
          const uploadRes = await fetch("/api/devices/upload", {
            method: "POST",
            body: fd,
          });
          if (!uploadRes.ok) {
            const data = await uploadRes.json().catch(() => ({}));
            throw new Error(
              data?.error?.message ||
                "Failed to upload images. Please try again."
            );
          }
          const uploadData = await uploadRes.json();
          imageUrls = uploadData?.data?.images || [];
        }

        // Create support ticket for the repair request
        const ticketResponse = await fetch("/api/support/tickets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: `Repair Request: ${formData.brand} ${formData.deviceType}`,
            description: `
**Customer Details:**
- Name: ${formData.name}
- Email: ${formData.email}
- Phone: ${formData.phone}

**Device Information:**
- Type: ${formData.deviceType}
- Brand: ${formData.brand}
- Model: ${formData.model || "Not specified"}

**Issue Description:**
${formData.issue}

**Service Type:**
${
  formData.dropoffType === "DROPOFF"
    ? "Drop-off at service center"
    : `Dispatch pickup at:\n${addressText}`
}

${
  formData.customerRequest
    ? `\n**Customer Request (Optional):**\n${formData.customerRequest}`
    : ""
}

${
  imageUrls.length
    ? `\n**Attached Images:**\n${imageUrls
        .map((u, i) => `![Image ${i + 1}](${u})`)
        .join("\n")}`
    : ""
}
            `,
            priority: "normal",
            metadata: {
              contact: {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
              },
              device: {
                deviceType: formData.deviceType,
                brand: formData.brand,
                model: formData.model || null,
              },
              issue: formData.issue,
              dropoffType: formData.dropoffType,
              address:
                formData.dropoffType === "DISPATCH"
                  ? {
                      addressLine1: formData.addressLine1,
                      addressLine2: formData.addressLine2,
                      city: formData.city,
                      state: formData.state,
                      postalCode: formData.postalCode,
                      landmark: formData.landmark,
                    }
                  : null,
              customerRequest: formData.customerRequest || null,
              images: imageUrls,
              submittedAt: new Date().toISOString(),
              source: "authenticated_form",
            },
          }),
        });

        if (!ticketResponse.ok) {
          const data = await ticketResponse.json();
          throw new Error(data.error || "Failed to submit repair request");
        }

        const createdTicket = await ticketResponse.json();

        // If images exist, add them as TicketMessage attachments for better rendering
        if (imageUrls.length && createdTicket?.id) {
          try {
            await fetch(`/api/support/tickets/${createdTicket.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                message: "Images attached with repair request.",
                attachments: imageUrls,
              }),
            });
          } catch (e) {
            console.error(
              "Failed to add image attachments to ticket message",
              e
            );
          }
        }

        setSuccess(true);
      } else {
        // Guest: submit everything to public endpoint as multipart form
        const fd = new FormData();
        fd.set("name", formData.name);
        fd.set("email", formData.email);
        fd.set("phone", formData.phone);
        fd.set("deviceType", formData.deviceType);
        fd.set("hp", (formData as any).hp || "");
        fd.set("brand", formData.brand);
        fd.set("model", formData.model || "");
        fd.set("issue", formData.issue);
        fd.set("dropoffType", formData.dropoffType);
        if (formData.dropoffType === "DISPATCH") {
          fd.set("addressLine1", formData.addressLine1);
          fd.set("addressLine2", formData.addressLine2 || "");
          fd.set("city", formData.city);
          fd.set("state", formData.state);
          fd.set("postalCode", formData.postalCode || "");
          fd.set("landmark", formData.landmark || "");
        }
        if (formData.customerRequest) {
          fd.set("customerRequest", formData.customerRequest);
        }
        images.forEach((file) => fd.append("images", file));

        const resp = await fetch("/api/public/repair-request", {
          method: "POST",
          body: fd,
        });
        if (!resp.ok) {
          const data = await resp.json().catch(() => ({}));
          throw new Error(
            data?.error?.message || "Failed to submit repair request"
          );
        }
        setSuccess(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  if (success) {
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
              Request Submitted
            </h1>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4">
              Repair Request Received!
            </h2>
            <p className="text-muted-foreground mb-6">
              Thank you for choosing Servixing. We've received your repair
              request and will contact you shortly with a quote and next steps.
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900 dark:text-blue-100 text-left">
                  <p className="font-semibold mb-1">What's next?</p>
                  <ul className="space-y-1 text-blue-800 dark:text-blue-200">
                    <li>
                      • We'll email you at <strong>{formData.email}</strong>{" "}
                      within 2 hours
                    </li>
                    <li>• You'll receive a detailed quote and timeline</li>
                    <li>• No payment required until you approve the quote</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/services">
                <Button variant="outline">Back to Services</Button>
              </Link>
              <Link href="/">
                <Button className="bg-orange-600 hover:bg-orange-700">
                  Go to Homepage
                </Button>
              </Link>
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
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Book a Repair
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get your device repaired by our expert technicians. No account
              required.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Trust Indicators */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 text-center">
            <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-600" />
            <h3 className="font-semibold mb-2">Free Diagnostics</h3>
            <p className="text-sm text-muted-foreground">
              We'll assess your device at no charge before any repair
            </p>
          </Card>
          <Card className="p-6 text-center">
            <Clock className="h-12 w-12 mx-auto mb-3 text-blue-600" />
            <h3 className="font-semibold mb-2">Fast Turnaround</h3>
            <p className="text-sm text-muted-foreground">
              Most repairs completed same-day or within 24-48 hours
            </p>
          </Card>
          <Card className="p-6 text-center">
            <Shield className="h-12 w-12 mx-auto mb-3 text-orange-600" />
            <h3 className="font-semibold mb-2">90-Day Warranty</h3>
            <p className="text-sm text-muted-foreground">
              All repairs backed by our comprehensive warranty
            </p>
          </Card>
        </div>

        {/* Form Card */}
        <Card className="p-6 sm:p-8">
          <h2 className="text-2xl font-bold mb-6">Repair Request Details</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 dark:text-red-200">
                  {error}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Honeypot field */}
            <input
              type="text"
              name="hp"
              value={(formData as any).hp}
              onChange={handleChange}
              className="hidden"
              aria-hidden="true"
              tabIndex={-1}
              autoComplete="off"
            />
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Contact Information</h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+234 800 000 0000"
                    required
                  />
                </div>
              </div>

              {!session?.user?.email && (
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    We'll send updates and quotes to this email
                  </p>
                </div>
              )}
            </div>

            {/* Device Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Device Information</h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="deviceType" className="text-sm font-medium">
                    Device Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="deviceType"
                    name="deviceType"
                    value={formData.deviceType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                    required
                  >
                    <option value="">Select device type</option>
                    {deviceTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="brand" className="text-sm font-medium">
                    Brand <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                    required
                  >
                    <option value="">Select brand</option>
                    {brands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="model" className="text-sm font-medium">
                  Model (Optional)
                </label>
                <Input
                  id="model"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="e.g., iPhone 13 Pro, MacBook Air M2, Galaxy S23"
                />
              </div>
            </div>

            {/* Issue Description */}
            <div className="space-y-2">
              <label htmlFor="issue" className="text-sm font-medium">
                Issue Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="issue"
                name="issue"
                value={formData.issue}
                onChange={handleChange}
                placeholder="Please describe the problem with your device in detail..."
                rows={6}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                required
              />
              <p className="text-xs text-muted-foreground">
                Include any error messages, symptoms, or relevant details
              </p>
            </div>

            {/* Images */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Device Images (up to 3, 5MB each)
              </label>
              <ImageUpload
                value={images}
                onChange={setImages}
                maxFiles={3}
                maxSize={5}
                disabled={loading}
              />
            </div>

            {/* Service Type */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Service Type</h3>

              <div className="grid md:grid-cols-2 gap-4">
                <label
                  className={`relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    formData.dropoffType === "DROPOFF"
                      ? "border-orange-600 bg-orange-50 dark:bg-orange-900/20"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="dropoffType"
                    value="DROPOFF"
                    checked={formData.dropoffType === "DROPOFF"}
                    onChange={handleChange}
                    className="mt-1"
                  />
                  <div className="ml-3">
                    <div className="font-semibold">Drop-off at Center</div>
                    <div className="text-sm text-muted-foreground">
                      Bring your device to our service center
                    </div>
                    <div className="text-sm font-medium text-green-600 mt-1">
                      Free
                    </div>
                  </div>
                </label>

                <label
                  className={`relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    formData.dropoffType === "DISPATCH"
                      ? "border-orange-600 bg-orange-50 dark:bg-orange-900/20"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="dropoffType"
                    value="DISPATCH"
                    checked={formData.dropoffType === "DISPATCH"}
                    onChange={handleChange}
                    className="mt-1"
                  />
                  <div className="ml-3">
                    <div className="font-semibold">Dispatch Pickup</div>
                    <div className="text-sm text-muted-foreground">
                      We'll pick up from your location
                    </div>
                    <div className="text-sm font-medium text-orange-600 mt-1">
                      Fee applies
                    </div>
                  </div>
                </label>
              </div>

              {formData.dropoffType === "DISPATCH" && (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="addressLine1"
                        className="text-sm font-medium"
                      >
                        Address Line 1 <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="addressLine1"
                        name="addressLine1"
                        value={formData.addressLine1}
                        onChange={handleChange}
                        placeholder="House/Apartment, Street"
                        required={formData.dropoffType === "DISPATCH"}
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="addressLine2"
                        className="text-sm font-medium"
                      >
                        Address Line 2 (Optional)
                      </label>
                      <Input
                        id="addressLine2"
                        name="addressLine2"
                        value={formData.addressLine2}
                        onChange={handleChange}
                        placeholder="Area, Estate, etc."
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="city" className="text-sm font-medium">
                        City <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="e.g., Lagos"
                        required={formData.dropoffType === "DISPATCH"}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="state" className="text-sm font-medium">
                        State/Region <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="e.g., Lagos State"
                        required={formData.dropoffType === "DISPATCH"}
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="postalCode"
                        className="text-sm font-medium"
                      >
                        Postal Code (Optional)
                      </label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        placeholder="e.g., 100001"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="landmark" className="text-sm font-medium">
                      Landmark/Notes (Optional)
                    </label>
                    <Input
                      id="landmark"
                      name="landmark"
                      value={formData.landmark}
                      onChange={handleChange}
                      placeholder="Nearby landmark or delivery note"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Optional Customer Request */}
            <div className="space-y-2">
              <label htmlFor="customerRequest" className="text-sm font-medium">
                Customer's Request (Optional)
              </label>
              <textarea
                id="customerRequest"
                name="customerRequest"
                value={formData.customerRequest}
                onChange={handleChange}
                placeholder="Any specific requests, preferences, or notes for our technicians"
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
              />
            </div>

            {/* Info Box */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900 dark:text-blue-100">
                  <p className="font-semibold mb-1">No Payment Required Now</p>
                  <p className="text-blue-800 dark:text-blue-200">
                    After we receive your request, we'll provide a detailed
                    quote. You only pay once you approve the repair cost.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 h-12 text-base font-semibold"
            >
              {loading ? (
                <>
                  <LoadingSpinner />
                  <span className="ml-2">Submitting Request...</span>
                </>
              ) : (
                "Submit Repair Request"
              )}
            </Button>
          </form>
        </Card>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>No Account Needed</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <span>Secure Process</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <span>Quick Response</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
