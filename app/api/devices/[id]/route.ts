import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { asyncHandler } from "@/lib/middleware/error-handler";
import { successResponse } from "@/lib/api-response";
import { updateDeviceSchema } from "@/lib/schemas/device";
import { deviceService } from "@/lib/services/device.service";

/**
 * GET /api/devices/[id]
 * Get device details
 */
export const GET = asyncHandler(
  async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
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

    const { id } = await params;
    const device = await deviceService.getDeviceById(id, userId);
    return successResponse({ device });
  }
);

/**
 * PUT /api/devices/[id]
 * Update device
 */
export const PUT = asyncHandler(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
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
    const data = updateDeviceSchema.parse(body);

    const { id } = await params;
    const device = await deviceService.updateDevice(id, userId, data);
    return successResponse({ device });
  }
);

/**
 * DELETE /api/devices/[id]
 * Delete device (soft delete)
 */
export const DELETE = asyncHandler(
  async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
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

    const { id } = await params;
    const result = await deviceService.deleteDevice(id, userId);
    return successResponse(result);
  }
);
