"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Device {
  id: string
  brand: string
  model: string
}

export default function CreateWorkOrderPage() {
  const router = useRouter()
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    deviceId: "",
    issueDescription: "",
    estimatedCost: "",
  })

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await fetch("/api/devices")
        if (response.ok) {
          const data = await response.json()
          setDevices(data)
        }
      } catch (error) {
        console.error("[v0] Error fetching devices:", error)
      }
    }

    fetchDevices()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!formData.deviceId) {
      setError("Please select a device")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/work-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId: formData.deviceId,
          issueDescription: formData.issueDescription,
          estimatedCost: formData.estimatedCost ? Number.parseFloat(formData.estimatedCost) : null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || "Failed to create work order")
        return
      }

      router.push("/dashboard/work-orders")
      router.refresh()
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
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

      <Card className="max-w-2xl p-8">
        <h1 className="text-3xl font-bold mb-6">Create Work Order</h1>

        {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Select Device</label>
            {devices.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No devices registered.{" "}
                <Link href="/dashboard/devices/register" className="text-orange-600 hover:underline">
                  Register one first
                </Link>
              </div>
            ) : (
              <select
                name="deviceId"
                value={formData.deviceId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                required
              >
                <option value="">-- Select a device --</option>
                {devices.map((device) => (
                  <option key={device.id} value={device.id}>
                    {device.brand} {device.model}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Issue Description</label>
            <textarea
              name="issueDescription"
              value={formData.issueDescription}
              onChange={handleChange}
              placeholder="Describe the problem with your device..."
              rows={5}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Estimated Cost (Optional)</label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">$</span>
              <Input
                type="number"
                name="estimatedCost"
                value={formData.estimatedCost}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700">
              {loading ? "Creating..." : "Create Work Order"}
            </Button>
            <Link href="/dashboard/work-orders">
              <Button variant="outline">Cancel</Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  )
}
