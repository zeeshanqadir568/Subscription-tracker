import bcrypt from "bcryptjs";
import { apiError, apiSuccess, flattenZodErrors } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";

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
      return apiError("An account with this email already exists", 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
      select: { id: true, email: true, name: true },
    });

    return apiSuccess(user, 201);
  } catch (error) {
    console.error("Failed to register user:", error);
    return apiError("Something went wrong. Please try again.", 500);
  }
}
