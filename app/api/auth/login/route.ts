import { asyncHandler } from "@/lib/middleware/error-handler";
import { successResponse, errorResponse } from "@/lib/api-response";
import { userLoginSchema } from "@/lib/schemas/user";
import { authService } from "@/lib/services";
import { loginRateLimiter } from "@/lib/rate-limit";

export const POST = asyncHandler(async (req: Request) => {
  const body = await req.json();
  const data = userLoginSchema.parse(body);

  const rl = loginRateLimiter();
  if (rl) {
    const ip = req.headers.get("x-forwarded-for") || "anonymous";
    const { success } = await rl.limit(`login:${ip}`);
    if (!success) {
      return errorResponse("RATE_LIMIT", "Too many attempts", 429);
    }
  }

  // Verify credentials (this does not create a session; use NextAuth signIn on client for session)
  const user = await authService.verifyCredentials(data.email, data.password);
  return successResponse({ user });
});
