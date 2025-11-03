import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const isDevelopment = process.env.NODE_ENV === "development";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public paths that don't require authentication
  const publicPaths = [
    "/",
    "/auth/signin",
    "/auth/signup",
    "/api/auth", // NextAuth API routes
    "/api/health",
    "/test-auth",
    "/knowledge-base",
    "/support",
  ];

  // Check if current path is public
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  if (isPublicPath) {
    return NextResponse.next();
  }

  // Protected routes
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isAdminRoute = pathname.startsWith("/admin");
  const isProtectedRoute = isDashboardRoute || isAdminRoute;

  if (isProtectedRoute) {
    try {
      // Get JWT token
      const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
      });

      // Redirect to sign in if no token
      if (!token) {
        if (isDevelopment) {
          console.log(
            `� Protected route ${pathname} - No token, redirecting to signin`
          );
        }

        const url = new URL("/auth/signin", req.url);
        url.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(url);
      }

      // Check admin access for admin routes
      if (isAdminRoute) {
        const role = (token as any).role;
        const hasAdminAccess =
          role === "ADMIN" || role === "SUPER_ADMIN" || role === "TECHNICIAN";

        if (!hasAdminAccess) {
          if (isDevelopment) {
            console.log(
              `❌ User ${token.email} attempted to access admin route without permission`
            );
          }
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }
      }

      // Authentication successful
      return NextResponse.next();
    } catch (error) {
      console.error("Middleware error:", error);
      const url = new URL("/auth/signin", req.url);
      url.searchParams.set("error", "AuthenticationError");
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
