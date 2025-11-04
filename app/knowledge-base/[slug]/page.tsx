"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, ThumbsUp, ArrowLeft } from "lucide-react";
import { useSession } from "next-auth/react";

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  views: number;
  helpful: number;
}

function getCategoryColor(category: string) {
  switch (category) {
    case "troubleshooting":
      return "bg-red-100 text-red-800";
    case "repair-guides":
      return "bg-blue-100 text-blue-800";
    case "faq":
      return "bg-purple-100 text-purple-800";
    case "maintenance":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function KnowledgeBaseArticlePage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liking, setLiking] = useState(false);
  const { status } = useSession();
  const isAuthed = status === "authenticated";

  // Prevent multiple likes per browser (simple client-side guard)
  const hasLikedKey = useMemo(() => `kb_${slug}_liked`, [slug]);
  const hasLiked =
    typeof window !== "undefined" && slug
      ? window.localStorage.getItem(hasLikedKey) === "1"
      : false;

  useEffect(() => {
    if (!slug) return;
    let isMounted = true;

    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/knowledge-base/${slug}`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error || "Failed to load article");
        }
        const data: Article = await res.json();
        if (isMounted) setArticle(data);
      } catch (err: any) {
        if (isMounted) setError(err?.message || "Failed to load article");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchArticle();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const onToggleLike = async () => {
    if (!article || !slug || liking) return;

    const liked =
      typeof window !== "undefined" &&
      window.localStorage.getItem(hasLikedKey) === "1";
    const action = liked ? "unlike" : "like";

    try {
      setLiking(true);
      const res = await fetch(`/api/knowledge-base/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        setArticle((prev) =>
          prev
            ? {
                ...prev,
                helpful:
                  typeof data.helpful === "number"
                    ? data.helpful
                    : prev.helpful + (action === "like" ? 1 : -1),
              }
            : prev
        );
        if (typeof window !== "undefined") {
          if (action === "like") {
            window.localStorage.setItem(hasLikedKey, "1");
          } else {
            window.localStorage.removeItem(hasLikedKey);
          }
        }
      }
    } catch (e) {
      // no-op, keep it simple
    } finally {
      setLiking(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/knowledge-base"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Knowledge Base
        </Link>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground">
          Loading article...
        </div>
      ) : error ? (
        <Card className="p-8 text-center">
          <p className="text-red-600 font-medium">{error}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Try going back to the Knowledge Base and opening another article.
          </p>
        </Card>
      ) : !article ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Article not found.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold leading-tight">
              {article.title}
            </h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(
                  article.category
                )}`}
              >
                {article.category}
              </span>
              <span className="inline-flex items-center gap-1">
                <Eye className="h-4 w-4" /> {article.views}
              </span>
              <span className="inline-flex items-center gap-1">
                <ThumbsUp className="h-4 w-4" /> {article.helpful}
              </span>
            </div>
          </div>

          <Card className="p-6">
            {/* Simple rendering to keep it working without extra deps */}
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap wrap-break-word text-sm leading-6">
                {article.content}
              </pre>
            </div>
          </Card>

          <Card className="p-4 flex items-center justify-between">
            <div className="text-sm">Was this article helpful?</div>
            <Button
              onClick={onToggleLike}
              disabled={!isAuthed || liking}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <ThumbsUp className="h-4 w-4 mr-2" />
              {!isAuthed
                ? "Sign in to like"
                : liking
                ? "Submitting..."
                : hasLiked
                ? "Unlike"
                : "Yes, Helpful"}
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
