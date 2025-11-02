import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const workOrders = await prisma.workOrder.findMany({
      where: { userId: session.user.id },
      include: { device: { select: { brand: true, model: true } } },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(workOrders)
  } catch (error) {
    console.error("[v0] Error fetching work orders:", error)
    return NextResponse.json({ error: "Failed to fetch work orders" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { deviceId, issueDescription, estimatedCost } = await req.json()

    if (!deviceId || !issueDescription) {
      return NextResponse.json({ error: "Device and issue description required" }, { status: 400 })
    }

    // Verify device belongs to user
    const device = await prisma.device.findUnique({
      where: { id: deviceId },
    })

    if (!device || device.userId !== session.user.id) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 })
    }

    const workOrder = await prisma.workOrder.create({
      data: {
        userId: session.user.id,
        deviceId,
        issueDescription,
        estimatedCost: estimatedCost || null,
        status: "created",
      },
    })

    return NextResponse.json(workOrder, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating work order:", error)
    return NextResponse.json({ error: "Failed to create work order" }, { status: 500 })
  }
}
