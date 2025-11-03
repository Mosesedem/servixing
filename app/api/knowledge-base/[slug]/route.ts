import { prisma } from "@/lib/db";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const article = await prisma.knowledgeBaseArticle.findUnique({
      where: { slug },
    });

    if (!article || !article.published) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Increment view count
    await prisma.knowledgeBaseArticle.update({
      where: { slug },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json(article);
  } catch (error) {
    console.error("[v0] Error fetching article:", error);
    return NextResponse.json(
      { error: "Failed to fetch article" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { helpful } = await req.json();

    if (helpful) {
      await prisma.knowledgeBaseArticle.update({
        where: { slug },
        data: { helpful: { increment: 1 } },
      });
    }

    return NextResponse.json({ message: "Thank you for your feedback" });
  } catch (error) {
    console.error("[v0] Error updating article:", error);
    return NextResponse.json(
      { error: "Failed to update article" },
      { status: 500 }
    );
  }
}
