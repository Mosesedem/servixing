"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function RegisterDevicePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    deviceType: "laptop",
    brand: "",
    model: "",
    serialNumber: "",
    color: "",
    description: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || "Failed to register device")
        return
      }

      router.push("/dashboard/devices")
      router.refresh()
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Link href="/dashboard/devices" className="flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Devices
      </Link>

      <Card className="max-w-2xl p-8">
        <h1 className="text-3xl font-bold mb-6">Register a Device</h1>

        {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Device Type</label>
            <select
              name="deviceType"
              value={formData.deviceType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
            >
              <option value="laptop">Laptop</option>
              <option value="desktop">Desktop</option>
              <option value="phone">Phone</option>
              <option value="tablet">Tablet</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Brand</label>
              <Input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="Apple, Dell, HP, etc."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Model</label>
              <Input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="MacBook Pro, Inspiron, etc."
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Serial Number</label>
              <Input
                type="text"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleChange}
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Color</label>
              <Input type="text" name="color" value={formData.color} onChange={handleChange} placeholder="Optional" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Any additional details about the device..."
              rows={4}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700">
              {loading ? "Registering..." : "Register Device"}
            </Button>
            <Link href="/dashboard/devices">
              <Button variant="outline">Cancel</Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  )
}
