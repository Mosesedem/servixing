"use client";

import type React from "react";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("=== SIGNIN FORM SUBMIT ===");
    console.log("Email:", email);

    setError("");
    setLoading(true);

    try {
      console.log("Calling signIn with credentials...");
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      console.log("SignIn result:", {
        ok: result?.ok,
        error: result?.error,
        status: result?.status,
        url: result?.url,
      });

      if (result?.error) {
        console.error("SignIn error:", result.error);
        setError("Invalid email or password");
      } else if (result?.ok) {
        console.log("SignIn successful - redirecting to /dashboard");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("=== SIGNIN EXCEPTION ===");
      console.error("Error:", error);
      setError("An error occurred during sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    console.log("=== GOOGLE SIGNIN ===");
    console.log("Initiating Google sign in with callback: /dashboard");
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Sign In</h1>
          <p className="text-muted-foreground">Welcome to Servixing</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-background text-muted-foreground">Or</span>
          </div>
        </div>

        <Button
          onClick={handleGoogleSignIn}
          variant="outline"
          className="w-full bg-transparent"
        >
          Sign in with Google
        </Button>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account?{" "}
          <Link href="/auth/signup" className="text-orange-600 hover:underline">
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  );
}
