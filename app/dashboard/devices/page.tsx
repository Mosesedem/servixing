"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Trash2, Smartphone } from "lucide-react"

interface Device {
  id: string
  brand: string
  model: string
  deviceType: string
  color?: string
  serialNumber?: string
  createdAt: string
}

export default function DevicesPage() {
  const { data: session } = useSession()
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDevices = async () => {
      if (!session?.user?.id) return

      try {
        const response = await fetch("/api/devices")
        if (response.ok) {
          const data = await response.json()
          setDevices(data)
        }
      } catch (error) {
        console.error("[v0] Error fetching devices:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDevices()
  }, [session?.user?.id])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this device?")) return

    try {
      const response = await fetch(`/api/devices/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setDevices(devices.filter((d) => d.id !== id))
      }
    } catch (error) {
      console.error("[v0] Error deleting device:", error)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Devices</h1>
        <Link href="/dashboard/devices/register">
          <Button className="bg-orange-600 hover:bg-orange-700 gap-2">
            <Plus className="h-4 w-4" />
            Register Device
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground">Loading devices...</div>
      ) : devices.length === 0 ? (
        <Card className="p-12 text-center">
          <Smartphone className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">No devices registered yet</p>
          <Link href="/dashboard/devices/register">
            <Button className="bg-orange-600 hover:bg-orange-700">Register Your First Device</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4">
          {devices.map((device) => (
            <Card key={device.id} className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">
                    {device.brand} {device.model}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {device.deviceType}
                    {device.color && ` • ${device.color}`}
                  </p>
                  {device.serialNumber && (
                    <p className="text-xs text-muted-foreground mt-2">S/N: {device.serialNumber}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Registered: {new Date(device.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button onClick={() => handleDelete(device.id)} className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
