"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Search,
  Package,
  DollarSign,
  Shield,
  ExternalLink,
  Menu,
  X,
  Filter,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { Drawer } from "vaul";
import { useSession } from "next-auth/react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { ImageUpload } from "@/components/image-upload";

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
  const { data: session } = useSession();
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("Apple");
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [featured, setFeatured] = useState<Part[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selected, setSelected] = useState<Part | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage] = useState(24);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState<"best_match" | "price_asc" | "price_desc">(
    "best_match"
  );
  const [condition, setCondition] = useState<
    "any" | "new" | "used" | "refurbished" | "for_parts"
  >("any");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortVisible, isSortVisible] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestForm, setRequestForm] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    phone: "",
    deviceType: "",
    brand: "",
    model: "",
    serialNumber: "",
    partName: "",
    quantity: 1,
    deliveryType: "PICKUP" as "PICKUP" | "DELIVERY",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    landmark: "",
    customerRequest: "",
  });
  const [requestImages, setRequestImages] = useState<File[]>([]);
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [requestSuccess, setRequestSuccess] = useState(false);
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

  const deviceTypes = [
    "Smartphone",
    "Laptop",
    "Tablet",
    "Desktop",
    "Monitor",
    "Smartwatch",
    "Other",
  ];

  const handleSearch = async (pageOverride?: number) => {
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const effectivePage = pageOverride ?? page;
      const url = new URL("/api/parts/search", window.location.origin);
      url.searchParams.set("q", query);
      url.searchParams.set("brand", brand);
      url.searchParams.set("page", String(effectivePage));
      url.searchParams.set("perPage", String(perPage));
      url.searchParams.set("sort", sort);
      url.searchParams.set("condition", condition);
      if (minPrice) url.searchParams.set("minPrice", minPrice);
      if (maxPrice) url.searchParams.set("maxPrice", maxPrice);

      const response = await fetch(url.toString());

      if (!response.ok) throw new Error("Search failed");

      const data = await response.json();
      setParts(data.parts || []);
      setTotal(Number(data.total || 0));
      // ensure page reflects backend echo
      if (typeof data.page === "number") setPage(data.page);
    } catch (error) {
      console.error("Parts search error:", error);
      setParts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setRequestForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestError("");
    setRequestLoading(true);

    try {
      if (
        !requestForm.name ||
        !requestForm.email ||
        !requestForm.phone ||
        !requestForm.deviceType ||
        !requestForm.brand ||
        !requestForm.partName ||
        !requestForm.serialNumber
      ) {
        setRequestError("Please fill in all required fields");
        setRequestLoading(false);
        return;
      }

      if (requestForm.deliveryType === "DELIVERY") {
        if (
          !requestForm.addressLine1 ||
          !requestForm.city ||
          !requestForm.state
        ) {
          setRequestError(
            "Please provide address line 1, city, and state for delivery"
          );
          setRequestLoading(false);
          return;
        }
      }

      if (requestImages.length > 3) {
        setRequestError("Maximum 3 images allowed");
        setRequestLoading(false);
        return;
      }
      for (const file of requestImages) {
        if (file.size > 5 * 1024 * 1024) {
          setRequestError("Each image must be 5MB or smaller");
          setRequestLoading(false);
          return;
        }
      }

      const addressText =
        requestForm.deliveryType === "DELIVERY"
          ? [
              requestForm.addressLine1,
              requestForm.addressLine2,
              `${requestForm.city}${
                requestForm.state ? ", " + requestForm.state : ""
              }`,
              requestForm.postalCode,
              requestForm.landmark ? `Landmark: ${requestForm.landmark}` : "",
            ]
              .filter(Boolean)
              .join("\n")
          : "Pickup at service center";

      let imageUrls: string[] = [];
      if (session?.user?.id) {
        if (requestImages.length > 0) {
          const fd = new FormData();
          requestImages.forEach((file) => fd.append("images", file));
          const uploadRes = await fetch("/api/devices/upload", {
            method: "POST",
            body: fd,
          });
          if (!uploadRes.ok) {
            const data = await uploadRes.json().catch(() => ({}));
            throw new Error(
              data?.error?.message ||
                "Failed to upload images. Please try again."
            );
          }
          const uploadData = await uploadRes.json();
          imageUrls = uploadData?.data?.images || [];
        }

        const ticketResponse = await fetch("/api/support/tickets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: `Parts Purchase Request: ${requestForm.partName}`,
            description: `
**Customer Details:**
- Name: ${requestForm.name}
- Email: ${requestForm.email}
- Phone: ${requestForm.phone}

**Device Information:**
- Type: ${requestForm.deviceType}
- Brand: ${requestForm.brand}
- Model: ${requestForm.model || "Not specified"}
- Serial Number: ${requestForm.serialNumber}

**Part Requested:**
- Part: ${requestForm.partName}
- Quantity: ${requestForm.quantity}

**Delivery Method:**
${
  requestForm.deliveryType === "PICKUP"
    ? "Pickup at service center"
    : `Delivery to:\n${addressText}`
}

${
  requestForm.customerRequest
    ? `\n**Customer Request:**\n${requestForm.customerRequest}`
    : ""
}

${
  imageUrls.length
    ? `\n**Attached Images:**\n${imageUrls
        .map((u, i) => `![Image ${i + 1}](${u})`)
        .join("\n")}`
    : ""
}
            `,
            priority: "normal",
            metadata: {
              contact: {
                name: requestForm.name,
                email: requestForm.email,
                phone: requestForm.phone,
              },
              device: {
                deviceType: requestForm.deviceType,
                brand: requestForm.brand,
                model: requestForm.model || null,
                serialNumber: requestForm.serialNumber,
              },
              part: {
                partName: requestForm.partName,
                quantity: requestForm.quantity,
              },
              deliveryType: requestForm.deliveryType,
              address:
                requestForm.deliveryType === "DELIVERY"
                  ? {
                      addressLine1: requestForm.addressLine1,
                      addressLine2: requestForm.addressLine2,
                      city: requestForm.city,
                      state: requestForm.state,
                      postalCode: requestForm.postalCode,
                      landmark: requestForm.landmark,
                    }
                  : null,
              customerRequest: requestForm.customerRequest || null,
              images: imageUrls,
              submittedAt: new Date().toISOString(),
              source: "authenticated_parts_request",
            },
          }),
        });

        if (!ticketResponse.ok) {
          const data = await ticketResponse.json();
          throw new Error(data.error || "Failed to submit parts request");
        }

        setRequestSuccess(true);
      } else {
        const fd = new FormData();
        fd.set("name", requestForm.name);
        fd.set("email", requestForm.email);
        fd.set("phone", requestForm.phone);
        fd.set("deviceType", requestForm.deviceType);
        fd.set("brand", requestForm.brand);
        fd.set("model", requestForm.model || "");
        fd.set("serialNumber", requestForm.serialNumber);
        fd.set("partName", requestForm.partName);
        fd.set("quantity", requestForm.quantity.toString());
        fd.set("deliveryType", requestForm.deliveryType);
        if (requestForm.deliveryType === "DELIVERY") {
          fd.set("addressLine1", requestForm.addressLine1);
          fd.set("addressLine2", requestForm.addressLine2 || "");
          fd.set("city", requestForm.city);
          fd.set("state", requestForm.state);
          fd.set("postalCode", requestForm.postalCode || "");
          fd.set("landmark", requestForm.landmark || "");
        }
        if (requestForm.customerRequest)
          fd.set("customerRequest", requestForm.customerRequest);
        requestImages.forEach((file) => fd.append("images", file));

        const resp = await fetch("/api/public/parts-request", {
          method: "POST",
          body: fd,
        });
        if (!resp.ok) {
          const data = await resp.json().catch(() => ({}));
          throw new Error(
            data?.error?.message || "Failed to submit parts request"
          );
        }
        setRequestSuccess(true);
      }
    } catch (err) {
      setRequestError(err instanceof Error ? err.message : "An error occurred");
      setRequestLoading(false);
    }
  };

  // Load featured items once
  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const res = await fetch("/api/parts/featured", { cache: "no-store" });
        const data = await res.json();
        setFeatured(data.parts || []);
      } catch (e) {
        console.error("Featured parts error:", e);
      }
    };
    loadFeatured();
  }, []);

  // Responsive: use drawer on mobile, sheet (dialog) on desktop
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const set = () => setIsDesktop(mql.matches);
    set();
    mql.addEventListener("change", set);
    return () => mql.removeEventListener("change", set);
  }, []);

  const openPreview = (part: Part) => {
    setSelected(part);
    setPreviewOpen(true);
  };

  const fallbackSrc = "/images/accessories.png";
  const onImgError = (e: any) => {
    const t = e.currentTarget as HTMLImageElement;
    if (!t || t.src.includes("accessories.png")) return;
    t.src = fallbackSrc;
  };

  return (
    <div className="min-h-screen bg-background py-20">
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
                onClick={() => {
                  setPage(1);
                  handleSearch(1);
                }}
                disabled={loading || !query.trim()}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>

            <button
              onClick={() => isSortVisible(!sortVisible)}
              className=" p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-300"
              aria-label={sortVisible ? "Close menu" : "Open menu"}
              aria-expanded={sortVisible}
            >
              {sortVisible ? (
                <span className="relative flex">
                  <X className="h-6 w-6" /> Close
                </span>
              ) : (
                <span className="relative flex">
                  <Filter className="h-6 w-6" /> Sort
                </span>
              )}
            </button>

            {sortVisible && (
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">
                    Sort
                  </label>
                  <select
                    className="flex items-center justify-center h-10 w-full px-3 rounded-md border border-input bg-background"
                    value={sort}
                    onChange={(e) => setSort(e.target.value as any)}
                  >
                    <option value="best_match">Best match</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">
                    Condition
                  </label>
                  <select
                    className="h-10 w-full px-3 rounded-md border border-input bg-background"
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as any)}
                  >
                    <option value="any">Any</option>
                    <option value="new">New</option>
                    <option value="used">Used</option>
                    <option value="refurbished">Refurbished</option>
                    <option value="for_parts">For Scraps</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">
                    Min Price ($)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">
                    Max Price ($)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="col-span-2 flex items-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPage(1);
                      handleSearch(1);
                    }}
                    disabled={loading || !query.trim()}
                    className="flex-1"
                  >
                    Apply Filters
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSort("best_match");
                      setCondition("any");
                      setMinPrice("");
                      setMaxPrice("");
                    }}
                    disabled={loading}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            )}
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

        {/* Featured Section */}
        {featured.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Featured</h2>
              <p className="text-sm text-muted-foreground">
                Curated parts from our catalog
              </p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {featured.map((part) => (
                <Card
                  key={part.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-square bg-muted relative">
                    <img
                      src={part.imageUrl || fallbackSrc}
                      alt={part.title}
                      className="object-cover w-full h-full"
                      onError={onImgError}
                    />
                    <span className="absolute left-2 top-2 text-xs bg-orange-600 text-white px-2 py-0.5 rounded">
                      Featured
                    </span>
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
                      <Shield className="h-4 w-4" /> Seller: {part.seller}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => openPreview(part)}
                        variant="secondary"
                      >
                        Preview
                      </Button>
                      <a
                        href={part.ebayUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <Button className="w-full bg-orange-600 hover:bg-orange-700">
                          Buy on eBay <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                      </a>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

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
          <div className="text-center py-12 flex flex-col items-center ">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No parts found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or selecting a different brand.
            </p>
            <div className="pt-20">
              <button
                onClick={() => setRequestOpen(true)}
                className="justify-center bg-orange-600 text-white p-4 rounded-full shadow-lg hover:bg-orange-700 z-40 flex items-center gap-2"
                aria-label="Request for Parts"
                hidden={requestOpen}
              >
                <Package className="h-6 w-6" />
                <span className="">Request for Parts</span>
              </button>
            </div>
          </div>
        )}

        {!loading && parts.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                Showing {parts.length} of {total} • Page {page} of{" "}
                {Math.max(1, Math.ceil(total / perPage))}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    const newPage = Math.max(1, page - 1);
                    setPage(newPage);
                    handleSearch(newPage);
                    if (typeof window !== "undefined")
                      window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  disabled={page <= 1 || loading}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    const pageCount = Math.max(1, Math.ceil(total / perPage));
                    const newPage = Math.min(pageCount, page + 1);
                    setPage(newPage);
                    handleSearch(newPage);
                    if (typeof window !== "undefined")
                      window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  disabled={
                    page >= Math.max(1, Math.ceil(total / perPage)) || loading
                  }
                >
                  Next
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {parts.map((part) => (
                <Card
                  key={part.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-square bg-muted relative">
                    <img
                      src={part.imageUrl || fallbackSrc}
                      alt={part.title}
                      className="object-cover w-full h-full"
                      onError={onImgError}
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

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => openPreview(part)}
                        variant="secondary"
                      >
                        Preview
                      </Button>
                      <a
                        href={part.ebayUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <Button className="w-full bg-orange-600 hover:bg-orange-700">
                          Buy on eBay
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                      </a>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex items-center justify-between mt-6">
              <p className="text-muted-foreground">
                Showing {parts.length} of {total} • Page {page} of{" "}
                {Math.max(1, Math.ceil(total / perPage))}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    const newPage = Math.max(1, page - 1);
                    setPage(newPage);
                    handleSearch(newPage);
                    if (typeof window !== "undefined")
                      window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  disabled={page <= 1 || loading}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    const pageCount = Math.max(1, Math.ceil(total / perPage));
                    const newPage = Math.min(pageCount, page + 1);
                    setPage(newPage);
                    handleSearch(newPage);
                    if (typeof window !== "undefined")
                      window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  disabled={
                    page >= Math.max(1, Math.ceil(total / perPage)) || loading
                  }
                >
                  Next
                </Button>
              </div>
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
        {/* <div className="mt-16 grid md:grid-cols-3 gap-6">
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
        </div> */}
      </div>

      {/* Floating Request Button */}
      <button
        onClick={() => setRequestOpen(true)}
        className="fixed bottom-6 right-6 bg-orange-600 text-white p-4 rounded-full shadow-lg hover:bg-orange-700 z-40 flex items-center gap-2"
        aria-label="Request for Parts"
        hidden={requestOpen}
      >
        <Package className="h-6 w-6" />
        <span className="hidden md:inline">Request for Parts</span>
      </button>

      {/* Preview Sheet/Drawer */}
      {selected &&
        (isDesktop ? (
          <Dialog.Root open={previewOpen} onOpenChange={setPreviewOpen}>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/50" />
              <Dialog.Content className="fixed right-0 top-0 h-full w-full max-w-md bg-background shadow-xl focus:outline-none">
                <div className="p-4 border-b flex items-center justify-between">
                  <Dialog.Title className="text-lg font-semibold line-clamp-2 pr-8">
                    {selected.title}
                  </Dialog.Title>
                  <Dialog.Close asChild>
                    <button className="text-sm text-muted-foreground hover:text-foreground">
                      Close
                    </button>
                  </Dialog.Close>
                </div>
                <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-56px)]">
                  <div className="aspect-square bg-muted">
                    <img
                      src={selected.imageUrl || fallbackSrc}
                      alt={selected.title}
                      className="w-full h-full object-cover"
                      onError={onImgError}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-orange-600 font-bold text-2xl">
                      <DollarSign className="h-6 w-6" />{" "}
                      {selected.price.toFixed(2)}
                    </div>
                    <span className="text-sm px-2 py-1 rounded-full bg-muted">
                      {selected.condition}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Seller: {selected.seller}
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <a
                      href={selected.ebayUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button className="w-full bg-orange-600 hover:bg-orange-700">
                        View details <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </a>
                    <Dialog.Close asChild>
                      <Button variant="secondary" className="w-full">
                        Close
                      </Button>
                    </Dialog.Close>
                  </div>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        ) : (
          <Drawer.Root open={previewOpen} onOpenChange={setPreviewOpen}>
            <Drawer.Portal>
              <Drawer.Overlay className="fixed inset-0 bg-black/50" />
              <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 mt-24 flex h-[85vh] flex-col rounded-t-[10px] bg-background">
                <div className="mx-auto mt-4 h-2 w-12 rounded-full bg-muted" />
                <div className="p-4 overflow-y-auto">
                  <div className="mb-3 text-lg font-semibold line-clamp-2">
                    {selected.title}
                  </div>
                  <div className="aspect-square bg-muted">
                    <img
                      src={selected.imageUrl || fallbackSrc}
                      alt={selected.title}
                      className="w-full h-full object-cover"
                      onError={onImgError}
                    />
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="flex items-center gap-1 text-orange-600 font-bold text-2xl">
                      <DollarSign className="h-6 w-6" />{" "}
                      {selected.price.toFixed(2)}
                    </div>
                    <span className="text-sm px-2 py-1 rounded-full bg-muted">
                      {selected.condition}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Seller: {selected.seller}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <a
                      href={selected.ebayUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button className="w-full bg-orange-600 hover:bg-orange-700">
                        View details <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </a>
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => setPreviewOpen(false)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>
        ))}

      {/* Request Modal */}
      {requestOpen &&
        (isDesktop ? (
          <Dialog.Root open={requestOpen} onOpenChange={setRequestOpen}>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/50 " />
              <Dialog.Content className="fixed right-0 top-15 h-full w-full max-w-md bg-background shadow-xl focus:outline-none overflow-y-auto">
                <div className="p-6">
                  <Dialog.Title className="text-lg font-semibold mb-4">
                    Request for Parts
                  </Dialog.Title>
                  {requestSuccess ? (
                    <div className="text-center">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                      <h3 className="text-xl font-semibold mb-2">
                        Request Submitted!
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        We'll contact you soon with details.
                      </p>
                      <Button
                        onClick={() => {
                          setRequestOpen(false);
                          setRequestSuccess(false);
                        }}
                      >
                        Close
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitRequest} className="space-y-4">
                      {requestError && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                          <AlertCircle className="h-5 w-5 text-red-600 inline mr-2" />
                          {requestError}
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Full Name *
                        </label>
                        <Input
                          name="name"
                          value={requestForm.name}
                          onChange={handleRequestChange}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Email *
                        </label>
                        <Input
                          name="email"
                          type="email"
                          value={requestForm.email}
                          onChange={handleRequestChange}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Phone *
                        </label>
                        <Input
                          name="phone"
                          value={requestForm.phone}
                          onChange={handleRequestChange}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Device Type *
                        </label>
                        <select
                          name="deviceType"
                          value={requestForm.deviceType}
                          onChange={handleRequestChange}
                          className="w-full px-3 py-2 border rounded"
                          required
                        >
                          <option value="">Select</option>
                          {deviceTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Brand *
                        </label>
                        <select
                          name="brand"
                          value={requestForm.brand}
                          onChange={handleRequestChange}
                          className="w-full px-3 py-2 border rounded"
                          required
                        >
                          <option value="">Select</option>
                          {brands.map((brand) => (
                            <option key={brand} value={brand}>
                              {brand}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Model
                        </label>
                        <Input
                          name="model"
                          value={requestForm.model}
                          onChange={handleRequestChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Serial Number *
                        </label>
                        <Input
                          name="serialNumber"
                          value={requestForm.serialNumber}
                          onChange={handleRequestChange}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Part Name *
                        </label>
                        <Input
                          name="partName"
                          value={requestForm.partName}
                          onChange={handleRequestChange}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Quantity
                        </label>
                        <Input
                          name="quantity"
                          type="number"
                          min="1"
                          value={requestForm.quantity}
                          onChange={handleRequestChange}
                        />
                      </div>

                      {/* Delivery Type */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-base">
                          Delivery Method
                        </h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <label
                            className={`relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                              requestForm.deliveryType === "PICKUP"
                                ? "border-orange-600 bg-orange-50 dark:bg-orange-900/20"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                          >
                            <input
                              type="radio"
                              name="deliveryType"
                              value="PICKUP"
                              checked={requestForm.deliveryType === "PICKUP"}
                              onChange={handleRequestChange}
                              className="mt-1"
                            />
                            <div className="ml-3">
                              <div className="font-semibold">
                                Pickup at Center
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Collect your item from our service center
                              </div>
                            </div>
                          </label>
                          <label
                            className={`relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                              requestForm.deliveryType === "DELIVERY"
                                ? "border-orange-600 bg-orange-50 dark:bg-orange-900/20"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                          >
                            <input
                              type="radio"
                              name="deliveryType"
                              value="DELIVERY"
                              checked={requestForm.deliveryType === "DELIVERY"}
                              onChange={handleRequestChange}
                              className="mt-1"
                            />
                            <div className="ml-3">
                              <div className="font-semibold">Home Delivery</div>
                              <div className="text-sm text-muted-foreground">
                                We'll deliver to your address
                              </div>
                            </div>
                          </label>
                        </div>
                        {requestForm.deliveryType === "DELIVERY" && (
                          <div className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="block text-sm font-medium">
                                  Address Line 1 *
                                </label>
                                <Input
                                  name="addressLine1"
                                  value={requestForm.addressLine1}
                                  onChange={handleRequestChange}
                                  placeholder="Street address"
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="block text-sm font-medium">
                                  Address Line 2
                                </label>
                                <Input
                                  name="addressLine2"
                                  value={requestForm.addressLine2}
                                  onChange={handleRequestChange}
                                  placeholder="Apartment, suite, etc."
                                />
                              </div>
                            </div>
                            <div className="grid md:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <label className="block text-sm font-medium">
                                  City *
                                </label>
                                <Input
                                  name="city"
                                  value={requestForm.city}
                                  onChange={handleRequestChange}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="block text-sm font-medium">
                                  State *
                                </label>
                                <Input
                                  name="state"
                                  value={requestForm.state}
                                  onChange={handleRequestChange}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="block text-sm font-medium">
                                  Postal Code
                                </label>
                                <Input
                                  name="postalCode"
                                  value={requestForm.postalCode}
                                  onChange={handleRequestChange}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="block text-sm font-medium">
                                Landmark
                              </label>
                              <Input
                                name="landmark"
                                value={requestForm.landmark}
                                onChange={handleRequestChange}
                                placeholder="Nearby landmark or delivery note"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Images */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Device Images (up to 3, 5MB each)
                        </label>
                        <ImageUpload
                          value={requestImages}
                          onChange={setRequestImages}
                          maxFiles={3}
                          maxSize={5}
                          disabled={requestLoading}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Additional Request
                        </label>
                        <textarea
                          name="customerRequest"
                          value={requestForm.customerRequest}
                          onChange={handleRequestChange}
                          rows={3}
                          className="w-full px-3 py-2 border rounded"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={requestLoading}
                        className="w-full bg-orange-600 hover:bg-orange-700"
                      >
                        {requestLoading ? <LoadingSpinner /> : "Submit Request"}
                      </Button>
                    </form>
                  )}
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        ) : (
          <Drawer.Root open={requestOpen} onOpenChange={setRequestOpen}>
            <Drawer.Portal>
              <Drawer.Overlay className="fixed inset-0 bg-black/50" />
              <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 mt-24 flex h-[85vh] flex-col rounded-t-[10px] bg-background">
                <div className="mx-auto mt-4 h-2 w-12 rounded-full bg-muted" />
                <div className="p-4 overflow-y-auto">
                  <div className="mb-4 text-lg font-semibold">
                    Request for Parts
                  </div>
                  {requestSuccess ? (
                    <div className="text-center">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                      <h3 className="text-xl font-semibold mb-2">
                        Request Submitted!
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        We'll contact you soon with details.
                      </p>
                      <Button
                        onClick={() => {
                          setRequestOpen(false);
                          setRequestSuccess(false);
                        }}
                        className="w-full"
                      >
                        Close
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitRequest} className="space-y-4">
                      {requestError && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                          <AlertCircle className="h-5 w-5 text-red-600 inline mr-2" />
                          {requestError}
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Full Name *
                        </label>
                        <Input
                          name="name"
                          value={requestForm.name}
                          onChange={handleRequestChange}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Email *
                        </label>
                        <Input
                          name="email"
                          type="email"
                          value={requestForm.email}
                          onChange={handleRequestChange}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Phone *
                        </label>
                        <Input
                          name="phone"
                          value={requestForm.phone}
                          onChange={handleRequestChange}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Device Type *
                        </label>
                        <select
                          name="deviceType"
                          value={requestForm.deviceType}
                          onChange={handleRequestChange}
                          className="w-full px-3 py-2 border rounded"
                          required
                        >
                          <option value="">Select</option>
                          {deviceTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Brand *
                        </label>
                        <select
                          name="brand"
                          value={requestForm.brand}
                          onChange={handleRequestChange}
                          className="w-full px-3 py-2 border rounded"
                          required
                        >
                          <option value="">Select</option>
                          {brands.map((brand) => (
                            <option key={brand} value={brand}>
                              {brand}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Model
                        </label>
                        <Input
                          name="model"
                          value={requestForm.model}
                          onChange={handleRequestChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Serial Number *
                        </label>
                        <Input
                          name="serialNumber"
                          value={requestForm.serialNumber}
                          onChange={handleRequestChange}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Part Name *
                        </label>
                        <Input
                          name="partName"
                          value={requestForm.partName}
                          onChange={handleRequestChange}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Quantity
                        </label>
                        <Input
                          name="quantity"
                          type="number"
                          min="1"
                          value={requestForm.quantity}
                          onChange={handleRequestChange}
                        />
                      </div>

                      {/* Delivery Type */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-base">
                          Delivery Method
                        </h4>
                        <div className="grid grid-cols-1 gap-4">
                          <label
                            className={`relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                              requestForm.deliveryType === "PICKUP"
                                ? "border-orange-600 bg-orange-50 dark:bg-orange-900/20"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                          >
                            <input
                              type="radio"
                              name="deliveryType"
                              value="PICKUP"
                              checked={requestForm.deliveryType === "PICKUP"}
                              onChange={handleRequestChange}
                              className="mt-1"
                            />
                            <div className="ml-3">
                              <div className="font-semibold">
                                Pickup at Center
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Collect your item from our service center
                              </div>
                            </div>
                          </label>
                          <label
                            className={`relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                              requestForm.deliveryType === "DELIVERY"
                                ? "border-orange-600 bg-orange-50 dark:bg-orange-900/20"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                          >
                            <input
                              type="radio"
                              name="deliveryType"
                              value="DELIVERY"
                              checked={requestForm.deliveryType === "DELIVERY"}
                              onChange={handleRequestChange}
                              className="mt-1"
                            />
                            <div className="ml-3">
                              <div className="font-semibold">Home Delivery</div>
                              <div className="text-sm text-muted-foreground">
                                We'll deliver to your address
                              </div>
                            </div>
                          </label>
                        </div>
                        {requestForm.deliveryType === "DELIVERY" && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                              <div className="space-y-2">
                                <label className="block text-sm font-medium">
                                  Address Line 1 *
                                </label>
                                <Input
                                  name="addressLine1"
                                  value={requestForm.addressLine1}
                                  onChange={handleRequestChange}
                                  placeholder="Street address"
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="block text-sm font-medium">
                                  Address Line 2
                                </label>
                                <Input
                                  name="addressLine2"
                                  value={requestForm.addressLine2}
                                  onChange={handleRequestChange}
                                  placeholder="Apartment, suite, etc."
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="block text-sm font-medium">
                                  City *
                                </label>
                                <Input
                                  name="city"
                                  value={requestForm.city}
                                  onChange={handleRequestChange}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="block text-sm font-medium">
                                  State *
                                </label>
                                <Input
                                  name="state"
                                  value={requestForm.state}
                                  onChange={handleRequestChange}
                                  required
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="block text-sm font-medium">
                                  Postal Code
                                </label>
                                <Input
                                  name="postalCode"
                                  value={requestForm.postalCode}
                                  onChange={handleRequestChange}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="block text-sm font-medium">
                                  Landmark
                                </label>
                                <Input
                                  name="landmark"
                                  value={requestForm.landmark}
                                  onChange={handleRequestChange}
                                  placeholder="Nearby landmark"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Images */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Device Images (up to 3, 5MB each)
                        </label>
                        <ImageUpload
                          value={requestImages}
                          onChange={setRequestImages}
                          maxFiles={3}
                          maxSize={5}
                          disabled={requestLoading}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Additional Request
                        </label>
                        <textarea
                          name="customerRequest"
                          value={requestForm.customerRequest}
                          onChange={handleRequestChange}
                          rows={3}
                          className="w-full px-3 py-2 border rounded"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={requestLoading}
                        className="w-full bg-orange-600 hover:bg-orange-700"
                      >
                        {requestLoading ? <LoadingSpinner /> : "Submit Request"}
                      </Button>
                    </form>
                  )}
                </div>
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>
        ))}
    </div>
  );
}
