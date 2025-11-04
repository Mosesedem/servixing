import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { UserRole } from "@prisma/client";

// GET /api/admin/support/tickets
// Admin-only: list tickets with filters. Some filters applied in-memory for JSON metadata.
export async function GET(req: NextRequest) {
  try {
    await requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]);

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim().toLowerCase() || "";
    const status = searchParams.get("status") || undefined;
    const priority = searchParams.get("priority") || undefined;
    const dropoffType = searchParams.get("dropoffType") || undefined;
    const deviceType = searchParams.get("deviceType") || undefined;
    const brand = searchParams.get("brand") || undefined;
    const hasImagesParam = searchParams.get("hasImages");
    const hasImages =
      hasImagesParam === "true"
        ? true
        : hasImagesParam === "false"
        ? false
        : undefined;
    const city = searchParams.get("city") || undefined;
    const state = searchParams.get("state") || undefined;
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const limit = Math.min(parseInt(searchParams.get("limit") || "200"), 500);

    // Base DB filters (non-JSON fields)
    const where: any = {};
    if (status) where.status = status as any;
    if (priority) where.priority = priority;

    // Fetch recent tickets
    const tickets = await prisma.supportTicket.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: { select: { name: true, email: true, phone: true } },
        messages: { select: { id: true }, take: 1 },
      },
    });

    // In-memory filters leveraging metadata
    const filtered = tickets.filter((t) => {
      const md: any = (t as any).metadata || {};
      const mdDevice = md.device || {};
      const mdAddress = md.address || {};

      if (dropoffType && md.dropoffType !== dropoffType) return false;
      if (deviceType && mdDevice.deviceType !== deviceType) return false;
      if (brand && mdDevice.brand !== brand) return false;
      if (typeof hasImages === "boolean") {
        const count = Array.isArray(md.images) ? md.images.length : 0;
        if (hasImages && count === 0) return false;
        if (!hasImages && count > 0) return false;
      }
      if (city && mdAddress.city !== city) return false;
      if (state && mdAddress.state !== state) return false;

      if (from || to) {
        const createdAt = new Date(t.createdAt).getTime();
        if (from && createdAt < new Date(from).getTime()) return false;
        if (to && createdAt > new Date(to).getTime()) return false;
      }

      if (q) {
        const hay = [
          t.title,
          t.description,
          t.priority,
          t.status,
          t.user?.name,
          t.user?.email,
          md.issue,
          mdDevice.deviceType,
          mdDevice.brand,
          mdDevice.model,
          md.dropoffType,
          mdAddress.city,
          mdAddress.state,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });

    // Shape response
    const data = filtered.map((t) => {
      const md: any = (t as any).metadata || {};
      return {
        id: t.id,
        title: t.title,
        status: t.status,
        priority: t.priority,
        createdAt: t.createdAt,
        user: t.user,
        device: md.device || null,
        dropoffType: md.dropoffType || null,
        address: md.address || null,
        imagesCount: Array.isArray(md.images) ? md.images.length : 0,
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Admin tickets list error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to fetch tickets" },
      },
      { status: 500 }
    );
  }
}
