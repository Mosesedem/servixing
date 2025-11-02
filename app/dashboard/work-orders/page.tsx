"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, ArrowRight, CreditCard } from "lucide-react"

interface WorkOrder {
  id: string
  deviceId: string
  device: { brand: string; model: string }
  status: string
  issueDescription: string
  estimatedCost?: number
  finalCost?: number
  paymentStatus: string
  createdAt: string
}

export default function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWorkOrders = async () => {
      try {
        const response = await fetch("/api/work-orders")
        if (response.ok) {
          const data = await response.json()
          setWorkOrders(data)
        }
      } catch (error) {
        console.error("[v0] Error fetching work orders:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchWorkOrders()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "created":
        return "bg-gray-100 text-gray-800"
      case "dropped_off":
        return "bg-blue-100 text-blue-800"
      case "diagnosed":
        return "bg-purple-100 text-purple-800"
      case "in_progress":
        return "bg-orange-100 text-orange-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "ready_for_pickup":
        return "bg-emerald-100 text-emerald-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600"
      case "failed":
        return "text-red-600"
      case "initiated":
        return "text-blue-600"
      case "pending":
        return "text-yellow-600"
      default:
        return "text-gray-600"
    }
  }

  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Work Orders</h1>
        <Link href="/dashboard/work-orders/create">
          <Button className="bg-orange-600 hover:bg-orange-700 gap-2">
            <Plus className="h-4 w-4" />
            Create Work Order
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground">Loading work orders...</div>
      ) : workOrders.length === 0 ? (
        <Card className="p-12 text-center">
          <ArrowRight className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">No work orders yet</p>
          <Link href="/dashboard/work-orders/create">
            <Button className="bg-orange-600 hover:bg-orange-700">Create Your First Work Order</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4">
          {workOrders.map((order) => (
            <Card key={order.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">
                    {order.device.brand} {order.device.model}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">{order.issueDescription}</p>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {formatStatus(order.status)}
                    </span>
                    <span
                      className={`flex items-center gap-1 text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}
                    >
                      <CreditCard className="h-3 w-3" />
                      {formatStatus(order.paymentStatus)}
                    </span>
                    {order.estimatedCost && (
                      <span className="text-muted-foreground">Est. Cost: ${order.estimatedCost.toFixed(2)}</span>
                    )}
                    {order.finalCost && <span className="font-semibold">Final: ${order.finalCost.toFixed(2)}</span>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Created: {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Link href={`/dashboard/work-orders/${order.id}`}>
                  <Button variant="outline">View</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
