import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const device = await prisma.device.findUnique({
      where: { id: params.id },
    })

    if (!device || device.userId !== session.user.id) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 })
    }

    await prisma.device.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Device deleted" })
  } catch (error) {
    console.error("[v0] Error deleting device:", error)
    return NextResponse.json({ error: "Failed to delete device" }, { status: 500 })
  }
}
