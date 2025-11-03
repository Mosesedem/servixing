import { asyncHandler } from "@/lib/middleware/error-handler";
import { resetPasswordSchema } from "@/lib/schemas/user";
import { authService } from "@/lib/services";
import { successResponse } from "@/lib/api-response";

export const POST = asyncHandler(async (req: Request) => {
  const body = await req.json();
  const { token, password } = resetPasswordSchema.parse(body);

  await authService.resetPassword(token, password);

  return successResponse({ message: "Password updated successfully" });
});
