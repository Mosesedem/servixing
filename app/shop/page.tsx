"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Smartphone,
  Laptop,
  Tablet,
  Watch,
  Headphones,
  Monitor,
  ArrowRight,
  Star,
  ShoppingBag,
  Package,
  ShoppingCart,
} from "lucide-react";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  category: string;
  brand: string;
  model?: string;
  condition: string;
  stock: number;
  images: string[];
  isActive: boolean;
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const categories = [
    {
      icon: Smartphone,
      name: "Smartphones",
      description: "iPhone, Samsung, Google Pixel repairs",
      itemCount: "150+ parts",
      color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
      href: "/parts?category=smartphone",
      value: "smartphone",
    },
    {
      icon: Laptop,
      name: "Laptops",
      description: "MacBook, Dell, HP, Lenovo repairs",
      itemCount: "200+ parts",
      color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30",
      href: "/parts?category=laptop",
      value: "laptop",
    },
    {
      icon: Tablet,
      name: "Tablets",
      description: "iPad and Android tablet repairs",
      itemCount: "80+ parts",
      color: "text-green-600 bg-green-100 dark:bg-green-900/30",
      href: "/parts?category=tablet",
      value: "tablet",
    },
    {
      icon: Watch,
      name: "Smartwatches",
      description: "Apple Watch, Samsung Galaxy Watch",
      itemCount: "50+ parts",
      color: "text-orange-600 bg-orange-100 dark:bg-orange-900/30",
      href: "/parts?category=watch",
      value: "watch",
    },
    {
      icon: Headphones,
      name: "Audio Devices",
      description: "AirPods, headphones, speakers",
      itemCount: "40+ parts",
      color: "text-pink-600 bg-pink-100 dark:bg-pink-900/30",
      href: "/parts?category=audio",
      value: "audio",
    },
    {
      icon: Monitor,
      name: "Desktops",
      description: "iMac, PC repairs and upgrades",
      itemCount: "120+ parts",
      color: "text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30",
      href: "/parts?category=desktop",
      value: "desktop",
    },
  ];

  const brands = [
    { name: "Apple", logo: "/images/1.png" },
    { name: "Samsung", logo: "/images/2.png" },
    { name: "Dell", logo: "/images/1.png" },
    { name: "HP", logo: "/images/1.png" },
    { name: "Lenovo", logo: "ímages/1.png" },
    { name: "Asus", logo: "/images/asus.png" },
    { name: "Microsoft", logo: "/images/microsoft.png" },
    { name: "Google", logo: "images/clear-logo.png" },
    { name: "Sony", logo: "images/clear-logo.png" },
    { name: "Canon", logo: "images/clear-logo.png" },
    { name: "Toshiba", logo: "images/clear-logo.png" },
    { name: "Xiaomi", logo: "images/clear-logo.png" },
  ];

  const popularDevices = [
    {
      name: "iPhone 13",
      brand: "Apple",
      rating: 4.8,
      repairs: "2.5k+",
      image: "📱",
      imageUrl: "/images/iphone.png",
    },
    {
      name: "MacBook Pro",
      brand: "Apple",
      rating: 4.9,
      repairs: "1.8k+",
      image: "💻",
      imageUrl: "/images/1.png",
    },
    {
      name: "Galaxy S23",
      brand: "Samsung",
      rating: 4.7,
      repairs: "1.2k+",
      image: "📱",
      imageUrl: "/images/1.png",
    },
    {
      name: "iPad Air",
      brand: "Apple",
      rating: 4.8,
      repairs: "900+",
      image: "📱",
      imageUrl: "/images/1.png",
    },
    {
      name: "Dell XPS 15",
      brand: "Dell",
      rating: 4.6,
      repairs: "750+",
      image: "💻",
      imageUrl: "/images/1.png",
    },
    {
      name: "Surface Pro",
      brand: "Microsoft",
      rating: 4.7,
      repairs: "650+",
      image: "📱",
      imageUrl: "/images/1.png",
    },
  ];

  const features = [
    {
      icon: Package,
      title: "Genuine Parts",
      description: "OEM and high-quality aftermarket parts",
    },
    {
      icon: Star,
      title: "Expert Installation",
      description: "Professional technician service available",
    },
    {
      icon: ShoppingBag,
      title: "Fast Delivery",
      description: "Quick shipping on all part orders",
    },
  ];

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.set("category", selectedCategory);
      params.set("limit", "12");

      const response = await fetch(`/api/products?${params}`);
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string) => {
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      if (response.ok) {
        alert("Added to cart!");
      } else {
        alert("Failed to add to cart");
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      alert("Failed to add to cart");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-linear-to-br from-orange-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Browse Parts & Devices
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Find genuine replacement parts for all major device brands.
              Whether you DIY or need professional installation, we've got you
              covered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/parts">
                <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
                  Search Parts Catalog
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/services">
                <Button size="lg" variant="outline">
                  View Services
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Shop by Category</h2>
          <p className="text-lg text-muted-foreground">
            Find parts for your specific device type
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card
              key={category.name}
              className={`p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-2 ${
                selectedCategory === category.value
                  ? "border-orange-200"
                  : "hover:border-orange-200"
              } dark:hover:border-orange-800`}
              onClick={() => setSelectedCategory(category.value)}
            >
              <div
                className={`inline-flex p-3 rounded-lg mb-4 ${category.color}`}
              >
                <category.icon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">{category.name}</h3>
              <p className="text-muted-foreground mb-3">
                {category.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-orange-600">
                  {category.itemCount}
                </span>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Local Products */}
      <section className="bg-gray-50 dark:bg-gray-900/50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              {selectedCategory
                ? `${
                    selectedCategory.charAt(0).toUpperCase() +
                    selectedCategory.slice(1)
                  } Products`
                : "Featured Products"}
            </h2>
            <p className="text-lg text-muted-foreground">
              High-quality parts available for immediate purchase
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-600 border-r-transparent"></div>
              <p className="mt-4 text-muted-foreground">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground">
                Check back later for new products in this category.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className="p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-square relative mb-4 bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={product.images[0] || "/images/accessories.png"}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="font-semibold mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {product.brand} {product.model}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-bold text-orange-600">
                      ₦{product.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {product.condition}
                    </span>
                  </div>
                  <Button
                    onClick={() => addToCart(product.id)}
                    className="w-full"
                    disabled={product.stock === 0}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Popular Devices */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Popular Devices</h2>
          <p className="text-lg text-muted-foreground">
            Most frequently repaired devices at Servixing
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularDevices.map((device) => (
            <Card
              key={device.name}
              className="p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-4">
                {/* <div className="text-5xl">{device.image}</div> */}
                <Image
                  src={device.imageUrl}
                  alt={device.name}
                  height={48}
                  width={48}
                />

                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-1">{device.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {device.brand}
                  </p>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-orange-600 text-orange-600" />
                      <span className="font-medium">{device.rating}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {device.repairs} repairs
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <Link href={`/parts?q=${device.name}&brand=${device.brand}`}>
                  <Button variant="outline" className="w-full">
                    Find Parts
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 dark:bg-gray-900/50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="inline-flex p-4 rounded-full bg-orange-100 dark:bg-orange-900/30 mb-4">
                  <feature.icon className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brands */}
      <section className="bg-linear-to-br from-orange-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Supported Brands</h2>
            <p className="text-lg text-muted-foreground">
              We repair devices from all major manufacturers
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {brands.map((brand) => (
              <Link key={brand.name} href={`/parts?brand=${brand.name}`}>
                <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex">
                    <Image
                      src={brand.logo}
                      alt={brand.name}
                      height={24}
                      width={24}
                      className="mr-3"
                    />
                    <p className="font-semibold">{brand.name}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-orange-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Can't Find What You Need?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Contact our support team and we'll help you find the right part for
            your device.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/support">
              <Button
                size="lg"
                className="bg-white text-orange-600 hover:bg-gray-100"
              >
                Contact Support
              </Button>
            </Link>
            <Link href="/parts">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10"
              >
                Browse All Parts
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
