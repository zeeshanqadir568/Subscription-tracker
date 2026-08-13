import bcrypt from "bcryptjs";
import { Prisma } from "@/generated/prisma/client";
import { apiError, apiSuccess, flattenZodErrors } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";

const DUPLICATE_EMAIL_MESSAGE =
  "An account with this email already exists. Sign in instead.";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("Request body must be valid JSON", 400);
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("Invalid registration details", 422, {
      fields: flattenZodErrors(parsed.error),
    });
  }

  const { name, email, password } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return apiError(DUPLICATE_EMAIL_MESSAGE, 409, { code: "EMAIL_TAKEN" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
      select: { id: true, email: true, name: true },
    });

    return apiSuccess(user, 201);
  } catch (error) {
    // Defends against a race between the findUnique check and create() above
    // (two concurrent signups for the same email) — still surface the
    // friendly duplicate-account message instead of a generic failure.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return apiError(DUPLICATE_EMAIL_MESSAGE, 409, { code: "EMAIL_TAKEN" });
    }
    console.error("Failed to register user:", error);
    return apiError("Something went wrong. Please try again.", 500);
  }
}
