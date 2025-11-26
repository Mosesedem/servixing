"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  TrendingUp,
  RefreshCcw,
  AlertCircle,
  DollarSign,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  user: { id: string; email: string; name: string };
  workOrder?: {
    id: string;
    device: { brand: string; model: string };
    issueDescription: string;
  };
  refunds: any[];
}

interface Analytics {
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  refundedPayments: number;
  totalRevenue: number;
  totalRefunds: number;
  netRevenue: number;
  avgTransactionValue: number;
  successRate: number;
}

export default function AdminPaymentsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refundingPayment, setRefundingPayment] = useState<Payment | null>(
    null
  );
  const [refundReason, setRefundReason] = useState("");
  const [sendEmail, setSendEmail] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    fetchPayments();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/payments/analytics");
      const json = await res.json();
      if (json.success) {
        setAnalytics(json.data);
      } else {
        setError(json.error?.message || "Failed to load analytics");
      }
    } catch (err) {
      setError("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      const res = await fetch("/api/admin/payments");
      if (res.ok) {
        const data = await res.json();
        setPayments(data);
      }
    } catch (err) {
      console.error("Failed to load payments:", err);
    }
  };

  const handleRefund = async () => {
    if (!refundingPayment) return;

    try {
      const res = await fetch("/api/admin/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: refundingPayment.id,
          action: "refund",
          reason: refundReason,
          sendEmail,
        }),
      });

      if (res.ok) {
        fetchPayments();
        fetchAnalytics();
        setRefundingPayment(null);
        setRefundReason("");
      }
    } catch (err) {
      console.error("Failed to process refund:", err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "text-green-600";
      case "PENDING":
        return "text-yellow-600";
      case "FAILED":
        return "text-red-600";
      case "REFUNDED":
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Payments Management</h1>
        <Button
          onClick={() => {
            fetchAnalytics();
            fetchPayments();
          }}
          variant="outline"
          className="gap-2"
        >
          <RefreshCcw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5" /> {error}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent mb-4"></div>
          <p className="text-gray-600">Loading payments...</p>
        </div>
      ) : analytics ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold mt-1">
                ₦{analytics.totalRevenue.toLocaleString()}
              </p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-gray-600">Net Revenue</p>
              <p className="text-3xl font-bold mt-1">
                ₦{analytics.netRevenue.toLocaleString()}
              </p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-3xl font-bold mt-1">
                {analytics.successRate}%
              </p>
            </Card>
          </div>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Payments</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr className="bg-muted/50">
                    <th className="text-left p-3 font-semibold">Customer</th>
                    <th className="text-left p-3 font-semibold">Amount</th>
                    <th className="text-left p-3 font-semibold">Status</th>
                    <th className="text-left p-3 font-semibold">Device</th>
                    <th className="text-left p-3 font-semibold">Date</th>
                    <th className="text-center p-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.slice(0, 20).map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-b border-border hover:bg-muted/50"
                    >
                      <td className="p-3">
                        <div className="font-medium">
                          {payment.user.name || "N/A"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {payment.user.email}
                        </div>
                      </td>
                      <td className="p-3 font-semibold">
                        ₦{payment.amount.toFixed(2)}
                      </td>
                      <td className="p-3">
                        <span
                          className={`text-sm font-medium ${getStatusColor(
                            payment.status
                          )}`}
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td className="p-3">
                        {payment.workOrder ? (
                          <div>
                            <div className="font-medium">
                              {payment.workOrder.device.brand}{" "}
                              {payment.workOrder.device.model}
                            </div>
                            <div className="text-xs text-muted-foreground truncate max-w-48">
                              {payment.workOrder.issueDescription}
                            </div>
                          </div>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-center">
                        {payment.status === "PAID" &&
                          payment.refunds.length === 0 && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setRefundingPayment(payment)}
                                >
                                  Refund
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Process Refund</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <p>
                                    Refund ₦
                                    {refundingPayment?.amount.toFixed(2)} to{" "}
                                    {refundingPayment?.user.name}?
                                  </p>
                                  <div>
                                    <label className="block text-sm font-medium mb-2">
                                      Reason (optional)
                                    </label>
                                    <Input
                                      value={refundReason}
                                      onChange={(e) =>
                                        setRefundReason(e.target.value)
                                      }
                                      placeholder="Reason for refund"
                                    />
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      id="sendEmail"
                                      checked={sendEmail}
                                      onCheckedChange={setSendEmail}
                                    />
                                    <label
                                      htmlFor="sendEmail"
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                      Send email notification to customer
                                    </label>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button onClick={handleRefund}>
                                      Process Refund
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        setRefundingPayment(null);
                                        setRefundReason("");
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : null}
    </div>
  );
}
