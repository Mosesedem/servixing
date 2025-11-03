"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import {
  Search,
  Package,
  DollarSign,
  Shield,
  ExternalLink,
} from "lucide-react";

interface Part {
  id: string;
  title: string;
  price: number;
  condition: string;
  imageUrl: string;
  seller: string;
  ebayUrl: string;
}

export default function PartsSearchPage() {
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("Apple");
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const brands = [
    "Apple",
    "Samsung",
    "Dell",
    "HP",
    "Lenovo",
    "Asus",
    "Acer",
    "Microsoft",
    "Google",
    "OnePlus",
    "Xiaomi",
    "Huawei",
    "Sony",
    "LG",
  ];

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const response = await fetch(
        `/api/parts/search?q=${encodeURIComponent(
          query
        )}&brand=${encodeURIComponent(brand)}`
      );

      if (!response.ok) throw new Error("Search failed");

      const data = await response.json();
      setParts(data.parts || []);
    } catch (error) {
      console.error("Parts search error:", error);
      setParts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Find Device Parts</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Search our extensive catalog of genuine and aftermarket parts for
            all major device brands. No account needed!
          </p>
        </div>

        {/* Search Section */}
        <Card className="p-6 mb-8">
          <div className="space-y-4">
            <div className="grid md:grid-cols-[1fr_200px_auto] gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search for parts (e.g., iPhone 13 screen, laptop battery)"
                  className="pl-10"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>

              <select
                className="h-10 px-3 rounded-md border border-input bg-background"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              >
                {brands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>

              <Button
                onClick={handleSearch}
                disabled={loading || !query.trim()}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">
                Popular searches:
              </span>
              {[
                "iPhone screen",
                "MacBook battery",
                "Samsung display",
                "Dell charger",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setQuery(suggestion);
                    setBrand(
                      suggestion.includes("iPhone") ||
                        suggestion.includes("MacBook")
                        ? "Apple"
                        : suggestion.includes("Samsung")
                        ? "Samsung"
                        : "Dell"
                    );
                  }}
                  className="text-sm px-3 py-1 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Results */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-600 border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">
              Searching parts catalog...
            </p>
          </div>
        )}

        {!loading && searched && parts.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No parts found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or selecting a different brand.
            </p>
          </div>
        )}

        {!loading && parts.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                Found {parts.length} {parts.length === 1 ? "result" : "results"}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {parts.map((part) => (
                <Card
                  key={part.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-square bg-muted relative">
                    <img
                      src={part.imageUrl}
                      alt={part.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="p-4 space-y-3">
                    <h3 className="font-semibold line-clamp-2 min-h-12">
                      {part.title}
                    </h3>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-orange-600 font-bold text-xl">
                        <DollarSign className="h-5 w-5" />
                        {part.price.toFixed(2)}
                      </div>
                      <span className="text-sm px-2 py-1 rounded-full bg-muted">
                        {part.condition}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      Seller: {part.seller}
                    </div>

                    <a
                      href={part.ebayUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button className="w-full bg-orange-600 hover:bg-orange-700">
                        View on eBay
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {!searched && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Start Your Search</h3>
            <p className="text-muted-foreground">
              Enter the device model and part name to find what you need.
            </p>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <Card className="p-6 text-center">
            <Package className="h-12 w-12 mx-auto mb-3 text-orange-600" />
            <h3 className="font-semibold mb-2">Genuine Parts</h3>
            <p className="text-sm text-muted-foreground">
              Access to authentic OEM and high-quality aftermarket parts
            </p>
          </Card>
          <Card className="p-6 text-center">
            <Shield className="h-12 w-12 mx-auto mb-3 text-green-600" />
            <h3 className="font-semibold mb-2">Quality Guaranteed</h3>
            <p className="text-sm text-muted-foreground">
              All parts come with seller guarantees and return policies
            </p>
          </Card>
          <Card className="p-6 text-center">
            <DollarSign className="h-12 w-12 mx-auto mb-3 text-blue-600" />
            <h3 className="font-semibold mb-2">Competitive Pricing</h3>
            <p className="text-sm text-muted-foreground">
              Compare prices from trusted sellers to get the best deals
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
