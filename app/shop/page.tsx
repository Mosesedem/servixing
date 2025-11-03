import Link from "next/link";
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
} from "lucide-react";

export default function ShopPage() {
  const categories = [
    {
      icon: Smartphone,
      name: "Smartphones",
      description: "iPhone, Samsung, Google Pixel repairs",
      itemCount: "150+ parts",
      color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
      href: "/parts?category=smartphone",
    },
    {
      icon: Laptop,
      name: "Laptops",
      description: "MacBook, Dell, HP, Lenovo repairs",
      itemCount: "200+ parts",
      color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30",
      href: "/parts?category=laptop",
    },
    {
      icon: Tablet,
      name: "Tablets",
      description: "iPad and Android tablet repairs",
      itemCount: "80+ parts",
      color: "text-green-600 bg-green-100 dark:bg-green-900/30",
      href: "/parts?category=tablet",
    },
    {
      icon: Watch,
      name: "Smartwatches",
      description: "Apple Watch, Samsung Galaxy Watch",
      itemCount: "50+ parts",
      color: "text-orange-600 bg-orange-100 dark:bg-orange-900/30",
      href: "/parts?category=watch",
    },
    {
      icon: Headphones,
      name: "Audio Devices",
      description: "AirPods, headphones, speakers",
      itemCount: "40+ parts",
      color: "text-pink-600 bg-pink-100 dark:bg-pink-900/30",
      href: "/parts?category=audio",
    },
    {
      icon: Monitor,
      name: "Desktops",
      description: "iMac, PC repairs and upgrades",
      itemCount: "120+ parts",
      color: "text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30",
      href: "/parts?category=desktop",
    },
  ];

  const popularDevices = [
    {
      name: "iPhone 13",
      brand: "Apple",
      rating: 4.8,
      repairs: "2.5k+",
      image: "📱",
    },
    {
      name: "MacBook Pro",
      brand: "Apple",
      rating: 4.9,
      repairs: "1.8k+",
      image: "💻",
    },
    {
      name: "Galaxy S23",
      brand: "Samsung",
      rating: 4.7,
      repairs: "1.2k+",
      image: "📱",
    },
    {
      name: "iPad Air",
      brand: "Apple",
      rating: 4.8,
      repairs: "900+",
      image: "📱",
    },
    {
      name: "Dell XPS 15",
      brand: "Dell",
      rating: 4.6,
      repairs: "750+",
      image: "💻",
    },
    {
      name: "Surface Pro",
      brand: "Microsoft",
      rating: 4.7,
      repairs: "650+",
      image: "📱",
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
            <Link key={category.name} href={category.href}>
              <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-2 hover:border-orange-200 dark:hover:border-orange-800">
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
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Devices */}
      <section className="bg-gray-50 dark:bg-gray-900/50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  <div className="text-5xl">{device.image}</div>
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
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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
            {[
              "Apple",
              "Samsung",
              "Dell",
              "HP",
              "Lenovo",
              "Asus",
              "Microsoft",
              "Google",
              "Sony",
              "LG",
              "OnePlus",
              "Xiaomi",
            ].map((brand) => (
              <Link key={brand} href={`/parts?brand=${brand}`}>
                <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
                  <p className="font-semibold">{brand}</p>
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
