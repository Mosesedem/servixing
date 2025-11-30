"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Package,
  Truck,
  MapPin,
  User,
  Phone,
  Mail,
  StickyNote,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
  };
}

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    deliveryType: "pickup" as "pickup" | "delivery",
    notes: "",
  });

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await fetch("/api/cart");
      const data = await response.json();
      setCartItems(data.items || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      alert("Please fill in all required fields.");
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          email: formData.email,
          provider: "paystack",
          metadata: {
            description: `Cart checkout - ${cartItems.length} item(s)`,
            name: formData.name,
            phone: formData.phone,
            address:
              formData.deliveryType === "delivery"
                ? formData.address
                : undefined,
            city:
              formData.deliveryType === "delivery" ? formData.city : undefined,
            state:
              formData.deliveryType === "delivery" ? formData.state : undefined,
            postalCode:
              formData.deliveryType === "delivery"
                ? formData.postalCode
                : undefined,
            deliveryType: formData.deliveryType,
            notes: formData.notes || undefined,
            cartItems: cartItems.map((item) => ({
              id: item.id,
              productId: item.product.id,
              quantity: item.quantity,
            })),
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message || "Payment initialization failed"
        );
      }

      const data = await response.json();
      router.push(`/payment/checkout?paymentId=${data.paymentId}`);
    } catch (error: any) {
      console.error("Checkout error:", error);
      alert(error.message || "Failed to process checkout. Please try again.");
      setProcessing(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-20 px-4">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-orange-600 border-r-transparent" />
          <p className="mt-6 text-lg text-muted-foreground">
            Preparing your checkout...
          </p>
        </div>
      </div>
    );
  }

  // Empty cart redirect
  if (cartItems.length === 0) {
    if (typeof window !== "undefined") router.push("/cart");
    return null;
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:py-12 lg:py-16">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-center sm:text-left mb-8">
          Checkout
        </h1>

        <form
          onSubmit={handleSubmit}
          className="grid lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {/* Main Form - Takes full width on mobile, 2 columns on large screens */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <User className="h-6 w-6 text-orange-600" />
                <h2 className="text-2xl font-semibold">Your Information</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    required
                    className="mt-1"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      required
                      className="mt-1 pl-10"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      required
                      className="mt-1 pl-10"
                      placeholder="+234 800 000 0000"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Delivery Method */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Package className="h-6 w-6 text-orange-600" />
                <h2 className="text-2xl font-semibold">Delivery Method</h2>
              </div>

              <RadioGroup
                value={formData.deliveryType}
                onValueChange={(value: "pickup" | "delivery") =>
                  setFormData((prev) => ({ ...prev, deliveryType: value }))
                }
                className="space-y-4"
              >
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition">
                  <RadioGroupItem value="pickup" id="pickup" />
                  <Label htmlFor="pickup" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Pickup at Service Center</p>
                        <p className="text-sm text-muted-foreground">
                          Free • Ready in 1-2 hours
                        </p>
                      </div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition">
                  <RadioGroupItem value="delivery" id="delivery" />
                  <Label htmlFor="delivery" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Truck className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Home Delivery</p>
                        <p className="text-sm text-muted-foreground">
                          Shipping calculated at payment
                        </p>
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>

              {/* Delivery Address Fields */}
              {formData.deliveryType === "delivery" && (
                <div className="mt-6 p-5 border rounded-lg bg-muted/30 space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-2 text-orange-600 font-medium">
                    <MapPin className="h-5 w-5" />
                    <span>Delivery Address</span>
                  </div>
                  <Input
                    placeholder="Street Address *"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="City *"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          city: e.target.value,
                        }))
                      }
                      required
                    />
                    <Input
                      placeholder="State *"
                      value={formData.state}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          state: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <Input
                    placeholder="Postal Code (Optional)"
                    value={formData.postalCode}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        postalCode: e.target.value,
                      }))
                    }
                  />
                </div>
              )}
            </Card>

            {/* Additional Notes */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <StickyNote className="h-6 w-6 text-orange-600" />
                <h2 className="text-2xl font-semibold">
                  Additional Notes (Optional)
                </h2>
              </div>
              <Textarea
                placeholder="Any special instructions for delivery or pickup? (e.g., Call before coming, leave at gate, etc.)"
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                rows={4}
                className="resize-none"
              />
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4 shadow-lg">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Package className="h-7 w-7 text-orange-600" />
                Order Summary
              </h2>

              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 pb-4 border-b last:border-0"
                  >
                    <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={
                          item.product.images[0] || "/images/accessories.png"
                        }
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm line-clamp-2">
                        {item.product.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        ₦{item.product.price.toLocaleString()} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-right">
                      ₦{(item.product.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t mt-6 pt-6 space-y-4">
                <div className="flex justify-between text-lg">
                  <span>Subtotal</span>
                  <span className="font-semibold">
                    ₦{total.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>
                    {formData.deliveryType === "pickup"
                      ? "Free"
                      : "Calculated at payment"}
                  </span>
                </div>
              </div>

              <div className="border-t -mx-6 my-6" />

              <div className="space-y-4">
                <div className="flex justify-between text-2xl font-bold">
                  <span>Total</span>
                  <span className="text-orange-600">
                    ₦{total.toLocaleString()}
                  </span>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full text-lg h-14 bg-orange-600 hover:bg-orange-700 font-bold"
                  disabled={processing}
                >
                  {processing ? (
                    <>Processing...</>
                  ) : (
                    <>Pay ₦{total.toLocaleString()} Now</>
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  Secured by Paystack • No card details stored
                </p>
              </div>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
}
