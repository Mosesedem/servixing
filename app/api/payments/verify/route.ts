import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { verifyPayment } from "@/lib/paystack"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { reference } = await req.json()

    if (!reference) {
      return NextResponse.json({ error: "Payment reference required" }, { status: 400 })
    }

    // Verify payment with Paystack
    const paymentData = await verifyPayment(reference)

    if (!paymentData.data) {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 })
    }

    const workOrderId = paymentData.data.metadata?.workOrderId

    if (!workOrderId) {
      return NextResponse.json({ error: "Invalid payment metadata" }, { status: 400 })
    }

    // Verify work order belongs to user
    const workOrder = await prisma.workOrder.findUnique({
      where: { id: workOrderId },
    })

    if (!workOrder || workOrder.userId !== session.user.id) {
      return NextResponse.json({ error: "Work order not found" }, { status: 404 })
    }

    // Update work order based on payment status
    if (paymentData.data.status === "success") {
      await prisma.workOrder.update({
        where: { id: workOrderId },
        data: {
          paymentStatus: "completed",
          finalCost: paymentData.data.amount / 100, // Convert from cents
        },
      })

      return NextResponse.json({
        status: "success",
        message: "Payment completed successfully",
        workOrder: await prisma.workOrder.findUnique({ where: { id: workOrderId } }),
      })
    } else {
      await prisma.workOrder.update({
        where: { id: workOrderId },
        data: {
          paymentStatus: "failed",
        },
      })

      return NextResponse.json({ error: "Payment failed" }, { status: 400 })
    }
  } catch (error) {
    console.error("[v0] Payment verification error:", error)
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 })
  }
}
