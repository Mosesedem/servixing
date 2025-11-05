import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * GET /api/admin/public-users
 * Get list of public users (users without passwords who submitted requests)
 * Admin only
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get public users (no password) with their activity
    const publicUsers = await prisma.user.findMany({
      where: {
        password: null,
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        createdAt: true,
        _count: {
          select: {
            workOrders: true,
            supportTickets: true,
            devices: true,
            payments: true,
          },
        },
        workOrders: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
        },
        supportTickets: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate engagement metrics
    const stats = {
      total: publicUsers.length,
      withWorkOrders: publicUsers.filter((u) => u._count.workOrders > 0).length,
      withTickets: publicUsers.filter((u) => u._count.supportTickets > 0)
        .length,
      withDevices: publicUsers.filter((u) => u._count.devices > 0).length,
      withPayments: publicUsers.filter((u) => u._count.payments > 0).length,
    };

    // Calculate potential conversion value
    const potentialValue = publicUsers.reduce(
      (sum, user) => sum + user._count.workOrders + user._count.supportTickets,
      0
    );

    return NextResponse.json({
      users: publicUsers.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        createdAt: user.createdAt,
        activity: {
          workOrders: user._count.workOrders,
          supportTickets: user._count.supportTickets,
          devices: user._count.devices,
          payments: user._count.payments,
        },
        lastActivity:
          user.workOrders[0]?.createdAt || user.supportTickets[0]?.createdAt,
        engagementScore:
          user._count.workOrders * 3 +
          user._count.supportTickets * 2 +
          user._count.devices * 1,
      })),
      stats,
      insights: {
        potentialConversions: stats.total,
        highEngagement: publicUsers.filter(
          (u) =>
            u._count.workOrders >= 2 ||
            u._count.supportTickets >= 3 ||
            u._count.payments >= 1
        ).length,
        potentialValue, // Total interactions
      },
    });
  } catch (error) {
    console.error("Get public users error:", error);
    return NextResponse.json(
      { error: "Failed to fetch public users" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/public-users/send-invitation
 * Send registration invitation to public users
 * Admin only
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userIds } = await req.json();

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: "Invalid user IDs" }, { status: 400 });
    }

    // Get users
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds },
        password: null,
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        _count: {
          select: {
            workOrders: true,
            supportTickets: true,
          },
        },
      },
    });

    // TODO: Implement email sending logic here
    // For now, just return success
    // You can use the mailer service to send personalized invitations

    return NextResponse.json({
      success: true,
      message: `Invitations will be sent to ${users.length} users`,
      users: users.map((u) => ({
        email: u.email,
        name: u.name,
        activity: u._count,
      })),
    });
  } catch (error) {
    console.error("Send invitation error:", error);
    return NextResponse.json(
      { error: "Failed to send invitations" },
      { status: 500 }
    );
  }
}
