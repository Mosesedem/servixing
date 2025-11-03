import type { NextAuthOptions, Session, User as NextAuthUser } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./db";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";

// Extended types for user with role
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: UserRole;
    };
  }

  interface User {
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
  }
}

// Log auth configuration on startup (only in development)
if (process.env.NODE_ENV === "development") {
  console.log("=== AUTH CONFIG INITIALIZATION ===");
  console.log("NEXTAUTH_SECRET exists:", !!process.env.NEXTAUTH_SECRET);
  console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
  console.log("GOOGLE_CLIENT_ID exists:", !!process.env.GOOGLE_CLIENT_ID);
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true, // Link Google account to existing email
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!user) {
          throw new Error("No user found with this email");
        }

        if (!user.password) {
          throw new Error("Please sign in with your social account");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        // Check if account is soft deleted
        if (user.deletedAt) {
          throw new Error("This account has been deactivated");
        }

        return {
          id: user.id,
          email: user.email!,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // For OAuth providers, ensure user has a role
      if (account?.provider === "google") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        // If user doesn't exist, they'll be created by the adapter
        // Set default role to CUSTOMER for new OAuth users
        if (!existingUser) {
          await prisma.user.update({
            where: { email: user.email! },
            data: { role: UserRole.CUSTOMER },
          });
        }
      }

      return true;
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      // For subsequent requests, get fresh user data
      if (!user && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { id: true, role: true, deletedAt: true },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;

          // Invalidate token if user is deleted
          if (dbUser.deletedAt) {
            return null as any;
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }

      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin", // Redirect errors to sign in page
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === "development",
};

/**
 * Get the current session on the server side
 * Usage: const session = await getServerSession();
 */
export async function getServerSession() {
  const { getServerSession: getSession } = await import("next-auth");
  return await getSession(authOptions);
}

/**
 * Get the current user from session
 * Returns null if not authenticated
 */
export async function getCurrentUser() {
  const session = await getServerSession();
  return session?.user ?? null;
}

/**
 * Require authentication - throws if not logged in
 * Usage: const user = await requireAuth();
 */
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized - Please sign in");
  }

  return user;
}

/**
 * Require specific role - throws if user doesn't have required role
 * Usage: await requireRole(UserRole.ADMIN);
 */
export async function requireRole(role: UserRole | UserRole[]) {
  const user = await requireAuth();

  const roles = Array.isArray(role) ? role : [role];

  if (!roles.includes(user.role)) {
    throw new Error(`Forbidden - Requires role: ${roles.join(" or ")}`);
  }

  return user;
}

/**
 * Check if user has permission
 * Usage: const canEdit = await hasPermission(UserRole.ADMIN);
 */
export async function hasPermission(
  role: UserRole | UserRole[]
): Promise<boolean> {
  try {
    await requireRole(role);
    return true;
  } catch {
    return false;
  }
}

/**
 * Hash password for storage
 * Usage: const hashedPassword = await hashPassword("password123");
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Verify password
 * Usage: const isValid = await verifyPassword("password123", hashedPassword);
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
