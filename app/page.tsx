import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Wrench, Smartphone, Clock, Shield } from "lucide-react"

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-background to-slate-50">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold text-balance mb-4">
                We <span className="text-orange-600">fix it right!</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 text-balance">
                Professional device repair management system. Track your repairs from drop-off to pickup with ease.
              </p>
              <div className="flex gap-4">
                <Link href="/auth/signup">
                  <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
                    Start Now
                  </Button>
                </Link>
                <Link href="#features">
                  <Button size="lg" variant="outline">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Facebook%20banner-dhAJhucOP8QhIpfiRo5IXatQ0R6Mwr.png"
                alt="Repair Service"
                width={500}
                height={400}
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="max-w-7xl mx-auto px-4 py-20">
          <h2 className="text-3xl font-bold mb-12 text-center">Why Choose Servixing?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Smartphone,
                title: "Easy Registration",
                description: "Register your devices in seconds",
              },
              {
                icon: Wrench,
                title: "Expert Repairs",
                description: "Professional technicians on duty",
              },
              {
                icon: Clock,
                title: "Real-time Updates",
                description: "Track your repair status live",
              },
              {
                icon: Shield,
                title: "Warranty Protection",
                description: "All repairs covered by warranty",
              },
            ].map((feature) => (
              <div key={feature.title} className="bg-card border border-border rounded-lg p-6 text-center">
                <feature.icon className="h-12 w-12 mx-auto mb-4 text-orange-600" />
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-orange-600 text-white py-16">
          <div className="max-w-3xl mx-auto text-center px-4">
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-lg mb-8 opacity-90">
              Join thousands of customers who trust Servixing for their device repairs.
            </p>
            <Link href="/auth/signup">
              <Button size="lg" className="bg-white text-orange-600 hover:bg-slate-100">
                Create Your Account
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}
