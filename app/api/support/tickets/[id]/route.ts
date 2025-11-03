import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          include: { user: { select: { name: true, email: true } } },
        },
      },
    });

    if (
      !ticket ||
      (ticket.userId !== session.user.id &&
        (session.user as any).role !== "admin")
    ) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error("[v0] Error fetching ticket:", error);
    return NextResponse.json(
      { error: "Failed to fetch ticket" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
    });

    if (
      !ticket ||
      (ticket.userId !== session.user.id &&
        (session.user as any).role !== "admin")
    ) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const { status, message } = await req.json();

    // Add message if provided
    if (message) {
      await prisma.ticketMessage.create({
        data: {
          ticketId: id,
          userId: session.user.id,
          message,
        },
      });
    }

    // Update status if provided and user is admin
    if (status && (session.user as any).role === "admin") {
      await prisma.supportTicket.update({
        where: { id },
        data: { status },
      });
    }

    return NextResponse.json({ message: "Ticket updated" });
  } catch (error) {
    console.error("[v0] Error updating ticket:", error);
    return NextResponse.json(
      { error: "Failed to update ticket" },
      { status: 500 }
    );
  }
}
