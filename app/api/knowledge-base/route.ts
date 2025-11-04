import { prisma } from "@/lib/db";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const where: any = { published: true };
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    const articles = await prisma.knowledgeBaseArticle.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(articles);
  } catch (error) {
    console.error(" Error fetching articles:", error);
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const newArticle = await prisma.knowledgeBaseArticle.create({
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        category: data.category,
        published: data.published || false,
      },
    });

    return NextResponse.json(newArticle, { status: 201 });
  } catch (error) {
    console.error(" Error creating article:", error);
    return NextResponse.json(
      { error: "Failed to create article" },
      { status: 500 }
    );
  }
}
