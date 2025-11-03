import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { asyncHandler } from "@/lib/middleware/error-handler";
import { successResponse } from "@/lib/api-response";
import { z } from "zod";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

const updateNotesSchema = z.object({
  notes: z.string().max(2000, "Notes are too long"),
});

export const PUT = asyncHandler(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;
    const userRole = (session?.user as any)?.role as string | undefined;

    if (!userId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: "UNAUTHORIZED", message: "Unauthorized" },
        }),
        { status: 401, headers: { "content-type": "application/json" } }
      );
    }

    const { id: workOrderId } = await params;

    // Verify work order exists
    const workOrder = await db.workOrder.findUnique({
      where: { id: workOrderId },
      select: { userId: true, notes: true },
    });

    if (!workOrder) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: "NOT_FOUND", message: "Work order not found" },
        }),
        { status: 404, headers: { "content-type": "application/json" } }
      );
    }

    // Only admins and technicians can update notes
    const isAdmin =
      userRole === "ADMIN" ||
      userRole === "SUPER_ADMIN" ||
      userRole === "TECHNICIAN";

    if (!isAdmin) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Only staff can update work order notes",
          },
        }),
        { status: 403, headers: { "content-type": "application/json" } }
      );
    }

    const body = await req.json();
    const data = updateNotesSchema.parse(body);

    const updated = await db.workOrder.update({
      where: { id: workOrderId },
      data: { notes: data.notes },
    });

    logger.info(
      `Notes updated for work order ${workOrderId} by user ${userId}`
    );

    return successResponse({ workOrder: updated });
  }
);
