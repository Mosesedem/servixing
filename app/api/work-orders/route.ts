import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { asyncHandler } from "@/lib/middleware/error-handler";
import { successResponse } from "@/lib/api-response";
import { createWorkOrderSchema } from "@/lib/schemas/work-order";
import { workOrderService } from "@/lib/services/work-order.service";

export const GET = asyncHandler(async (req: Request) => {
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

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const status = searchParams.get("status") ?? undefined;
  const paymentStatus = searchParams.get("paymentStatus") ?? undefined;

  const result = await workOrderService.getUserWorkOrders(userId, {
    page,
    limit,
    status,
    paymentStatus,
  });

  return successResponse(result.workOrders, { pagination: result.pagination });
});

export const POST = asyncHandler(async (req: Request) => {
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

  const body = await req.json();
  const data = createWorkOrderSchema.parse(body);

  const workOrder = await workOrderService.createWorkOrder(userId, data);
  return successResponse({ workOrder });
});
