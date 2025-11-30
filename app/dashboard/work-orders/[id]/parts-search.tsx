"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ExternalLink } from "lucide-react";

interface Part {
  id: string;
  title: string;
  price: number;
  seller: string;
  url: string;
  condition: string;
}

interface PartsSearchProps {
  deviceBrand: string;
  deviceModel: string;
}

export function PartsSearch({ deviceBrand, deviceModel }: PartsSearchProps) {
  const [query, setQuery] = useState("");
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/parts/search?q=${encodeURIComponent(
          query
        )}&brand=${encodeURIComponent(deviceBrand)}`
      );

      if (response.ok) {
        const data = await response.json();
        setParts(data.parts || []);
        setSearched(true);
      }
    } catch (error) {
      console.error(" Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Find Replacement Parts</h2>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <Input
          placeholder={`Search parts for ${deviceBrand} ${deviceModel}...`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button
          type="submit"
          disabled={loading || !query.trim()}
          className="gap-2"
        >
          <Search className="h-4 w-4" />
          {loading ? "Searching..." : "Search"}
        </Button>
      </form>

      {searched && (
        <div className="space-y-3">
          {parts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No parts found for "{query}"
            </p>
          ) : (
            <>
              <p className="text-sm font-semibold mb-3">
                {parts.length} parts found
              </p>
              {parts.map((part) => (
                <div
                  key={part.id}
                  className="border border-border rounded p-4 hover:bg-muted/50 transition"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-1">
                        {part.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        {part.seller} · {part.condition}
                      </p>
                      <p className="text-sm font-semibold text-orange-600">
                        ${Number(part.price).toFixed(2)}
                      </p>
                    </div>
                    <a
                      href={part.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 bg-transparent"
                      >
                        View <ExternalLink className="h-3 w-3" />
                      </Button>
                    </a>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </Card>
  );
}
