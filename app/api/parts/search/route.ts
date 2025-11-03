import { searchParts } from "@/lib/ebay-parts";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("q");
    const brand = searchParams.get("brand");

    if (!query || !brand) {
      return NextResponse.json(
        { error: "Query and brand required" },
        { status: 400 }
      );
    }

    const parts = await searchParts(query, brand);

    return NextResponse.json({ parts, count: parts.length });
  } catch (error) {
    console.error(" Parts search error:", error);
    return NextResponse.json({ error: "Parts search failed" }, { status: 500 });
  }
}
