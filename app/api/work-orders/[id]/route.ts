import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { asyncHandler } from "@/lib/middleware/error-handler";
import { successResponse } from "@/lib/api-response";
import { updateWorkOrderSchema } from "@/lib/schemas/work-order";
import { workOrderService } from "@/lib/services/work-order.service";

export const GET = asyncHandler(
  async (req: Request, { params }: { params: { id: string } }) => {
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

    const workOrderId = params.id;
    const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";

    const workOrder = await workOrderService.getWorkOrderById(
      workOrderId,
      userId,
      isAdmin
    );

    return successResponse(workOrder);
  }
);

export const PUT = asyncHandler(
  async (req: Request, { params }: { params: { id: string } }) => {
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

    // Only admins and technicians can update work orders
    const canUpdate =
      userRole === "ADMIN" ||
      userRole === "SUPER_ADMIN" ||
      userRole === "TECHNICIAN";

    if (!canUpdate) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Only admins and technicians can update work orders",
          },
        }),
        { status: 403, headers: { "content-type": "application/json" } }
      );
    }

    const workOrderId = params.id;
    const body = await req.json();
    const data = updateWorkOrderSchema.parse(body);

    const updatedWorkOrder = await workOrderService.updateWorkOrder(
      workOrderId,
      data
    );

    return successResponse(updatedWorkOrder);
  }
);

export const DELETE = asyncHandler(
  async (req: Request, { params }: { params: { id: string } }) => {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;

    if (!userId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: "UNAUTHORIZED", message: "Unauthorized" },
        }),
        { status: 401, headers: { "content-type": "application/json" } }
      );
    }

    const workOrderId = params.id;
    const cancelledWorkOrder = await workOrderService.cancelWorkOrder(
      workOrderId,
      userId
    );

    return successResponse({
      message: "Work order cancelled successfully",
      workOrder: cancelledWorkOrder,
    });
  }
);
