"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, TrendingUp, RefreshCcw, AlertCircle } from "lucide-react";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Payments Analytics</h1>
        <Button onClick={fetchAnalytics} variant="outline" className="gap-2">
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
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      ) : analytics ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <p className="text-3xl font-bold mt-1">{analytics.successRate}%</p>
          </Card>

          <Card className="p-6 md:col-span-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-600">Total Payments</p>
                <p className="text-2xl font-bold">{analytics.totalPayments}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Successful</p>
                <p className="text-2xl font-bold text-green-600">
                  {analytics.successfulPayments}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">
                  {analytics.failedPayments}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Refunded</p>
                <p className="text-2xl font-bold text-purple-600">
                  {analytics.refundedPayments}
                </p>
              </div>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
