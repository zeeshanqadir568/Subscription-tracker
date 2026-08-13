import { apiError, apiSuccess, flattenZodErrors } from "@/lib/api-response";
import { sendPasswordResetEmail } from "@/lib/email";
import { createPasswordResetToken } from "@/lib/password-reset";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validations/auth";

const GENERIC_MESSAGE =
  "If an account exists for that email, we've sent a reset link.";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("Request body must be valid JSON", 400);
  }

  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("Invalid request", 422, {
      fields: flattenZodErrors(parsed.error),
    });
  }

  const { email } = parsed.data;

  try {
    // Same response whether or not the account exists — otherwise this
    // endpoint becomes a way to enumerate registered emails.
    const user = await prisma.user.findUnique({ where: { email } });
    if (user?.passwordHash) {
      const token = await createPasswordResetToken(user.id);
      const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
      await sendPasswordResetEmail(email, resetUrl);
    }
    return apiSuccess({ message: GENERIC_MESSAGE });
  } catch (error) {
    console.error("Failed to process password reset request:", error);
    // Still return the generic success shape — don't let email-provider
    // failures leak whether the account exists either.
    return apiSuccess({ message: GENERIC_MESSAGE });
  }
}
