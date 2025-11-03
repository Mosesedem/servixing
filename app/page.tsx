"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Wrench,
  Shield,
  Clock,
  Smartphone,
  ChevronRight,
  Star,
  Package,
  Zap,
  CheckCircle,
  Award,
  Users,
  TrendingUp,
  Heart,
  Monitor,
  Tablet,
  Watch,
  Headphones,
  ArrowRight,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState<{ [key: string]: boolean }>({});
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible((prev) => ({
            ...prev,
            [entry.target.id]: entry.isIntersecting,
          }));
        });
      },
      { threshold: 0.1 }
    );

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-linear-to-b from-white via-gray-50 to-white text-foreground dark:from-gray-950 dark:via-black dark:to-gray-950 dark:text-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated gradient background with brand colors */}
        <div className="absolute inset-0 bg-linear-to-br from-blue-100/60 via-white to-orange-100/40 dark:from-blue-950/60 dark:via-black dark:to-orange-950/40">
          <div
            className="absolute inset-0 bg-linear-to-tr from-orange-600/20 via-transparent to-blue-600/20"
            style={{ transform: `translateY(${scrollY * 0.5}px)` }}
          />
        </div>

        {/* Floating orbs with brand colors */}
        <div
          className="absolute top-20 left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"
          style={{ transform: `translateX(${scrollY * 0.1}px)` }}
        />
        <div
          className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-orange-500/20 rounded-full blur-3xl animate-pulse"
          style={{
            animationDelay: "1s",
            transform: `translateX(${-scrollY * 0.1}px)`,
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-linear-to-r from-orange-500/10 to-blue-500/10 rounded-full blur-2xl"
          style={{
            transform: `translate(-50%, -50%) scale(${1 + scrollY * 0.001})`,
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center pt-32 pb-20">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-2 mb-8 backdrop-blur-sm">
              <Award className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-orange-400 font-medium">
                Trusted by 10,000+ customers
              </span>
            </div>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold mb-6 leading-tight">
              Fix it.
              <br />
              <span className="text-orange-500">Perfectly.</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Professional repairs that bring your devices back to life. Fast,
              reliable, and backed by our{" "}
              <span className="text-orange-400 font-semibold">
                90-day guarantee
              </span>
              .
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="group">
                <Link href="/support/create-ticket">
                  Book a Repair
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/parts">Browse Parts</Link>
              </Button>
            </div>

            {/* Trust badges */}
            <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-orange-400" />
                <span>90-Day Warranty</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-orange-400" />
                <span>Certified Technicians</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-orange-400" />
                <span>Same-Day Service</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-orange-500/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-linear-to-b from-orange-500 to-blue-500 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        id="stats"
        ref={(el) => {
          sectionRefs.current["stats"] = el;
        }}
        className="py-20 relative"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div
            className={`grid md:grid-cols-4 gap-8 transition-all duration-1000 ${
              isVisible["stats"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            {[
              { icon: Users, value: "10,000+", label: "Happy Customers" },
              { icon: Wrench, value: "50,000+", label: "Repairs Completed" },
              { icon: Award, value: "4.9/5", label: "Customer Rating" },
              { icon: TrendingUp, value: "98%", label: "Success Rate" },
            ].map((stat, i) => (
              <div
                key={i}
                className="text-center group"
                style={{
                  transitionDelay: `${i * 100}ms`,
                }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/15 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="w-8 h-8 text-orange-400" />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-orange-500 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Image + Text Section 1 - Fast Repairs */}
      <section
        id="fast-repairs"
        ref={(el) => {
          sectionRefs.current["fast-repairs"] = el;
        }}
        className="py-32 relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div
            className={`grid lg:grid-cols-2 gap-12 items-center transition-all duration-1000 ${
              isVisible["fast-repairs"]
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-10"
            }`}
          >
            {/* Image */}
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-br from-orange-200/50 to-blue-200/50 rounded-3xl blur-3xl dark:from-orange-500/20 dark:to-blue-500/20" />
              <div className="relative bg-white dark:bg-white/5 backdrop-blur-sm rounded-3xl p-2 border border-gray-200 dark:border-white/10 shadow-sm">
                <div className="aspect-4/3 bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl overflow-hidden flex items-center justify-center">
                  {/* Placeholder for repair image */}
                  <div className="text-center p-8">
                    <Wrench className="w-24 h-24 text-orange-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Professional technician repairing device
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Text */}
            <div>
              <h2 className="text-4xl md:text-6xl font-bold mb-6">
                Lightning-fast <span className="text-orange-500">repairs</span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                We understand your time is valuable. That's why we offer
                same-day service for most repairs. Our expert technicians work
                efficiently without compromising quality.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "Most repairs completed in 1-2 hours",
                  "Walk-in service available",
                  "Real-time repair status updates",
                  "Free diagnostics",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-orange-400 shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
              <Button asChild size="lg">
                <Link href="/support/create-ticket">
                  Book Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Image + Text Section 2 - Quality Parts */}
      <section
        id="quality-parts"
        ref={(el) => {
          sectionRefs.current["quality-parts"] = el;
        }}
        className="py-32 relative overflow-hidden bg-linear-to-b from-gray-50 to-white dark:from-black dark:to-gray-900"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div
            className={`grid lg:grid-cols-2 gap-12 items-center transition-all duration-1000 ${
              isVisible["quality-parts"]
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-10"
            }`}
          >
            {/* Text - Left side this time */}
            <div className="order-2 lg:order-1">
              <h2 className="text-4xl md:text-6xl font-bold mb-6">
                Premium quality <span className="text-blue-500">parts</span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                We only use OEM-quality components for all repairs. Every part
                is thoroughly tested and comes with our 90-day warranty for your
                peace of mind.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "Original equipment manufacturer (OEM) quality",
                  "Rigorous quality testing on every part",
                  "90-day warranty on all repairs",
                  "Genuine parts database verification",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-blue-400 shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
              <Button asChild variant="secondary" size="lg">
                <Link href="/parts">
                  View Parts Catalog
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>

            {/* Image - Right side */}
            <div className="relative order-1 lg:order-2">
              <div className="absolute inset-0 bg-linear-to-br from-blue-200/50 to-orange-200/50 rounded-3xl blur-3xl dark:from-blue-500/20 dark:to-orange-500/20" />
              <div className="relative bg-white dark:bg-white/5 backdrop-blur-sm rounded-3xl p-2 border border-gray-200 dark:border-white/10 shadow-sm">
                <div className="aspect-4/3 bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-2xl overflow-hidden flex items-center justify-center">
                  {/* Placeholder for parts image */}
                  <div className="text-center p-8">
                    <Package className="w-24 h-24 text-blue-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Premium quality replacement parts
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Image + Text Section 3 - Expert Technicians */}
      <section
        id="expert-tech"
        ref={(el) => {
          sectionRefs.current["expert-tech"] = el;
        }}
        className="py-32 relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div
            className={`grid lg:grid-cols-2 gap-12 items-center transition-all duration-1000 ${
              isVisible["expert-tech"]
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-10"
            }`}
          >
            {/* Image */}
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-br from-orange-200/50 to-blue-200/50 rounded-3xl blur-3xl dark:from-orange-500/20 dark:to-blue-500/20" />
              <div className="relative bg-white dark:bg-white/5 backdrop-blur-sm rounded-3xl p-2 border border-gray-200 dark:border-white/10 shadow-sm">
                <div className="aspect-4/3 bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl overflow-hidden flex items-center justify-center">
                  {/* Placeholder for technician image */}
                  <div className="text-center p-8">
                    <Award className="w-24 h-24 text-orange-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Certified repair technicians
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Text */}
            <div>
              <h2 className="text-4xl md:text-6xl font-bold mb-6">
                Certified <span className="text-orange-500">experts</span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                Our team consists of highly trained and certified technicians
                with years of experience. We stay updated with the latest repair
                techniques and technologies.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "Apple Certified technicians on staff",
                  "10+ years average experience",
                  "Continuous training on new devices",
                  "Background-checked professionals",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-orange-400 shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
              <Button asChild size="lg">
                <Link href="/support">
                  Meet Our Team
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section
        id="services"
        ref={(el) => {
          sectionRefs.current["services"] = el;
        }}
        className="py-32 bg-linear-to-b from-gray-50 to-white dark:from-black dark:to-gray-900 relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--tw-gradient-stops))] from-orange-900/5 via-transparent to-transparent" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
          <div
            className={`text-center mb-20 transition-all duration-1000 ${
              isVisible["services"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h2 className="text-5xl md:text-7xl font-bold mb-6">
              Every device.
              <br />
              <span className="text-orange-500">Every repair.</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              From screens to batteries, we've got you covered with expert
              service.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Mobile Phones",
                subtitle: "Iphones, Android Devices Repairs, servicings etc.",
                color: "from-blue-600 to-blue-600",
                icon: Smartphone,
                image: "📱",
                imageUrl: "/images/iphone.png",
                href: "/services?category=mobile",
              },
              {
                title: "Laptops",
                subtitle:
                  "Warranty coverage, Sales of OEM parts & Repairs of all brands",
                color: "from-blue-600 to-blue-600",
                icon: Monitor,
                image: "💻",
                imageUrl: "/images/laptop.png",
                href: "/services?category=laptop",
              },
              {
                title: "iPads & Tablets",
                subtitle: "Sales, Repairs & Servicing",
                color: "from-blue-600 to-blue-600",
                icon: Tablet,
                image: "📱",
                imageUrl: "/images/ipad.png",
                href: "/services?category=tablet",
              },
              {
                title: "Smart Watches",
                subtitle: "Screen, battery, crown",
                color: "from-blue-600 to-blue-600",
                icon: Watch,
                image: "⌚",
                imageUrl: "/images/watch.png",
                href: "/services?category=watch",
              },
              {
                title: "Servers & Desktops",
                subtitle:
                  "Repairs, and Servicing of Business & personal computers",
                color: "from-blue-600 to-blue-600",
                icon: Headphones,
                image: "🖥️",
                imageUrl: "/images/server.png",
                href: "/services?category=desktop",
              },
              {
                title: "Accessories",
                subtitle: "Cables, chargers, cases, headsets, and more",
                color: "from-blue-600 to-blue-600",
                icon: Package,
                image: "📦",
                imageUrl: "/images/accessories.png",
                href: "/shop",
              },
            ].map((service, i) => (
              <Link
                key={service.title}
                href={service.href}
                className={`group relative bg-white rounded-3xl p-8 transition-all duration-500 border border-gray-200 hover:border-orange-300 overflow-hidden hover:scale-[1.02] shadow-sm hover:shadow-lg dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10 dark:hover:shadow-2xl dark:hover:shadow-orange-500/20 ${
                  isVisible["services"]
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                } cursor-pointer`}
                style={{
                  transitionDelay: `${i * 100}ms`,
                }}
              >
                <div
                  className={`absolute inset-0 bg-linear-to-br ${service.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                />
                <div className="relative z-10">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {/* Image is visible by default, hidden on hover */}
                    <Image
                      src={service.imageUrl}
                      alt={service.title}
                      width={64}
                      height={64}
                      className="group-hover:hidden"
                    />

                    {/* Emoji is hidden by default, visible on hover */}
                    <span className="hidden group-hover:block">
                      {service.image}
                    </span>
                  </div>
                  {/* <service.icon className="w-12 h-12 mb-6 text-gray-500 dark:text-white/60 group-hover:text-orange-500 transition-colors" /> */}
                  <h3 className="text-3xl font-bold mb-2 group-hover:text-white transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground group-hover:text-white/80 mb-6">
                    {service.subtitle}
                  </p>
                  <div className="flex items-center text-sm font-medium text-orange-600 dark:text-white/80 group-hover:text-orange-300">
                    Learn more{" "}
                    <ChevronRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        ref={(el) => {
          sectionRefs.current["features"] = el;
        }}
        className="py-32 relative"
      >
        <div className="absolute inset-0 bg-linear-to-b from-white via-gray-50 to-white dark:from-gray-900 dark:via-black dark:to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-orange-200/40 via-transparent to-transparent dark:from-orange-900/10" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div
            className={`text-center mb-20 transition-all duration-1000 ${
              isVisible["features"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h2 className="text-5xl md:text-7xl font-bold mb-6">
              Why choose us?
            </h2>
            <p className="text-xl text-gray-400">Excellence in every detail.</p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {[
              {
                icon: Wrench,
                title: "Expert Technicians",
                desc: "Certified professionals with years of experience.",
              },
              {
                icon: Shield,
                title: "90-Day Warranty",
                desc: "Every repair backed by our guarantee.",
              },
              {
                icon: Clock,
                title: "Same-Day Service",
                desc: "Most repairs completed within hours.",
              },
              {
                icon: CheckCircle,
                title: "Genuine Parts",
                desc: "OEM quality components for lasting repairs.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className={`text-center group transition-all duration-700 ${
                  isVisible["features"]
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
                style={{
                  transitionDelay: `${i * 150}ms`,
                }}
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-600/15 mb-6 group-hover:from-orange-600/40 group-hover:to-blue-600/40 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
                  <feature.icon className="w-10 h-10 text-orange-400 group-hover:text-orange-300 transition-colors" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section
        id="process"
        ref={(el) => {
          sectionRefs.current["process"] = el;
        }}
        className="py-32 bg-linear-to-b from-gray-50 to-white dark:from-black dark:to-gray-900 relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,var(--tw-gradient-stops))] from-blue-900/5 via-transparent to-transparent" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
          <div
            className={`text-center mb-20 transition-all duration-1000 ${
              isVisible["process"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h2 className="text-5xl md:text-7xl font-bold mb-6 text-primary">
              Simple.
              <br />
              <span className="text-blue-500">Seamless.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-12 relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-orange-500/20 to-transparent" />

            {[
              {
                num: "01",
                title: "Book Online",
                desc: "Schedule your repair in seconds.",
                icon: Search,
              },
              {
                num: "02",
                title: "Drop Off",
                desc: "Bring your device to us or we come to you.",
                icon: Package,
              },
              {
                num: "03",
                title: "We Fix It",
                desc: "Expert repair with genuine parts.",
                icon: Wrench,
              },
              {
                num: "04",
                title: "Pick Up",
                desc: "Device ready, working perfectly.",
                icon: Heart,
              },
            ].map((step, i) => (
              <div
                key={i}
                className={`text-center relative transition-all duration-700 ${
                  isVisible["process"]
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
                style={{
                  transitionDelay: `${i * 150}ms`,
                }}
              >
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-600 text-white text-2xl font-bold mb-6 shadow-2xl shadow-orange-600/50 hover:scale-110 hover:rotate-6 transition-all duration-300 group">
                  <step.icon className="w-10 h-10 absolute opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="group-hover:opacity-0 transition-opacity">
                    {step.num}
                  </span>
                </div>
                <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section
        id="testimonials"
        ref={(el) => {
          sectionRefs.current["testimonials"] = el;
        }}
        className="py-32 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-linear-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-blue-200/30 via-transparent to-transparent dark:from-blue-900/20" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div
            className={`text-center mb-20 transition-all duration-1000 ${
              isVisible["testimonials"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h2 className="text-5xl md:text-7xl font-bold mb-6">
              Loved by thousands.
            </h2>
            <p className="text-xl text-gray-400">
              Real stories from real customers.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                text: "My MacBook screen was replaced in under 2 hours. Looks brand new!",
                name: "Sarah M.",
                device: "MacBook Pro",
                rating: 5,
              },
              {
                text: "Best iPhone repair service. Fast, affordable, and professional.",
                name: "James K.",
                device: "iPhone 14 Pro",
                rating: 5,
              },
              {
                text: "Incredible service. They saved my data and fixed everything perfectly.",
                name: "Emily R.",
                device: "iPad Air",
                rating: 5,
              },
            ].map((testimonial, i) => (
              <div
                key={i}
                className={`bg-white rounded-3xl p-8 border border-gray-200 shadow-sm transition-all duration-500 hover:scale-[1.02] hover:shadow-lg dark:bg-white/5 dark:backdrop-blur-sm dark:border-white/10 dark:hover:bg-white/10 dark:hover:border-orange-500/30 dark:hover:shadow-2xl dark:hover:shadow-orange-500/10 ${
                  isVisible["testimonials"]
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
                style={{
                  transitionDelay: `${i * 150}ms`,
                }}
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star
                      key={j}
                      className="w-5 h-5 fill-orange-400 text-orange-400 animate-pulse"
                      style={{ animationDelay: `${j * 100}ms` }}
                    />
                  ))}
                </div>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 italic leading-relaxed">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {testimonial.device}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        id="cta"
        ref={(el) => {
          sectionRefs.current["cta"] = el;
        }}
        className="py-32 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-linear-to-br from-orange-600 via-orange-500 to-blue-600" />
        <div className="absolute inset-0 bg-black/20" />

        {/* Animated circles */}
        <div className="absolute top-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-10 left-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />

        <div
          className={`relative max-w-4xl mx-auto text-center px-6 transition-all duration-1000 ${
            isVisible["cta"] ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          <h2 className="text-5xl md:text-7xl font-bold mb-8 text-white">
            Ready to get started?
          </h2>
          <p className="text-xl md:text-2xl text-white/90 mb-12 leading-relaxed">
            Book your repair today and experience the difference.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-orange-600 hover:bg-gray-100 hover:text-orange-700 group shadow-2xl"
          >
            <Link href="/support/create-ticket">
              Get Started Now
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 dark:bg-black dark:border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="text-lg font-semibold mb-4">Services</h3>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                <li>
                  <a
                    href="#"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    iPhone Repair
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    MacBook Repair
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    iPad Repair
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Watch Repair
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Shop</h3>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                <li>
                  <a
                    href="#"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Replacement Parts
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Accessories
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Trade-In
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Warranty Plans
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                <li>
                  <a
                    href="#"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Track Repair
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    FAQs
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                <li>
                  <a
                    href="#"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Locations
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Press
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © 2025 Servixing. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-500">
              <a
                href="#"
                className="hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
