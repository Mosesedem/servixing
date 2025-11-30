"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, CreditCard, Smartphone, Banknote } from "lucide-react";

interface PaymentData {
  amount: number;
  email: string;
  workOrderId?: string;
  metadata?: any;
  description?: string;
  existingPaymentId?: string;
}

export default function CentralizedCheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<
    "paystack" | "etegram" | "flutterwave"
  >("paystack");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Get payment ID from URL params
    const paymentId = searchParams.get("paymentId");

    if (!paymentId) {
      setError("Invalid payment ID");
      setLoading(false);
      return;
    }

    // Fetch payment data from API
    const fetchPaymentData = async () => {
      try {
        const response = await fetch(`/api/payments/${paymentId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error?.message || "Failed to fetch payment data"
          );
        }
        const data = await response.json();
        const payment = data.data;

        setPaymentData({
          amount: parseFloat(payment.amount),
          email: payment.user.email,
          workOrderId: payment.workOrderId || undefined,
          description: payment.metadata?.description || "Payment for service",
          existingPaymentId: paymentId,
          metadata: payment.metadata || {},
        });
        setSelectedProvider(payment.provider || "paystack");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load payment data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentData();
  }, [searchParams]);

  const handlePayment = async () => {
    if (!paymentData) return;

    setProcessing(true);
    setError("");

    try {
      let response;
      let data;

      if (paymentData.existingPaymentId) {
        // Update existing payment with selected provider
        response = await fetch(
          `/api/payments/${paymentData.existingPaymentId}/update-provider`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              provider: selectedProvider,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error?.message || "Failed to update payment provider"
          );
        }

        data = await response.json();

        // Now initialize the payment with the updated provider
        response = await fetch("/api/payments/initialize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workOrderId: paymentData.workOrderId,
            amount: paymentData.amount,
            email: paymentData.email,
            provider: selectedProvider,
            metadata: {
              ...paymentData.metadata,
              existingPaymentId: paymentData.existingPaymentId,
            },
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error?.message || "Payment initialization failed"
          );
        }

        data = await response.json();
      } else {
        // Initialize new payment
        response = await fetch("/api/payments/initialize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...paymentData,
            provider: selectedProvider,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error?.message || "Payment initialization failed"
          );
        }

        data = await response.json();
      }

      // Redirect to payment provider
      if (data.data?.authorizationUrl) {
        window.location.href = data.data.authorizationUrl;
      } else {
        throw new Error("No authorization URL received");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setProcessing(false);
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "paystack":
        return <CreditCard className="h-6 w-6" />;
      case "etegram":
        return <Smartphone className="h-6 w-6" />;
      case "flutterwave":
        return <Banknote className="h-6 w-6" />;
      default:
        return <CreditCard className="h-6 w-6" />;
    }
  };

  const getProviderDescription = (provider: string) => {
    switch (provider) {
      case "paystack":
        return "Secure payment processing with card, bank transfer, and mobile money";
      case "etegram":
        return "Bank transfer payment with instant confirmation";
      case "flutterwave":
        return "Multiple payment options including cards, mobile money, and bank transfers";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error && !paymentData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-6 max-w-md w-full">
          <div className="text-center">
            <div className="text-red-600 mb-4">⚠️</div>
            <h2 className="text-xl font-semibold mb-2">Payment Error</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Complete Your Payment</h1>
          <p className="text-muted-foreground">
            Choose your preferred payment method
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payment Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Payment Summary</h2>
              <div className="space-y-4">
                {paymentData?.description && (
                  <div>
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="font-medium">{paymentData.description}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{paymentData?.email}</p>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>₦{paymentData?.amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Payment Options */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">
                Select Payment Method
              </h2>

              <RadioGroup
                value={selectedProvider}
                onValueChange={(value) => setSelectedProvider(value as any)}
                className="space-y-4"
              >
                {/* Paystack */}
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="paystack" id="paystack" />
                  <Label htmlFor="paystack" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-3">
                      {getProviderIcon("paystack")}
                      <div>
                        <div className="font-medium">Paystack</div>
                        <div className="text-sm text-muted-foreground">
                          {getProviderDescription("paystack")}
                        </div>
                      </div>
                    </div>
                  </Label>
                </div>

                {/* Etegram */}
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="etegram" id="etegram" />
                  <Label htmlFor="etegram" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-3">
                      {getProviderIcon("etegram")}
                      <div>
                        <div className="font-medium">Etegram</div>
                        <div className="text-sm text-muted-foreground">
                          {getProviderDescription("etegram")}
                        </div>
                      </div>
                    </div>
                  </Label>
                </div>

                {/* Flutterwave */}
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="flutterwave" id="flutterwave" />
                  <Label
                    htmlFor="flutterwave"
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      {getProviderIcon("flutterwave")}
                      <div>
                        <div className="font-medium">Flutterwave</div>
                        <div className="text-sm text-muted-foreground">
                          {getProviderDescription("flutterwave")}
                        </div>
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <Button
                onClick={handlePayment}
                disabled={processing}
                className="w-full mt-6 bg-orange-600 hover:bg-orange-700 h-12 text-base font-semibold"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  `Pay ₦${paymentData?.amount.toLocaleString()} with ${
                    selectedProvider.charAt(0).toUpperCase() +
                    selectedProvider.slice(1)
                  }`
                )}
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
