import { asyncHandler } from "@/lib/middleware/error-handler";
import { verifyResetTokenSchema } from "@/lib/schemas/user";
import { authService } from "@/lib/services";
import { successResponse } from "@/lib/api-response";

export const POST = asyncHandler(async (req: Request) => {
  const body = await req.json();
  const { token } = verifyResetTokenSchema.parse(body);

  const result = await authService.verifyResetToken(token);

  return successResponse({
    message: "Reset code verified",
    identifier: result.identifier,
    expires: result.expires,
  });
});
