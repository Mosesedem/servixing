import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  console.log("\n" + "=".repeat(50));
  console.log("=== MIDDLEWARE START ===");
  console.log("=".repeat(50));
  console.log("⏰ Timestamp:", new Date().toISOString());
  console.log("📍 Path:", pathname);
  console.log("🔗 Full URL:", req.url);
  console.log("🌐 Method:", req.method);
  console.log(
    "🍪 Cookies:",
    req.cookies
      .getAll()
      .map((c) => c.name)
      .join(", ")
  );

  // Public paths - be more specific
  const publicPaths = [
    "/auth/signin",
    "/auth/signup",
    "/api/auth", // NextAuth API routes
    "/api/health",
    "/test-auth",
  ];

  console.log("\n--- PUBLIC PATH CHECK ---");
  console.log("🔍 Checking if path is public...");
  console.log("📋 Public paths list:", publicPaths);

  // Check if path exactly matches "/" or starts with any public path
  const isRootPath = pathname === "/";
  const matchingPublicPath = publicPaths.find((p) => pathname.startsWith(p));
  const isPublicPath = isRootPath || !!matchingPublicPath;

  console.log("🏠 Is root path (/):", isRootPath);
  console.log("🔓 Matching public path:", matchingPublicPath || "none");
  console.log("✅ Is public path:", isPublicPath);

  if (isPublicPath) {
    console.log("\n✔️  PUBLIC PATH DETECTED - ALLOWING ACCESS");
    console.log("=".repeat(50) + "\n");
    return NextResponse.next();
  }

  console.log("\n--- PROTECTED ROUTE CHECK ---");
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isAdminRoute = pathname.startsWith("/admin");
  const isProtectedRoute = isDashboardRoute || isAdminRoute;

  console.log("🏢 Is dashboard route:", isDashboardRoute);
  console.log("👑 Is admin route:", isAdminRoute);
  console.log("🔒 Is protected route:", isProtectedRoute);

  // Protect dashboard and admin
  if (isProtectedRoute) {
    console.log("\n🔐 PROTECTED ROUTE - CHECKING AUTHENTICATION");

    try {
      console.log("\n--- TOKEN RETRIEVAL ---");
      console.log("🔑 Attempting to get JWT token...");
      console.log("🔧 NEXTAUTH_SECRET exists:", !!process.env.NEXTAUTH_SECRET);
      console.log(
        "🔧 NEXTAUTH_SECRET length:",
        process.env.NEXTAUTH_SECRET?.length || 0
      );

      const tokenStartTime = Date.now();
      const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
      });
      const tokenEndTime = Date.now();

      console.log(
        "⏱️  Token retrieval took:",
        tokenEndTime - tokenStartTime,
        "ms"
      );
      console.log("\n--- TOKEN DETAILS ---");
      console.log("✅ Has token:", !!token);

      if (token) {
        console.log("📧 Token email:", token.email);
        console.log("🆔 Token id:", token.id);
        console.log("👤 Token name:", token.name);
        console.log("🎭 Token role:", (token as any)?.role);
        // Normalize exp to a number (seconds since epoch) if possible before arithmetic
        const expValue: number | undefined =
          typeof (token as any)?.exp === "number"
            ? (token as any).exp
            : typeof (token as any)?.exp === "string" &&
              /^\d+$/.test((token as any).exp)
            ? parseInt((token as any).exp, 10)
            : undefined;
        console.log(
          "⏰ Token exp:",
          expValue ? new Date(expValue * 1000).toISOString() : "none"
        );
        console.log("📦 Full token keys:", Object.keys(token).join(", "));
      } else {
        console.log("❌ Token is null/undefined");
      }

      if (!token) {
        console.log("\n--- AUTHENTICATION FAILED ---");
        console.log("🚫 No valid token found");
        console.log("↩️  Redirecting to sign in page...");

        const url = new URL("/auth/signin", req.url);
        url.searchParams.set("callbackUrl", req.nextUrl.pathname);

        console.log("🔗 Redirect URL:", url.toString());
        console.log("📍 Callback URL set to:", req.nextUrl.pathname);
        console.log("=".repeat(50) + "\n");

        return NextResponse.redirect(url);
      }

      console.log("\n✅ TOKEN VALID - USER AUTHENTICATED");

      // Admin routes require admin role
      if (isAdminRoute) {
        console.log("\n--- ADMIN AUTHORIZATION CHECK ---");
        const role = (token as any).role;
        console.log("👑 Current user role:", role);
        console.log("🎯 Required roles: ADMIN or SUPER_ADMIN");

        const hasAdminAccess = role === "ADMIN" || role === "SUPER_ADMIN";
        console.log("✅ Has admin access:", hasAdminAccess);

        if (!hasAdminAccess) {
          console.log("\n--- AUTHORIZATION FAILED ---");
          console.log("🚫 User does not have admin privileges");
          console.log("↩️  Redirecting to /dashboard...");
          console.log("=".repeat(50) + "\n");

          return NextResponse.redirect(new URL("/dashboard", req.url));
        }

        console.log("✅ ADMIN AUTHORIZATION SUCCESSFUL");
      }

      console.log("\n🎉 AUTHENTICATION & AUTHORIZATION SUCCESSFUL");
      console.log("➡️  Allowing access to:", pathname);
      console.log("=".repeat(50) + "\n");

      return NextResponse.next();
    } catch (error) {
      console.log("\n" + "!".repeat(50));
      console.log("=== MIDDLEWARE ERROR ===");
      console.log("!".repeat(50));
      console.error("💥 Error type:", error?.constructor?.name);
      console.error(
        "❌ Error message:",
        error instanceof Error ? error.message : error
      );
      console.error("📍 Error occurred at path:", pathname);
      console.error(
        "🔍 Error stack:",
        error instanceof Error ? error.stack : "No stack trace available"
      );
      console.log("!".repeat(50) + "\n");

      throw error;
    }
  }

  console.log("\n--- UNPROTECTED ROUTE ---");
  console.log("✅ Path is not protected - allowing access");
  console.log("➡️  Proceeding to:", pathname);
  console.log("=".repeat(50) + "\n");

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/auth (NextAuth API routes)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
  ],
};
