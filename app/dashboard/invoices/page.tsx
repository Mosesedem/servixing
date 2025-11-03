"use client";

import { useEffect, useState } from "react";
import { Download, Mail, FileText, Calendar, DollarSign } from "lucide-react";

interface Invoice {
  id: string;
  workOrderId: string;
  workOrder: {
    id: string;
    deviceType: string;
    issueDescription: string;
    status: string;
    createdAt: string;
    device?: {
      manufacturer: string;
      model: string;
    };
  };
  amount: number;
  currency: string;
  status: string;
  paidAt: string | null;
  createdAt: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [emailingId, setEmailingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await fetch("/api/user/invoices");
      if (!response.ok) throw new Error("Failed to fetch invoices");
      const data = await response.json();
      setInvoices(data);
    } catch (err) {
      setError("Failed to load invoices");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailInvoice = async (invoiceId: string) => {
    setEmailingId(invoiceId);
    try {
      const response = await fetch(`/api/user/invoices/${invoiceId}/email`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to email invoice");
      alert("Invoice sent to your email successfully!");
    } catch (err) {
      alert("Failed to send invoice email");
      console.error(err);
    } finally {
      setEmailingId(null);
    }
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    setDownloadingId(invoiceId);
    try {
      const response = await fetch(`/api/user/invoices/${invoiceId}/download`);
      if (!response.ok) throw new Error("Failed to download invoice");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert("Failed to download invoice");
      console.error(err);
    } finally {
      setDownloadingId(null);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
        <p className="text-gray-600 mt-2">
          View and manage your work order invoices
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {invoices.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Invoices Yet
          </h3>
          <p className="text-gray-600">
            Your work order invoices will appear here once created.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Invoice #{invoice.id.slice(-8)}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          invoice.status
                        )}`}
                      >
                        {invoice.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>
                          Work Order: {invoice.workOrder.deviceType} -{" "}
                          {invoice.workOrder.device?.manufacturer}{" "}
                          {invoice.workOrder.device?.model}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Created: {formatDate(invoice.createdAt)}</span>
                      </div>
                      {invoice.paidAt && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          <span>Paid: {formatDate(invoice.paidAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-end gap-3">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(invoice.amount, invoice.currency)}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEmailInvoice(invoice.id)}
                        disabled={emailingId === invoice.id}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                      >
                        <Mail className="h-4 w-4" />
                        {emailingId === invoice.id ? "Sending..." : "Email"}
                      </button>
                      <button
                        onClick={() => handleDownloadInvoice(invoice.id)}
                        disabled={downloadingId === invoice.id}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        {downloadingId === invoice.id
                          ? "Downloading..."
                          : "Download"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Issue:</span>{" "}
                    {invoice.workOrder.issueDescription}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
