import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { asyncHandler } from "@/lib/middleware/error-handler";
import { successResponse } from "@/lib/api-response";
import { deviceService } from "@/lib/services/device.service";

export const DELETE = asyncHandler(
  async (_req: Request, { params }: { params: { id: string } }) => {
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

    const result = await deviceService.deleteDevice(params.id, userId);
    return successResponse(result);
  }
);
