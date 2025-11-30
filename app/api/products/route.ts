import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import Fuse from "fuse.js";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const brand = searchParams.get("brand");
    const search = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const baseWhere: any = {
      isActive: true,
    };

    if (category) baseWhere.category = category;
    if (brand) baseWhere.brand = brand;

    let products: any[];
    let total: number;
    let hasMore: boolean;

    if (search) {
      // Fetch all matching products for fuzzy search
      const allProducts = await db.product.findMany({
        where: baseWhere,
        orderBy: { createdAt: "desc" },
      });

      const fuse = new Fuse(allProducts, {
        keys: ["name", "description", "brand", "model"],
        threshold: 0.3, // Adjust for fuzziness (0 = exact, 1 = very fuzzy)
        includeScore: true,
      });

      const fuseResults = fuse.search(search);
      const results = fuseResults.map((r) => r.item);

      total = results.length;
      products = results.slice(offset, offset + limit);
      hasMore = offset + limit < total;
    } else {
      products = await db.product.findMany({
        where: baseWhere,
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
      });

      total = await db.product.count({ where: baseWhere });
      hasMore = offset + limit < total;
    }

    return NextResponse.json({
      products,
      total,
      hasMore,
    });
  } catch (error) {
    console.error("Products API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
