import bcrypt from "bcryptjs";
import { apiError, apiSuccess, flattenZodErrors } from "@/lib/api-response";
import {
  consumePasswordResetToken,
  verifyPasswordResetToken,
} from "@/lib/password-reset";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("Request body must be valid JSON", 400);
  }

  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("Invalid request", 422, {
      fields: flattenZodErrors(parsed.error),
    });
  }

  const { token, password } = parsed.data;

  try {
    const userId = await verifyPasswordResetToken(token);
    if (!userId) {
      return apiError(
        "This reset link is invalid or has expired. Request a new one.",
        400,
        { code: "INVALID_TOKEN" },
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    await consumePasswordResetToken(token);

    return apiSuccess({ message: "Password updated" });
  } catch (error) {
    console.error("Failed to reset password:", error);
    return apiError("Something went wrong. Please try again.", 500);
  }
}
