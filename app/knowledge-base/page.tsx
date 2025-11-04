"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Eye, ThumbsUp } from "lucide-react";
import { useSession } from "next-auth/react";

interface Article {
  id: string;
  title: string;
  slug: string;
  category: string;
  views: number;
  helpful: number;
}

export default function KnowledgeBasePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [likingSlug, setLikingSlug] = useState<string | null>(null);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const { status } = useSession();
  const isAuthed = status === "authenticated";

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        let url = "/api/knowledge-base";
        const params = new URLSearchParams();
        if (searchQuery) params.append("search", searchQuery);
        if (selectedCategory) params.append("category", selectedCategory);
        if (params.toString()) url += "?" + params.toString();

        const response = await fetch(url);
        if (response.ok) {
          const data: Article[] = await response.json();
          setArticles(data);

          // initialize liked map from localStorage
          const map: Record<string, boolean> = {};
          if (typeof window !== "undefined") {
            for (const a of data) {
              const key = `kb_${a.slug}_liked`;
              map[a.slug] = window.localStorage.getItem(key) === "1";
            }
          }
          setLiked(map);
        }
      } catch (error) {
        console.error(" Error fetching articles:", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchArticles();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);

  const categories = ["troubleshooting", "repair-guides", "faq", "maintenance"];

  const getCategoryColor = (category: string) => {
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
  };

  const handleToggleLike = async (e: React.MouseEvent, slug: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (likingSlug) return;
    const key = `kb_${slug}_liked`;
    const isLiked = liked[slug] === true;
    const action = isLiked ? "unlike" : "like";
    try {
      setLikingSlug(slug);
      const res = await fetch(`/api/knowledge-base/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json().catch(() => ({}));
      setArticles((prev) =>
        prev.map((a) =>
          a.slug === slug
            ? {
                ...a,
                helpful:
                  typeof data.helpful === "number"
                    ? data.helpful
                    : a.helpful + (action === "like" ? 1 : -1),
              }
            : a
        )
      );
      if (typeof window !== "undefined") {
        if (action === "like") {
          window.localStorage.setItem(key, "1");
        } else {
          window.localStorage.removeItem(key);
        }
      }
      setLiked((prev) => ({ ...prev, [slug]: action === "like" }));
    } catch (err) {
      // ignore
    } finally {
      setLikingSlug(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Knowledge Base</h1>
        <p className="text-muted-foreground">
          Find answers to common questions and learn how to repair your devices
        </p>
      </div>

      {/* Search & Filter */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory("")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              selectedCategory === ""
                ? "bg-orange-600 text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${
                selectedCategory === cat
                  ? "bg-orange-600 text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Articles */}
      {loading ? (
        <div className="text-center text-muted-foreground">
          Loading articles...
        </div>
      ) : articles.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No articles found</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {articles.map((article) => (
            <Link key={article.id} href={`/knowledge-base/${article.slug}`}>
              <Card className="p-6 hover:bg-muted/50 cursor-pointer transition">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold mb-2">
                      {article.title}
                    </h2>
                    <div className="flex gap-3 items-center text-sm text-muted-foreground">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(
                          article.category
                        )}`}
                      >
                        {article.category}
                      </span>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {article.views}
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        {article.helpful}
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <Button
                      size="sm"
                      className="bg-orange-600 hover:bg-orange-700"
                      disabled={!isAuthed || likingSlug === article.slug}
                      onClick={(e) => handleToggleLike(e, article.slug)}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      {isAuthed
                        ? liked[article.slug]
                          ? "Unlike"
                          : "Like"
                        : "Sign in to like"}
                    </Button>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
