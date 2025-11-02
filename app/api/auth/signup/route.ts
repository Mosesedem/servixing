import { authService } from "@/lib/services";
import { userRegistrationSchema } from "@/lib/schemas/user";
import { asyncHandler } from "@/lib/middleware/error-handler";

export const POST = asyncHandler(async (req: Request) => {
  const body = await req.json();
  const data = userRegistrationSchema.parse(body);
  const user = await authService.register(data);
  return new Response(
    JSON.stringify({ message: "User created successfully", userId: user.id }),
    {
      status: 201,
      headers: { "content-type": "application/json" },
    }
  );
});
