import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { initializePayment } from "@/lib/paystack"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { workOrderId, amount } = await req.json()

    if (!workOrderId || !amount) {
      return NextResponse.json({ error: "Work order ID and amount required" }, { status: 400 })
    }

    // Verify work order belongs to user
    const workOrder = await prisma.workOrder.findUnique({
      where: { id: workOrderId },
    })

    if (!workOrder || workOrder.userId !== session.user.id) {
      return NextResponse.json({ error: "Work order not found" }, { status: 404 })
    }

    if (workOrder.paymentStatus !== "pending") {
      return NextResponse.json({ error: "Payment already in progress or completed" }, { status: 400 })
    }

    // Generate unique reference
    const reference = `${workOrderId}-${Date.now()}`

    // Initialize payment with Paystack
    const paymentData = await initializePayment(session.user.email, amount, reference, workOrderId)

    // Update work order with payment reference
    await prisma.workOrder.update({
      where: { id: workOrderId },
      data: {
        paymentReference: reference,
        paymentStatus: "initiated",
        paymentMethod: "paystack",
      },
    })

    return NextResponse.json({
      authorizationUrl: paymentData.data.authorization_url,
      accessCode: paymentData.data.access_code,
      reference,
    })
  } catch (error) {
    console.error("[v0] Payment initialization error:", error)
    return NextResponse.json({ error: "Failed to initialize payment" }, { status: 500 })
  }
}
