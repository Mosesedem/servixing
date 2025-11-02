"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

interface WorkOrder {
  id: string
  device: { brand: string; model: string }
}

export default function CreateTicketPage() {
  const router = useRouter()
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    workOrderId: "",
    priority: "normal",
  })

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
      }
    }

    fetchWorkOrders()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || "Failed to create ticket")
        return
      }

      router.push("/support")
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Link href="/support" className="flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Support
      </Link>

      <Card className="max-w-2xl p-8">
        <h1 className="text-3xl font-bold mb-6">Create Support Ticket</h1>

        {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Subject</label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Brief description of your issue"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Please provide detailed information about your issue..."
              rows={6}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Related Work Order (Optional)</label>
              <select
                name="workOrderId"
                value={formData.workOrderId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
              >
                <option value="">-- Select work order --</option>
                {workOrders.map((order) => (
                  <option key={order.id} value={order.id}>
                    {order.device.brand} {order.device.model}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700">
              {loading ? "Creating..." : "Create Ticket"}
            </Button>
            <Link href="/support">
              <Button variant="outline">Cancel</Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  )
}
