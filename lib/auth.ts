import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./db";
import bcrypt from "bcryptjs";

// Log auth configuration on startup
console.log("=== AUTH CONFIG INITIALIZATION ===");
console.log("NEXTAUTH_SECRET exists:", !!process.env.NEXTAUTH_SECRET);
console.log(
  "NEXTAUTH_SECRET length:",
  process.env.NEXTAUTH_SECRET?.length || 0
);
console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
console.log("GOOGLE_CLIENT_ID exists:", !!process.env.GOOGLE_CLIENT_ID);
console.log("NODE_ENV:", process.env.NODE_ENV);

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("=== CREDENTIALS AUTHORIZE ===");
        console.log("Credentials received:", {
          email: credentials?.email,
          hasPassword: !!credentials?.password,
        });

        if (!credentials?.email || !credentials?.password) {
          console.error("Missing credentials");
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        console.log("User lookup result:", {
          found: !!user,
          userId: user?.id,
          hasPassword: !!user?.password,
        });

        if (!user) {
          console.error("User not found for email:", credentials.email);
          throw new Error("User not found");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password || ""
        );
        console.log("Password validation:", isPasswordValid);

        if (!isPasswordValid) {
          console.error("Invalid password for user:", user.id);
          throw new Error("Invalid password");
        }

        console.log("Authorization successful for user:", user.id);
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log("=== JWT CALLBACK ===");
      console.log("Has user:", !!user);
      if (user) {
        console.log("User data:", {
          id: user.id,
          email: user.email,
          role: (user as any).role,
        });
        token.id = user.id;
        token.role = (user as any).role;
      }
      console.log("Token after processing:", {
        id: token.id,
        role: token.role,
        email: token.email,
      });
      return token;
    },
    async session({ session, token }) {
      console.log("=== SESSION CALLBACK ===");
      console.log("Token data:", {
        id: token.id,
        role: token.role,
        email: token.email,
      });
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
      }
      console.log("Session after processing:", {
        hasUser: !!session.user,
        userId: session.user?.id,
        userEmail: session.user?.email,
        userRole: (session.user as any)?.role,
      });
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};
