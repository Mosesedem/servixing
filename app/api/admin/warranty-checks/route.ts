import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * GET /api/admin/warranty-checks
 * Get list of warranty checks
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

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (status) where.status = status;

    if (search) {
      where.OR = [
        { provider: { contains: search, mode: "insensitive" } },
        {
          workOrder: {
            user: {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
              ],
            },
          },
        },
        {
          workOrder: {
            device: {
              OR: [
                { brand: { contains: search, mode: "insensitive" } },
                { model: { contains: search, mode: "insensitive" } },
                { serialNumber: { contains: search, mode: "insensitive" } },
                { imei: { contains: search, mode: "insensitive" } },
              ],
            },
          },
        },
      ];
    }

    const [checks, total] = await Promise.all([
      prisma.warrantyCheck.findMany({
        where,
        include: {
          workOrder: {
            select: {
              id: true,
              paymentStatus: true,
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
              device: {
                select: {
                  brand: true,
                  model: true,
                  serialNumber: true,
                  imei: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.warrantyCheck.count({ where }),
    ]);

    return NextResponse.json({
      checks,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get warranty checks error:", error);
    return NextResponse.json(
      { error: "Failed to fetch warranty checks" },
      { status: 500 }
    );
  }
}
