"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  CreditCard,
  Smartphone,
  Banknote,
  Shield,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

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
    const paymentId = searchParams.get("paymentId");

    if (!paymentId) {
      setError("No payment session found. Please start checkout again.");
      setLoading(false);
      return;
    }

    const fetchPaymentData = async () => {
      try {
        const response = await fetch(`/api/payments/${paymentId}`);
        if (!response.ok) {
          const err = await response.json();
          throw new Error(
            err.error?.message || "Payment session expired or invalid"
          );
        }
        const { data } = await response.json();

        setPaymentData({
          amount: parseFloat(data.amount),
          email: data.user.email,
          workOrderId: data.workOrderId || undefined,
          description: data.metadata?.description || "Payment for order",
          existingPaymentId: paymentId,
          metadata: data.metadata || {},
        });
        setSelectedProvider(data.provider || "paystack");
      } catch (err: any) {
        setError(err.message || "Failed to load payment details");
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
      let initResponse;

      if (paymentData.existingPaymentId) {
        // Update provider first
        const updateRes = await fetch(
          `/api/payments/${paymentData.existingPaymentId}/update-provider`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ provider: selectedProvider }),
          }
        );

        if (!updateRes.ok) throw new Error("Failed to update payment method");

        // Then re-initialize with selected provider
        initResponse = await fetch("/api/payments/initialize", {
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
      } else {
        initResponse = await fetch("/api/payments/initialize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...paymentData,
            provider: selectedProvider,
          }),
        });
      }

      if (!initResponse.ok) {
        const err = await initResponse.json();
        throw new Error(err.error?.message || "Payment failed to start");
      }

      const result = await initResponse.json();
      if (result.data?.authorizationUrl) {
        window.location.href = result.data.authorizationUrl;
      } else {
        throw new Error("Payment gateway not responding");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setProcessing(false);
    }
  };

  const providers = [
    {
      value: "paystack",
      name: "Paystack",
      icon: <CreditCard className="h-7 w-7" />,
      desc: "Card, Bank Transfer, USSD, Apple Pay",
      color: "text-green-600",
    },
    {
      value: "etegram",
      name: "Etegram",
      icon: <Smartphone className="h-7 w-7" />,
      desc: "Instant bank transfer • No card needed",
      color: "text-blue-600",
    },
    {
      value: "flutterwave",
      name: "Flutterwave",
      icon: <Banknote className="h-7 w-7" />,
      desc: "Cards, Mobile Money, Bank Account",
      color: "text-orange-600",
    },
  ] as const;

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">
            Preparing secure checkout...
          </p>
        </div>
      </div>
    );
  }

  // Error State
  if (error && !paymentData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="text-red-600 text-5xl mb-4">Warning</div>
          <h2 className="text-2xl font-bold mb-3">Payment Session Error</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <div className="space-y-3">
            <Button onClick={() => router.back()} className="w-full">
              Return to Previous Page
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="h-5 w-5 mr-2" />
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            Complete Your Payment
          </h1>
          <p className="text-muted-foreground text-lg">
            Secure • Fast • Trusted by thousands
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payment Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6 shadow-xl border-orange-100">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="h-8 w-8 text-orange-600" />
                <h2 className="text-2xl font-bold">Order Summary</h2>
              </div>

              <div className="space-y-5 text-lg">
                {paymentData?.description && (
                  <div>
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="font-semibold">{paymentData.description}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Paying with</p>
                  <p className="font-medium truncate">{paymentData?.email}</p>
                </div>

                <div className="border-t pt-5">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xl font-semibold">Total Amount</span>
                    <span className="text-3xl font-bold text-orange-600">
                      ₦{paymentData?.amount.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-4 py-3 rounded-lg">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>SSL Secured • No card details stored</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Payment Method Selection */}
          <div className="lg:col-span-2">
            <Card className="p-6 sm:p-8">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <CreditCard className="h-8 w-8 text-orange-600" />
                Choose Payment Method
              </h2>

              <RadioGroup
                value={selectedProvider}
                onValueChange={(v) => setSelectedProvider(v as any)}
                className="space-y-4"
              >
                {providers.map((provider) => (
                  <label
                    key={provider.value}
                    className="flex items-center gap-4 p-5 border-2 rounded-xl hover:border-orange-300 hover:bg-orange-50/50 transition-all cursor-pointer has-[:checked]:border-orange-600 has-[:checked]:bg-orange-50"
                  >
                    <RadioGroupItem
                      value={provider.value}
                      id={provider.value}
                      className="sr-only"
                    />
                    <div
                      className={`p-3 rounded-full ${provider.color} bg-white shadow-md`}
                    >
                      {provider.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-lg">
                        {provider.name}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {provider.desc}
                      </div>
                    </div>
                    <div className="h-6 w-6 rounded-full border-2 border-muted has-[:checked]:border-orange-600 has-[:checked]:bg-orange-600 flex items-center justify-center">
                      {selectedProvider === provider.value && (
                        <div className="h-3 w-3 bg-white rounded-full" />
                      )}
                    </div>
                  </label>
                ))}
              </RadioGroup>

              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <Button
                onClick={handlePayment}
                disabled={processing}
                size="lg"
                className="w-full mt-8 h-14 text-lg font-bold bg-orange-600 hover:bg-orange-700 shadow-lg"
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Redirecting to{" "}
                    {selectedProvider.charAt(0).toUpperCase() +
                      selectedProvider.slice(1)}
                    ...
                  </>
                ) : (
                  <>
                    Pay ₦{paymentData?.amount.toLocaleString()} with{" "}
                    {selectedProvider.charAt(0).toUpperCase() +
                      selectedProvider.slice(1)}
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground mt-6">
                You will be redirected to a secure page to complete your
                payment.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
