"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  CreditCard,
  Printer,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

interface PaymentDetail {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paystackReference?: string;
  webhookVerified: boolean;
  refundAmount?: number;
  createdAt: string;
  user: { id: string; name?: string | null; email: string };
  workOrder?: {
    id: string;
    status: string;
    device: { brand: string; model: string };
  };
}

export default function PaymentReceiptPage() {
  const params = useParams();
  const paymentId = params.id as string;
  const [payment, setPayment] = useState<PaymentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [paying, setPaying] = useState(false);
  const [refundState, setRefundState] = useState({
    amount: "",
    reason: "",
    loading: false,
  });

  const handlePayNow = async () => {
    if (!payment) return;
    setPaying(true);

    try {
      // Redirect to centralized checkout
      const params = new URLSearchParams({
        amount: payment.amount.toString(),
        email: payment.user.email,
        workOrderId: payment.workOrder?.id || "",
        description: payment.workOrder
          ? `Payment for work order ${payment.workOrder.device.brand} ${payment.workOrder.device.model}`
          : `Payment ${payment.id}`,
        metadata: JSON.stringify({
          paymentId: payment.id,
          existingPayment: true,
        }),
      });

      window.location.href = `/payment/checkout?${params.toString()}`;
    } catch (e) {
      alert("Failed to redirect to payment");
    } finally {
      setPaying(false);
    }
  };

  useEffect(() => {
    fetchPayment();
    fetchMe();
  }, [paymentId]);

  const fetchMe = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const json = await res.json();
      if (json.success) {
        const role = json.data?.user?.role;
        setIsAdmin(role === "ADMIN" || role === "SUPER_ADMIN");
      }
    } catch {}
  };

  const fetchPayment = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/payments/${paymentId}`);
      const json = await res.json();
      if (json.success) {
        setPayment(json.data);
      } else {
        setError(json.error?.message || "Failed to load payment");
      }
    } catch (err) {
      setError("Failed to load payment");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleRefund = async () => {
    if (!refundState.reason || refundState.reason.length < 3) {
      alert("Please provide a valid reason for the refund");
      return;
    }
    setRefundState((s) => ({ ...s, loading: true }));
    try {
      const amountNumber = refundState.amount
        ? Number(refundState.amount)
        : undefined;
      const res = await fetch(`/api/payments/${paymentId}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountNumber,
          reason: refundState.reason,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        alert(json.error?.message || "Refund failed");
      } else {
        alert("Refund initiated");
        fetchPayment();
      }
    } catch (e) {
      alert("Refund failed");
    } finally {
      setRefundState((s) => ({ ...s, loading: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent mb-4"></div>
          <p className="text-gray-600">Loading receipt...</p>
        </div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
        <h2 className="text-2xl font-semibold mb-2">Payment Not Found</h2>
        <p className="text-gray-600 mb-6">
          {error || "Unable to load payment"}
        </p>
        <Link href="/dashboard/payments">
          <Button>Back to Payments</Button>
        </Link>
      </div>
    );
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case "PAID":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "FAILED":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "PENDING":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "REFUNDED":
        return <ArrowLeft className="h-5 w-5 text-purple-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link
          href="/dashboard/payments"
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to payments
        </Link>
        <Button onClick={handlePrint} className="gap-2">
          <Printer className="h-4 w-4" /> Print Receipt
        </Button>
      </div>

      <Card className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Payment Receipt</h1>
            <p className="text-gray-600">
              Reference: {payment.paystackReference || payment.id}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {statusIcon(payment.status)}
            <span className="font-semibold capitalize">
              {payment.status.toLowerCase()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-600">Billed To</p>
            <p className="font-semibold">
              {payment.user.name || payment.user.email}
            </p>
            <p className="text-sm text-gray-600">{payment.user.email}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Date</p>
            <p className="font-semibold">
              {new Date(payment.createdAt).toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>
        </div>

        {payment.workOrder && (
          <div className="mb-6">
            <p className="text-sm text-gray-600">Work Order</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">
                  {payment.workOrder.device.brand}{" "}
                  {payment.workOrder.device.model}
                </p>
                <Link
                  href={`/dashboard/work-orders/${payment.workOrder.id}`}
                  className="text-sm text-orange-600"
                >
                  View work order →
                </Link>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-semibold">
                  {payment.workOrder.status.replace("_", " ")}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="border-t pt-6">
          <div className="flex items-center justify-between">
            <p className="text-gray-600">Amount</p>
            <p className="text-2xl font-bold">
              ₦{Number(payment.amount).toLocaleString()}
            </p>
          </div>
          {payment.refundAmount && Number(payment.refundAmount) > 0 && (
            <div className="flex items-center justify-between text-sm text-purple-700 mt-2">
              <p>Refunded</p>
              <p>₦{Number(payment.refundAmount).toLocaleString()}</p>
            </div>
          )}
        </div>

        {payment.status === "PENDING" && (
          <div className="mt-6 flex justify-center">
            <Button
              onClick={handlePayNow}
              disabled={paying}
              className="bg-green-600 hover:bg-green-700"
            >
              {paying ? "Initializing..." : "Pay Now"}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
