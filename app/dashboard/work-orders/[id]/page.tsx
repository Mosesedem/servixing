"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, CreditCard, CheckCircle, XCircle, Clock } from "lucide-react"
import { loadScript } from "@/lib/paystack-loader"
import { WarrantySection } from "./warranty-section"
import { PartsSearch } from "./parts-search"

interface WorkOrder {
  id: string
  device: {
    id: string
    brand: string
    model: string
  }
  status: string
  issueDescription: string
  estimatedCost?: number
  finalCost?: number
  paymentStatus: string
  paymentReference?: string
  warrantyStatus?: string
  warrantyProvider?: string
  createdAt: string
}

export default function WorkOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const workOrderId = params.id as string
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchWorkOrder = async () => {
      try {
        const response = await fetch(`/api/work-orders?id=${workOrderId}`)
        if (response.ok) {
          const data = await response.json()
          setWorkOrder(data)
        }
      } catch (err) {
        console.error("[v0] Error fetching work order:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchWorkOrder()
  }, [workOrderId])

  const handlePayment = async () => {
    setPaymentLoading(true)
    setError("")

    try {
      if (!workOrder?.finalCost && !workOrder?.estimatedCost) {
        setError("No cost set for this work order")
        setPaymentLoading(false)
        return
      }

      const amount = workOrder.finalCost || workOrder.estimatedCost || 0

      await loadScript()

      const initResponse = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workOrderId,
          amount,
        }),
      })

      if (!initResponse.ok) {
        const data = await initResponse.json()
        setError(data.error || "Failed to initialize payment")
        setPaymentLoading(false)
        return
      }

      const { authorizationUrl } = await initResponse.json()
      window.location.href = authorizationUrl
    } catch (err) {
      setError("Payment initialization failed")
      console.error("[v0] Payment error:", err)
    } finally {
      setPaymentLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600"
      case "failed":
        return "text-red-600"
      case "pending":
        return "text-yellow-600"
      case "initiated":
        return "text-blue-600"
      default:
        return "text-gray-600"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5" />
      case "failed":
        return <XCircle className="h-5 w-5" />
      case "initiated":
        return <Clock className="h-5 w-5" />
      default:
        return null
    }
  }

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading...</div>
  }

  if (!workOrder) {
    return <div className="text-center text-muted-foreground">Work order not found</div>
  }

  return (
    <div>
      <Link
        href="/dashboard/work-orders"
        className="flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Work Orders
      </Link>

      <Card className="p-8 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {workOrder.device.brand} {workOrder.device.model}
            </h1>
            <p className="text-muted-foreground">ID: {workOrderId}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Created</p>
            <p className="font-semibold">{new Date(workOrder.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div>
            <p className="text-sm text-muted-foreground">Issue</p>
            <p className="font-semibold">{workOrder.issueDescription}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="font-semibold capitalize">{workOrder.status.replace("_", " ")}</p>
          </div>
          {workOrder.estimatedCost && (
            <div>
              <p className="text-sm text-muted-foreground">Estimated Cost</p>
              <p className="font-semibold">${workOrder.estimatedCost.toFixed(2)}</p>
            </div>
          )}
          {workOrder.finalCost && (
            <div>
              <p className="text-sm text-muted-foreground">Final Cost</p>
              <p className="font-semibold">${workOrder.finalCost.toFixed(2)}</p>
            </div>
          )}
        </div>

        {/* Payment Section */}
        <Card className="bg-slate-50 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment
            </h2>
            <div className={`flex items-center gap-2 ${getStatusColor(workOrder.paymentStatus)}`}>
              {getStatusIcon(workOrder.paymentStatus)}
              <span className="font-semibold capitalize">{workOrder.paymentStatus}</span>
            </div>
          </div>

          {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

          {workOrder.paymentStatus === "pending" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {workOrder.finalCost || workOrder.estimatedCost
                  ? `Amount due: $${(workOrder.finalCost || workOrder.estimatedCost)?.toFixed(2)}`
                  : "No amount set. Please contact support."}
              </p>
              <Button
                onClick={handlePayment}
                disabled={paymentLoading || !workOrder.finalCost}
                className="w-full bg-green-600 hover:bg-green-700 gap-2"
              >
                <CreditCard className="h-4 w-4" />
                {paymentLoading ? "Processing..." : "Pay with Paystack"}
              </Button>
            </div>
          )}

          {workOrder.paymentStatus === "completed" && (
            <div className="bg-green-50 border border-green-200 rounded p-4">
              <p className="text-green-800 font-semibold">Payment completed successfully</p>
            </div>
          )}

          {workOrder.paymentStatus === "failed" && (
            <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
              <p className="text-red-800 font-semibold">Payment failed</p>
              <Button onClick={handlePayment} disabled={paymentLoading} className="mt-4 w-full bg-orange-600">
                {paymentLoading ? "Retrying..." : "Retry Payment"}
              </Button>
            </div>
          )}
        </Card>
      </Card>

      <WarrantySection
        workOrderId={workOrderId}
        deviceId={workOrder.device.id}
        deviceBrand={workOrder.device.brand}
        currentStatus={workOrder.warrantyStatus}
        currentProvider={workOrder.warrantyProvider}
      />

      <PartsSearch deviceBrand={workOrder.device.brand} deviceModel={workOrder.device.model} />
    </div>
  )
}
