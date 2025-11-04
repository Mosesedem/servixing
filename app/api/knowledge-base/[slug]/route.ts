import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const existing = await prisma.knowledgeBaseArticle.findUnique({
      where: { slug },
    });

    if (!existing || !existing.published) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Increment view count and return the updated article
    const updated = await prisma.knowledgeBaseArticle.update({
      where: { slug },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(" Error fetching article:", error);
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
    // Require authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const body = await req.json().catch(() => ({} as any));
    const action: "like" | "unlike" | undefined = body.action
      ? body.action
      : body.helpful
      ? "like"
      : undefined;

    // Validate article exists
    const article = await prisma.knowledgeBaseArticle.findUnique({
      where: { slug },
      select: { helpful: true },
    });
    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    let updatedHelpful = article.helpful;

    if (action === "like") {
      const updated = await prisma.knowledgeBaseArticle.update({
        where: { slug },
        data: { helpful: { increment: 1 } },
        select: { helpful: true },
      });
      updatedHelpful = updated.helpful;
    } else if (action === "unlike") {
      if (article.helpful > 0) {
        const updated = await prisma.knowledgeBaseArticle.update({
          where: { slug },
          data: { helpful: { decrement: 1 } },
          select: { helpful: true },
        });
        updatedHelpful = updated.helpful;
      }
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({
      message: action === "like" ? "Thanks for liking" : "Like removed",
      helpful: updatedHelpful,
    });
  } catch (error) {
    console.error(" Error updating article:", error);
    return NextResponse.json(
      { error: "Failed to update article" },
      { status: 500 }
    );
  }
}
