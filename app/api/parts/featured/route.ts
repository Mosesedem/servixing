import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const items = await (db as any).featuredItem.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
      take: 24,
    });

    // Normalize to the same shape used by the UI cards
    const parts = (items as any[]).map((it) => ({
      id: it.id,
      title: it.title,
      price: Number(it.price),
      condition: it.condition,
      imageUrl: it.imageUrl,
      seller: it.seller,
      ebayUrl: it.ebayUrl,
      brand: it.brand ?? undefined,
    }));

    return NextResponse.json({ parts, count: parts.length });
  } catch (error) {
    console.error("Featured items fetch error:", error);
    // If table is missing or DB unavailable, return empty list gracefully
    return NextResponse.json({ parts: [], count: 0 });
  }
}
