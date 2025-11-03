import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { type NextRequest } from "next/server";
import { z } from "zod";

const addressSchema = z.object({
  label: z.string().min(1),
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
  isDefault: z.boolean().optional().default(false),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return errorResponse("UNAUTHORIZED", "Authentication required", 401);
    }

    const userId = (session.user as any).id;

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return successResponse({ addresses });
  } catch (error) {
    console.error("Addresses fetch error:", error);
    return errorResponse("INTERNAL_ERROR", "Failed to fetch addresses", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return errorResponse("UNAUTHORIZED", "Authentication required", 401);
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const data = addressSchema.parse(body);

    // If setting as default, unset other default addresses
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        ...data,
        userId,
      },
    });

    return successResponse({ address });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse("VALIDATION_ERROR", error.errors[0].message, 400);
    }
    console.error("Address creation error:", error);
    return errorResponse("INTERNAL_ERROR", "Failed to create address", 500);
  }
}
