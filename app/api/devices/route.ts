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

    const devices = await prisma.device.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(devices)
  } catch (error) {
    console.error("[v0] Error fetching devices:", error)
    return NextResponse.json({ error: "Failed to fetch devices" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { deviceType, brand, model, serialNumber, color, description } = await req.json()

    if (!brand || !model) {
      return NextResponse.json({ error: "Brand and model are required" }, { status: 400 })
    }

    const device = await prisma.device.create({
      data: {
        userId: session.user.id,
        deviceType,
        brand,
        model,
        serialNumber: serialNumber || null,
        color: color || null,
        description: description || null,
        images: [],
      },
    })

    return NextResponse.json(device, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating device:", error)
    return NextResponse.json({ error: "Failed to create device" }, { status: 500 })
  }
}
