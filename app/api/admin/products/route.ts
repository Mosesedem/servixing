import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const brand = searchParams.get("brand");
    const status = searchParams.get("status");

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
      ];
    }
    if (category) where.category = category;
    if (brand) where.brand = brand;
    if (status === "active") where.isActive = true;
    if (status === "inactive") where.isActive = false;

    const products = await db.product.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
    });

    const total = await db.product.count({ where });

    return NextResponse.json({
      products,
      total,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    console.error("Admin products API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      price,
      currency,
      category,
      brand,
      model,
      condition,
      stock,
      images,
    } = body;

    if (!name || !price || !category || !brand) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const product = await db.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        currency: currency || "NGN",
        category,
        brand,
        model,
        condition: condition || "new",
        stock: parseInt(stock) || 0,
        images: images || [],
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
