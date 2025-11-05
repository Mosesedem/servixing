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

  // Check if this was an upgrade from a public user
  const wasUpgraded =
    !user.createdAt ||
    new Date().getTime() - new Date(user.createdAt).getTime() > 60000; // Created more than 1 min ago

  return successResponse({
    user,
    message: wasUpgraded
      ? "Your account has been successfully created! Your previous repair requests and data have been linked to this account."
      : "Account created successfully!",
  });
});
