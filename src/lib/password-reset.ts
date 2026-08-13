import { randomBytes, createHash } from "crypto";
import { prisma } from "@/lib/prisma";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

/** Issues a fresh reset token for a user, invalidating any previous ones. Returns the raw token (only ever held in memory / the emailed link — never persisted). */
export async function createPasswordResetToken(
  userId: string,
): Promise<string> {
  const rawToken = randomBytes(32).toString("hex");

  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({ where: { userId } }),
    prisma.passwordResetToken.create({
      data: {
        tokenHash: hashToken(rawToken),
        userId,
        expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
      },
    }),
  ]);

  return rawToken;
}

/** Validates a raw token from a reset link. Returns the associated user id, or null if invalid/expired. Does not consume the token. */
export async function verifyPasswordResetToken(
  rawToken: string,
): Promise<string | null> {
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(rawToken) },
  });
  if (!record || record.expiresAt < new Date()) return null;
  return record.userId;
}

/** Deletes a used (or superseded) token so it can't be replayed. */
export async function consumePasswordResetToken(
  rawToken: string,
): Promise<void> {
  await prisma.passwordResetToken.deleteMany({
    where: { tokenHash: hashToken(rawToken) },
  });
}
