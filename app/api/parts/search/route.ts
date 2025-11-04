import { searchParts } from "@/lib/ebay-parts";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("q");
    const brand = searchParams.get("brand");
    const page = Number(searchParams.get("page") || "1");
    const perPage = Number(searchParams.get("perPage") || "24");
    const sort = (searchParams.get("sort") || "best_match") as any; // best_match | price_asc | price_desc
    const condition = (searchParams.get("condition") || "any") as any; // any | new | used | refurbished | for_parts
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    if (!query || !brand) {
      return NextResponse.json(
        { error: "Query and brand required" },
        { status: 400 }
      );
    }

    const {
      items,
      total,
      page: p,
      perPage: pp,
    } = await searchParts(query, brand, {
      page: isFinite(page) ? page : 1,
      perPage: isFinite(perPage) ? perPage : 24,
      sort,
      condition,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    });

    return NextResponse.json({
      parts: items,
      count: items.length,
      total,
      page: p,
      perPage: pp,
    });
  } catch (error) {
    console.error(" Parts search error:", error);
    return NextResponse.json({ error: "Parts search failed" }, { status: 500 });
  }
}
