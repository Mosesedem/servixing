"use client";
import Image from "next/image";
import { CheckCircle, Users, Award, TrendingUp } from "lucide-react";

export default function AboutUsPage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-orange-50 via-white to-blue-50 dark:from-orange-950/20 dark:via-background dark:to-blue-950/20" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              About <span className="text-orange-500">Servixing</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Your trusted partner in device repair and maintenance. We bring
              expertise, reliability, and innovation to every repair.
            </p>
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">Welcome</h2>
          </div>
          <div className="prose prose-lg mx-auto text-center">
            <p className="text-xl leading-relaxed mb-6">
              In today's fast-paced digital world, your devices are essential to
              staying connected, productive, and entertained. At Servixing, we
              understand that when your device breaks down, it disrupts your
              life.
            </p>
            <p className="text-xl leading-relaxed mb-6">
              We are passionate about bringing your devices back to life with
              professional repairs that you can trust. Leveraging cutting-edge
              technology and years of expertise, we offer fast, reliable, and
              affordable repair services for all your devices.
            </p>
            <p className="text-xl leading-relaxed">
              Our commitment is to provide exceptional service that exceeds
              expectations. We believe in transparency, quality, and customer
              satisfaction. Every repair is backed by our warranty, and our team
              is dedicated to making technology work for you.
            </p>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16">
            <div className="text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-8 text-orange-500">
                Our Vision
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                To be the leading device repair service provider, transforming
                how people experience technology maintenance and repair across
                Nigeria and beyond.
              </p>
            </div>
            <div className="text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-8 text-blue-600">
                Our Mission
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Making quality device repairs accessible and affordable to
                everyone. We strive to provide fast, reliable service using
                genuine parts and expert technicians.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">Our Values</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Integrity",
                description:
                  "We conduct our business with honesty, transparency, and ethical practices in all our dealings.",
                icon: CheckCircle,
              },
              {
                title: "Excellence",
                description:
                  "We strive for the highest quality in every repair, using only genuine parts and proven techniques.",
                icon: Award,
              },
              {
                title: "Customer Focus",
                description:
                  "Our customers are at the heart of everything we do. We listen, understand, and exceed expectations.",
                icon: Users,
              },
              {
                title: "Innovation",
                description:
                  "We embrace new technologies and methods to provide better, faster, and more efficient repair services.",
                icon: TrendingUp,
              },
              {
                title: "Reliability",
                description:
                  "We deliver on our promises. Every repair comes with our warranty and commitment to quality.",
                icon: CheckCircle,
              },
              {
                title: "Trust",
                description:
                  "We build lasting relationships through consistent, dependable service and clear communication.",
                icon: Users,
              },
            ].map((value, index) => (
              <div
                key={index}
                className="bg-card rounded-lg p-8 border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                    <value.icon className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="text-2xl font-semibold">{value.title}</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              By the Numbers
            </h2>
            <p className="text-xl text-muted-foreground">
              Our commitment to excellence in action
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { value: "10,000+", label: "Devices Repaired" },
              { value: "98%", label: "Customer Satisfaction" },
              { value: "50+", label: "Expert Technicians" },
              { value: "5 Years", label: "Experience" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-orange-500 mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section Placeholder */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">Our Team</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Meet the experts behind your device repairs
            </p>
          </div>

          <div className="text-center">
            <p className="text-lg text-muted-foreground mb-8">
              Our team consists of certified technicians with years of
              experience in device repair and maintenance. We continuously train
              our staff on the latest technologies and repair techniques.
            </p>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                {
                  role: "Lead Technician",
                  name: "Expert Team",
                  imageUrl: "/images/1.jpg",
                },
                {
                  role: "Quality Assurance",
                  name: "Dedicated Professionals",
                  imageUrl: "/images/1.jpg",
                },
                {
                  role: "Customer Service",
                  name: "Support Staff",
                  imageUrl: "/images/1.jpg",
                },
              ].map((member, index) => (
                <div
                  key={index}
                  className="bg-card rounded-lg p-6 border shadow-sm"
                >
                  <Image
                    src={member.imageUrl}
                    alt={member.name}
                    width={150}
                    height={150}
                    className="w-32 h-32 mx-auto rounded-full mb-4 object-cover"
                  />

                  <h3 className="font-semibold text-lg mb-1">{member.name}</h3>
                  <p className="text-muted-foreground">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-linear-to-r from-orange-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready for Expert Repair?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Trust your devices to the professionals. Get started with your
            repair today.
          </p>
          <a
            href="/services/book"
            className="inline-flex items-center gap-2 bg-white text-orange-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Book a Repair
          </a>
        </div>
      </section>
    </div>
  );
}
