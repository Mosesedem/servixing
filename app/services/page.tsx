import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Smartphone,
  Laptop,
  Tablet,
  Monitor,
  Battery,
  Droplets,
  Wrench,
  HardDrive,
  CheckCircle,
  Clock,
  Shield,
  Currency,
  EuroIcon,
  Diff,
  Dot,
} from "lucide-react";

export default function ServicesPage() {
  const services = [
    {
      icon: Smartphone,
      category: "Mobile Repairs",
      description: "Expert smartphone and mobile device repairs",
      services: [
        {
          name: "Screen Replacement",
          price: "From ₦20,000",
          duration: "1-2 hours",
        },
        {
          name: "Battery Replacement",
          price: "From ₦20,000",
          duration: "30 mins",
        },
        {
          name: "Charging Port Repair",
          price: "From ₦20,000",
          duration: "1 hour",
        },
        {
          name: "Camera Replacement",
          price: "From ₦20,000",
          duration: "1-2 hours",
        },
      ],
      color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
    },
    {
      icon: Laptop,
      category: "Laptop Repairs",
      description: "Professional laptop and notebook servicing",
      services: [
        {
          name: "Keyboard Replacement",
          price: "From ₦20,000",
          duration: "2-3 hours",
        },
        {
          name: "Screen Replacement",
          price: "From ₦20,000",
          duration: "2-4 hours",
        },
        { name: "SSD/HDD Upgrade", price: "From ₦99", duration: "1-2 hours" },
        {
          name: "Motherboard Repair",
          price: "From ₦50,000",
          duration: "3-5 days",
        },
      ],
      color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30",
    },
    {
      icon: Tablet,
      category: "Tablet Repairs",
      description: "iPad and tablet repair services",
      services: [
        {
          name: "Screen Replacement",
          price: "From ₦20,000",
          duration: "2-3 hours",
        },
        {
          name: "Battery Replacement",
          price: "From ₦20,000",
          duration: "1-2 hours",
        },
        {
          name: "Charging Port Repair",
          price: "From ₦20,000",
          duration: "1 hour",
        },
        {
          name: "Software Restoration",
          price: "From ₦20,000",
          duration: "1 hour",
        },
      ],
      color: "text-green-600 bg-green-100 dark:bg-green-900/30",
    },
    {
      icon: Monitor,
      category: "Servers and Desktops",
      description: "Business machines, Desktop computer and monitor services",
      services: [
        {
          name: "Hardware Upgrade",
          price: "From ₦20,000",
          duration: "1-2 hours",
        },
        { name: "Virus Removal", price: "From ₦20,000", duration: "2-4 hours" },
        { name: "Data Recovery", price: "From ₦20,000", duration: "3-7 days" },
        { name: "Monitor Repair", price: "From ₦20,000", duration: "2-3 days" },
      ],
      color: "text-orange-600 bg-orange-100 dark:bg-orange-900/30",
    },
  ];

  const specialServices = [
    {
      icon: Droplets,
      title: "Water Damage Recovery",
      description:
        "Specialized treatment for liquid-damaged devices with advanced cleaning techniques",
      features: [
        "Free diagnostic",
        "Ultrasonic cleaning",
        "Component-level repair",
      ],
      price: "From ₦20,000",
    },
    {
      icon: HardDrive,
      title: "Data Recovery",
      description:
        "Professional data recovery from damaged, corrupted, or failed storage devices",
      features: ["No data, no charge", "Secure process", "All storage types"],
      price: "From ₦20,000",
    },
    {
      icon: Wrench,
      title: "Enterprise & Custom Builds",
      description:
        "Business computer solutions and Custom PC builds tailored to your needs -Servers, gaming, workstation, or home office",
      features: [
        "Expert consultation",
        "Quality components",
        "Cable management",
      ],
      price: "Quote-based",
    },
    {
      icon: Shield,
      title: "Warranty & Device Status Check",
      description:
        "Real-time warranty status and device status check for Apple and Dell devices",
      features: [
        "Apple & Dell support",
        "IMEI status check",
        "Instant results",
      ],
      price: "₦100",
      link: "/services/warranty-device-check",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-linear-to-br from-orange-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">Our Services</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Professional device repair services with transparent pricing, fast
            turnaround, and 90-day warranty on all repairs.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium">Free Diagnostics</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium">90-Day Warranty</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium">Expert Technicians</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Services */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-8">
          {services.map((service) => (
            <Card key={service.category} className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className={`p-3 rounded-lg ₦{service.color}`}>
                  <service.icon className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    {service.category}
                  </h2>
                  <p className="text-muted-foreground">{service.description}</p>
                </div>
              </div>

              <div className="space-y-4">
                {service.services.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{item.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Dot className="h-4 w-4" />
                          {item.price}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {item.duration}
                        </div>
                      </div>
                    </div>
                    <Link href="/services/book">
                      <Button size="sm" variant="outline">
                        Book Now
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Special Services */}
      <section className="bg-gray-50 dark:bg-gray-900/50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Specialized Services</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Advanced repair solutions for complex issues
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {specialServices.map((service) => (
              <Card
                key={service.title}
                className="p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="inline-flex p-4 rounded-full bg-orange-100 dark:bg-orange-900/30 mb-4">
                  <service.icon className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                <p className="text-muted-foreground mb-4">
                  {service.description}
                </p>

                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-center gap-2 text-sm"
                    >
                      <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mb-4">
                  <span className="text-2xl font-bold text-orange-600">
                    {service.price}
                  </span>
                </div>

                <Link href={service.link || "/services/book"}>
                  <Button className="w-full bg-orange-600 hover:bg-orange-700">
                    {service.link ? "Check Device" : "Request Service"}
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Repair Process</h2>
          <p className="text-lg text-muted-foreground">
            Simple, transparent, and hassle-free
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {[
            {
              step: "1",
              title: "Book Online",
              desc: "Schedule your repair appointment online or visit us",
            },
            {
              step: "2",
              title: "Free Diagnosis",
              desc: "Our experts assess the issue at no charge",
            },
            {
              step: "3",
              title: "Get Quote",
              desc: "Receive transparent pricing before we proceed",
            },
            {
              step: "4",
              title: "Fast Repair",
              desc: "Most repairs completed same-day with warranty",
            },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-600 text-white text-xl font-bold mb-4">
                {item.step}
              </div>
              <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-orange-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <Shield className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            90-Day Warranty on All Repairs
          </h2>
          <p className="text-lg mb-8 opacity-90">
            We stand behind our work. All repairs come with a 90-day warranty
            covering parts and labor. Your satisfaction is guaranteed.
          </p>
          <Link href="/services/book">
            <Button
              size="lg"
              className="bg-white text-orange-600 hover:bg-gray-100 h-12 px-8 text-base font-semibold"
            >
              Book Your Repair Today
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
