"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, MessageCircle, Zap } from "lucide-react"

interface Ticket {
  id: string
  title: string
  status: string
  priority: string
  createdAt: string
  messages: any[]
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch("/api/support/tickets")
        if (response.ok) {
          const data = await response.json()
          setTickets(data)
        }
      } catch (error) {
        console.error("[v0] Error fetching tickets:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTickets()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "open":
        return "bg-yellow-100 text-yellow-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "text-red-600"
      case "high":
        return "text-orange-600"
      case "normal":
        return "text-blue-600"
      case "low":
        return "text-gray-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Support & Help</h1>
        <Link href="/support/create-ticket">
          <Button className="bg-orange-600 hover:bg-orange-700 gap-2">
            <Plus className="h-4 w-4" />
            Create Ticket
          </Button>
        </Link>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/knowledge-base">
          <Card className="p-6 hover:bg-muted/50 cursor-pointer transition">
            <Zap className="h-6 w-6 text-orange-600 mb-2" />
            <h2 className="font-semibold mb-1">Knowledge Base</h2>
            <p className="text-sm text-muted-foreground">Find guides, FAQs, and troubleshooting tips</p>
          </Card>
        </Link>

        <Card className="p-6">
          <MessageCircle className="h-6 w-6 text-blue-600 mb-2" />
          <h2 className="font-semibold mb-1">Contact Support</h2>
          <p className="text-sm text-muted-foreground">Email: support@servixing.com</p>
        </Card>
      </div>

      {/* Support Tickets */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Your Support Tickets</h2>

        {loading ? (
          <div className="text-center text-muted-foreground">Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No support tickets yet</p>
            <Link href="/support/create-ticket">
              <Button className="bg-orange-600 hover:bg-orange-700">Create First Ticket</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <Link key={ticket.id} href={`/support/tickets/${ticket.id}`}>
                <Card className="p-4 hover:bg-muted/50 cursor-pointer transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{ticket.title}</h3>
                      <div className="flex gap-2 items-center">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                        <span className={`text-xs font-medium capitalize ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                        <span className="text-xs text-muted-foreground">{ticket.messages.length} responses</span>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
