"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, AlertCircle, Clock } from "lucide-react";

interface WarrantySectionProps {
  workOrderId: string;
  deviceId: string;
  deviceBrand: string;
  currentStatus?: string;
  currentProvider?: string;
}

export function WarrantySection({
  workOrderId,
  deviceId,
  deviceBrand,
  currentStatus,
  currentProvider,
}: WarrantySectionProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(currentStatus);
  const [provider, setProvider] = useState(currentProvider);

  const handleCheckWarranty = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/warranty/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId,
          workOrderId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setStatus(data.status);
        setProvider(data.provider);
      }
    } catch (error) {
      console.error(" Warranty check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (s?: string) => {
    switch (s) {
      case "active":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "expired":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case "requires_verification":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <Card className="bg-blue-50 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          {getStatusIcon(status)}
          Warranty Information
        </h2>
      </div>

      <div className="space-y-4">
        {status ? (
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Status: <span className="font-semibold capitalize">{status}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Provider:{" "}
              <span className="font-semibold capitalize">
                {provider || "Unknown"}
              </span>
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No warranty information available
          </p>
        )}

        <Button
          onClick={handleCheckWarranty}
          disabled={loading}
          variant="outline"
          className="w-full bg-transparent"
        >
          {loading ? "Checking..." : "Check Warranty Status"}
        </Button>
      </div>
    </Card>
  );
}
