import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { type NextRequest } from "next/server";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return errorResponse("UNAUTHORIZED", "Authentication required", 401);
    }

    const userId = (session.user as any).id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        password: true, // To check if user has password
        accounts: {
          select: {
            provider: true,
          },
        },
        createdAt: true,
      },
    });

    if (!user) {
      return errorResponse("NOT_FOUND", "User not found", 404);
    }

    return successResponse({ user });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return errorResponse("INTERNAL_ERROR", "Failed to fetch profile", 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return errorResponse("UNAUTHORIZED", "Authentication required", 401);
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const data = updateProfileSchema.parse(body);

    // Check if email is being changed and if it's already taken
    if (data.email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser && existingUser.id !== userId) {
        return errorResponse("VALIDATION_ERROR", "Email already in use", 400);
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    return successResponse({ user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse("VALIDATION_ERROR", error.errors[0].message, 400);
    }
    console.error("Profile update error:", error);
    return errorResponse("INTERNAL_ERROR", "Failed to update profile", 500);
  }
}
