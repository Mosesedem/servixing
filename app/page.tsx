import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Wrench,
  Smartphone,
  Clock,
  Shield,
  Search,
  CheckCircle,
  Star,
  TrendingUp,
  Zap,
  Package,
  HeadphonesIcon,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-br from-orange-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 rounded-full text-sm font-medium text-orange-700 dark:text-orange-300">
                <Zap className="h-4 w-4" />
                Fast, Reliable Device Repairs
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-balance leading-tight">
                We <span className="text-orange-600">fix it right,</span>
                <br />
                the first time.
              </h1>

              <p className="text-xl text-muted-foreground text-balance max-w-xl">
                Professional device repair management with real-time tracking,
                genuine parts, and expert technicians. Get your devices back
                faster.
              </p>

              {/* Quick Search */}
              <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search for parts (e.g., iPhone 13 screen)"
                    className="pl-10 h-12 text-base"
                  />
                </div>
                <Link href="/parts">
                  <Button
                    size="lg"
                    className="bg-orange-600 hover:bg-orange-700 h-12 w-full sm:w-auto"
                  >
                    Find Parts
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">Free Diagnostics</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">90-Day Warranty</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">Same-Day Service</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Facebook%20banner-dhAJhucOP8QhIpfiRo5IXatQ0R6Mwr.png"
                  alt="Device Repair Service"
                  width={600}
                  height={500}
                  className="rounded-2xl shadow-2xl"
                  priority
                />
              </div>
              {/* Floating Stats */}
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 z-20">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <Star className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">4.9/5</p>
                    <p className="text-sm text-muted-foreground">
                      Customer Rating
                    </p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 z-20">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">10K+</p>
                    <p className="text-sm text-muted-foreground">
                      Repairs Done
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Why Choose Servixing?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the difference with our comprehensive repair management
            platform
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Smartphone,
              title: "Device Registration",
              description:
                "Register unlimited devices and track repair history",
              color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600",
            },
            {
              icon: Wrench,
              title: "Expert Repairs",
              description: "Certified technicians with years of experience",
              color: "bg-orange-100 dark:bg-orange-900/30 text-orange-600",
            },
            {
              icon: Clock,
              title: "Real-time Tracking",
              description: "Monitor repair status from drop-off to pickup",
              color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600",
            },
            {
              icon: Shield,
              title: "Warranty Protection",
              description: "90-day warranty on all repairs and parts",
              color: "bg-green-100 dark:bg-green-900/30 text-green-600",
            },
          ].map((feature) => (
            <Card
              key={feature.title}
              className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-2 hover:border-orange-200 dark:hover:border-orange-800"
            >
              <div
                className={`inline-flex p-3 rounded-lg mb-4 ${feature.color}`}
              >
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Services Section */}
      <section className="bg-gray-50 dark:bg-gray-900/50 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl font-bold">
                Comprehensive Repair Services
              </h2>
              <p className="text-lg text-muted-foreground">
                From smartphones to laptops, we handle all your device repair
                needs with precision and care.
              </p>

              <div className="space-y-4">
                {[
                  "Screen & Display Replacement",
                  "Battery Replacement & Optimization",
                  "Water Damage Recovery",
                  "Hardware Component Repair",
                  "Software Troubleshooting",
                  "Data Recovery Services",
                ].map((service, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="shrink-0 w-6 h-6 rounded-full bg-orange-600 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-base font-medium">{service}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 pt-4">
                <Link href="/services">
                  <Button
                    size="lg"
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    View All Services
                  </Button>
                </Link>
                <Link href="/parts">
                  <Button size="lg" variant="outline">
                    Browse Parts
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="p-6 text-center">
                <Package className="h-12 w-12 mx-auto mb-3 text-orange-600" />
                <p className="text-3xl font-bold mb-1">1000+</p>
                <p className="text-sm text-muted-foreground">Parts in Stock</p>
              </Card>
              <Card className="p-6 text-center">
                <Clock className="h-12 w-12 mx-auto mb-3 text-blue-600" />
                <p className="text-3xl font-bold mb-1">24hr</p>
                <p className="text-sm text-muted-foreground">Avg Turnaround</p>
              </Card>
              <Card className="p-6 text-center">
                <HeadphonesIcon className="h-12 w-12 mx-auto mb-3 text-green-600" />
                <p className="text-3xl font-bold mb-1">24/7</p>
                <p className="text-sm text-muted-foreground">Support</p>
              </Card>
              <Card className="p-6 text-center">
                <Shield className="h-12 w-12 mx-auto mb-3 text-purple-600" />
                <p className="text-3xl font-bold mb-1">90 Days</p>
                <p className="text-sm text-muted-foreground">Warranty</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get your device repaired in 4 simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {[
            {
              step: "01",
              title: "Book Service",
              desc: "Create account and register your device online",
            },
            {
              step: "02",
              title: "Drop Off",
              desc: "Bring device to our center or request pickup",
            },
            {
              step: "03",
              title: "We Repair",
              desc: "Expert technicians fix your device with care",
            },
            {
              step: "04",
              title: "Pick Up",
              desc: "Get notified when ready and collect your device",
            },
          ].map((item, i) => (
            <div key={i} className="relative">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-600 text-white text-xl font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
              {i < 3 && (
                <ChevronRight className="hidden md:block absolute top-8 -right-4 h-6 w-6 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-linear-to-br from-orange-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg text-muted-foreground">
              Trusted by thousands of satisfied customers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Sarah Johnson",
                role: "Small Business Owner",
                rating: 5,
                text: "Fast service and great communication. My laptop was repaired in less than 24 hours!",
              },
              {
                name: "Michael Chen",
                role: "Student",
                rating: 5,
                text: "Affordable prices and quality work. The team was very professional and helpful.",
              },
              {
                name: "Emily Rodriguez",
                role: "Freelancer",
                rating: 5,
                text: "Excellent experience! They kept me updated throughout the entire repair process.",
              },
            ].map((testimonial, i) => (
              <Card key={i} className="p-6 bg-white dark:bg-gray-800">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-orange-600 text-orange-600"
                    />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">
                  "{testimonial.text}"
                </p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-linear-to-r from-orange-600 to-orange-700 text-white py-16 sm:py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to get started?
          </h2>
          <p className="text-lg sm:text-xl mb-8 opacity-90">
            Join thousands of customers who trust Servixing for their device
            repairs. Create an account today and get your first diagnostic FREE!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button
                size="lg"
                className="bg-white text-orange-600 hover:bg-gray-100 h-12 px-8 text-base font-semibold"
              >
                Create Free Account
              </Button>
            </Link>
            <Link href="/parts">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 h-12 px-8 text-base font-semibold"
              >
                Browse Parts Catalog
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
