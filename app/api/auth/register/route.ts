import { asyncHandler } from "@/lib/middleware/error-handler";
import { successResponse } from "@/lib/api-response";
import { userRegistrationSchema } from "@/lib/schemas/user";
import { authService } from "@/lib/services";
import { registerRateLimiter } from "@/lib/rate-limit";

export const POST = asyncHandler(async (req: Request) => {
  const body = await req.json();
  const data = userRegistrationSchema.parse(body);

  // Rate limit if Redis is configured
  const rl = registerRateLimiter();
  if (rl) {
    const ip = req.headers.get("x-forwarded-for") || "anonymous";
    const { success } = await rl.limit(`register:${ip}`);
    if (!success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: "RATE_LIMIT", message: "Too many attempts" },
        }),
        { status: 429, headers: { "content-type": "application/json" } }
      );
    }
  }

  const user = await authService.register(data);
  return successResponse({ user });
});
