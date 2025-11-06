import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { asyncHandler } from "@/lib/middleware/error-handler";
import {
  successResponse,
  paginatedResponse,
  createdResponse,
} from "@/lib/api-response";
import { createDeviceSchema, deviceQuerySchema } from "@/lib/schemas/device";
import { deviceService } from "@/lib/services/device.service";

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
  const filters = deviceQuerySchema.parse({
    search: searchParams.get("search") ?? undefined,
    deviceType: searchParams.get("deviceType") ?? undefined,
    brand: searchParams.get("brand") ?? undefined,
  });

  const result = await deviceService.getUserDevices(userId, {
    ...filters,
    page: Number(searchParams.get("page")) || 1,
    limit: Number(searchParams.get("limit")) || 10,
  });

  // Return a standardized paginated response where `data` is the array of devices
  return paginatedResponse(result.devices, {
    page: result.pagination.page,
    limit: result.pagination.limit,
    total: result.pagination.total,
  });
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
  const data = createDeviceSchema.parse(body);

  const device = await deviceService.createDevice(userId, data);
  // Return 201 Created with consistent shape { device }
  return createdResponse({ device });
});
