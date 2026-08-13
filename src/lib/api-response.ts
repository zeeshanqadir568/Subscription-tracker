import { NextResponse } from "next/server";
import type { ZodError } from "zod";

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function apiError(
  message: string,
  status = 400,
  options?: { code?: string; fields?: Record<string, string> },
) {
  return NextResponse.json(
    { error: { message, code: options?.code, fields: options?.fields } },
    { status },
  );
}

/** Flattens a Zod error into a flat `{ fieldPath: message }` map for API responses. */
export function flattenZodErrors(error: ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".") || "_root";
    if (!fields[path]) fields[path] = issue.message;
  }
  return fields;
}
