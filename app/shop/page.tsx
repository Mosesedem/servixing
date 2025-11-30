"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Drawer } from "vaul";
import {
  Smartphone,
  Laptop,
  Tablet,
  Watch,
  Headphones,
  Monitor,
  Package,
  Star,
  ShoppingCart,
  ArrowRight,
  Wrench,
  Truck,
} from "lucide-react";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  price: number;
  brand: string;
  model?: string;
  condition: string;
  stock: number;
  images: string[];
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const categories = [
    {
      icon: Smartphone,
      name: "Smartphones",
      value: "smartphone",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: Laptop,
      name: "Laptops",
      value: "laptop",
      color: "bg-purple-100 text-purple-600",
    },
    {
      icon: Tablet,
      name: "Tablets",
      value: "tablet",
      color: "bg-green-100 text-green-600",
    },
    {
      icon: Watch,
      name: "Smartwatches",
      value: "watch",
      color: "bg-orange-100 text-orange-600",
    },
    {
      icon: Headphones,
      name: "Audio",
      value: "audio",
      color: "bg-pink-100 text-pink-600",
    },
    {
      icon: Monitor,
      name: "Desktops",
      value: "desktop",
      color: "bg-indigo-100 text-indigo-600",
    },
  ];

  const popularDevices = [
    {
      name: "iPhone 13 / 14",
      brand: "Apple",
      repairs: "3.2k+",
      rating: 4.9,
      imageUrl: "https://via.placeholder.com/80x80?text=iPhone",
    },
    {
      name: "MacBook Pro",
      brand: "Apple",
      repairs: "2.1k+",
      rating: 4.9,
      imageUrl: "https://via.placeholder.com/80x80?text=MacBook",
    },
    {
      name: "Galaxy S23 / S24",
      brand: "Samsung",
      repairs: "1.8k+",
      rating: 4.7,
      imageUrl: "https://via.placeholder.com/80x80?text=Galaxy",
    },
    {
      name: "iPad Pro / Air",
      brand: "Apple",
      repairs: "1.1k+",
      rating: 4.8,
      imageUrl: "https://via.placeholder.com/80x80?text=iPad",
    },
    {
      name: "Dell XPS",
      brand: "Dell",
      repairs: "890+",
      rating: 4.7,
      imageUrl: "https://via.placeholder.com/80x80?text=Dell",
    },
    {
      name: "Surface Pro",
      brand: "Microsoft",
      repairs: "720+",
      rating: 4.6,
      imageUrl: "https://via.placeholder.com/80x80?text=Surface",
    },
  ];

  const brands = [
    "Apple",
    "Samsung",
    "Dell",
    "HP",
    "Lenovo",
    "Asus",
    "Microsoft",
    "Google",
    "Sony",
    "Xiaomi",
    "Huawei",
    "OnePlus",
  ];

  useEffect(() => {
    fetchProducts();
    fetchCartCount();
  }, [selectedCategory, searchQuery, currentPage]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.set("category", selectedCategory);
      if (searchQuery) params.set("q", searchQuery);
      params.set("limit", "12");
      params.set("offset", String((currentPage - 1) * 12));

      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      setProducts(data.products || []);
      setTotalPages(Math.ceil(data.total / 12));
    } catch (err) {
      console.error("Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCartCount = async () => {
    try {
      const res = await fetch("/api/cart");
      const data = await res.json();
      setCartCount(data.items?.length || 0);
    } catch (err) {
      console.error("Failed to load cart count");
      setCartCount(0);
    }
  };

  const addToCart = async (productId: string) => {
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      if (res.ok) {
        alert("Added to cart!");
        fetchCartCount();
      } else {
        alert("Could not add to cart. Try again.");
      }
    } catch {
      alert("Network error. Please check your connection.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-50 via-white to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Repair Parts & Accessories
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Genuine and high-quality parts for phones, laptops, tablets, and
            more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
            <Button
              onClick={() => {
                setCurrentPage(1);
                fetchProducts();
              }}
              variant="outline"
            >
              Search
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/parts">
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
                Browse All Parts <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/services">
              <Button size="lg" variant="outline">
                Book a Repair
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            Shop by Category
          </h2>
          <p className="text-center text-muted-foreground mb-10">
            Choose your device type
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === cat.value ? "" : cat.value
                  )
                }
                className={`p-6 rounded-xl border-2 transition-all ${
                  selectedCategory === cat.value
                    ? "border-orange-500 bg-orange-50 shadow-md"
                    : "border-gray-200 hover:border-orange-300 hover:shadow-sm"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-lg ${cat.color} flex items-center justify-center mx-auto mb-3`}
                >
                  <cat.icon className="h-7 w-7" />
                </div>
                <p className="font-semibold text-sm">{cat.name}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">
            {selectedCategory
              ? categories.find((c) => c.value === selectedCategory)?.name +
                " Parts"
              : "Featured Products"}
          </h2>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-orange-600 border-t-transparent" />
              <p className="mt-4 text-muted-foreground">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-xl text-muted-foreground">
                No products found in this category yet.
              </p>
              <Button
                variant="outline"
                className="mt-6"
                onClick={() => setSelectedCategory("")}
              >
                Show All Products
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-square relative bg-gray-100">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-4xl text-gray-300">
                        <Wrench className="h-16 w-16" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm line-clamp-2 h-10">
                      {product.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {product.brand} {product.model}
                    </p>
                    <div className="flex justify-between items-end mt-3">
                      <span className="text-lg font-bold text-orange-600">
                        ₦{product.price.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {product.condition}
                      </span>
                    </div>
                    <Button
                      onClick={() => addToCart(product.id)}
                      disabled={product.stock === 0}
                      className="w-full mt-4"
                      size="sm"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedProduct(product);
                        setSelectedImageIndex(0);
                        setSheetOpen(true);
                      }}
                      variant="outline"
                      className="w-full mt-2"
                      size="sm"
                    >
                      View Details
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <section className="py-8 px-4">
          <div className="max-w-7xl mx-auto flex justify-center">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Popular Devices */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">
            Most Repaired Devices
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {popularDevices.map((device) => (
              <Card
                key={device.name}
                className="p-6 text-center hover:shadow-md transition-shadow"
              >
                <Image
                  src={device.imageUrl}
                  alt={device.name}
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-xl object-cover"
                />
                <h3 className="font-bold">{device.name}</h3>
                <p className="text-sm text-muted-foreground">{device.brand}</p>
                <div className="flex items-center justify-center gap-3 mt-3 text-sm">
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-orange-500 text-orange-500" />
                    {device.rating}
                  </span>
                  <span className="text-muted-foreground">
                    • {device.repairs} repairs
                  </span>
                </div>
                <Link href={`/parts?q=${device.name}`}>
                  <Button variant="outline" className="w-full mt-4 text-sm">
                    View Parts
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="inline-flex p-4 bg-orange-100 rounded-full mb-4">
              <Package className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Genuine Parts</h3>
            <p className="text-muted-foreground">
              OEM & high-quality replacements
            </p>
          </div>
          <div>
            <div className="inline-flex p-4 bg-orange-100 rounded-full mb-4">
              <Truck className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Fast Delivery</h3>
            <p className="text-muted-foreground">Same-day dispatch in Lagos</p>
          </div>
          <div>
            <div className="inline-flex p-4 bg-orange-100 rounded-full mb-4">
              <Star className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Trusted Quality</h3>
            <p className="text-muted-foreground">
              90-day warranty on all parts
            </p>
          </div>
        </div>
      </section>

      {/* Brands */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            We Support All Major Brands
          </h2>
          <p className="text-muted-foreground mb-10">
            Click any brand to see available parts
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-8">
            {brands.map((brand) => (
              <Link key={brand} href={`/parts?brand=${brand}`}>
                <div className="text-center group cursor-pointer">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-20 h-20 mx-auto mb-3 group-hover:border-orange-400 transition-colors" />
                  <p className="font-medium text-sm group-hover:text-orange-600">
                    {brand}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-orange-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Can't Find Your Part?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Our team can source any part — just let us know what you need.
          </p>
          <Link href="/support">
            <Button
              size="lg"
              className="bg-white text-orange-600 hover:bg-gray-100 font-bold"
            >
              Contact Us Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Product Details Sheet */}
      <Drawer.Root open={sheetOpen} onOpenChange={setSheetOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/50" />
          <Drawer.Content className="fixed right-0 top-0 h-full w-full max-w-md bg-background shadow-xl">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Product Details</h2>
              <button
                onClick={() => setSheetOpen(false)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Close
              </button>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-56px)]">
              {selectedProduct && (
                <>
                  {/* Image Gallery */}
                  <div className="space-y-2">
                    <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
                      {selectedProduct.images[selectedImageIndex] ? (
                        <Image
                          src={selectedProduct.images[selectedImageIndex]}
                          alt={selectedProduct.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-4xl text-gray-300">
                          <Wrench className="h-16 w-16" />
                        </div>
                      )}
                    </div>
                    {selectedProduct.images.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {selectedProduct.images.map((img, index) => (
                          <div
                            key={index}
                            className={`flex-shrink-0 w-16 h-16 relative bg-gray-100 rounded overflow-hidden cursor-pointer border-2 ${
                              index === selectedImageIndex
                                ? "border-orange-500"
                                : "border-transparent"
                            }`}
                            onClick={() => setSelectedImageIndex(index)}
                          >
                            <Image
                              src={img}
                              alt={`${selectedProduct.name} ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold">
                      {selectedProduct.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedProduct.brand} {selectedProduct.model}
                    </p>
                  </div>

                  {selectedProduct.description && (
                    <div>
                      <h4 className="font-semibold mb-2">Description</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedProduct.description}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-orange-600">
                      ₦{selectedProduct.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {selectedProduct.condition}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Stock: {selectedProduct.stock} available
                  </div>
                  <Button
                    onClick={() => addToCart(selectedProduct.id)}
                    disabled={selectedProduct.stock === 0}
                    className="w-full"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {selectedProduct.stock === 0
                      ? "Out of Stock"
                      : "Add to Cart"}
                  </Button>
                </>
              )}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
      {/* Floating Cart */}
      <Link href="/cart">
        <button className="fixed bottom-6 right-6 bg-orange-600 text-white p-4 rounded-full shadow-lg hover:bg-orange-700 z-50 flex items-center justify-center">
          <ShoppingCart className="h-6 w-6 mr-3" /> Cart
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </Link>
    </div>
  );
}
