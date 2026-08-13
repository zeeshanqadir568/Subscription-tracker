import type { NextRequest } from "next/server";
import { apiError, apiSuccess, flattenZodErrors } from "@/lib/api-response";
import { UnauthorizedError, requireUserId } from "@/lib/auth";
import {
  NotFoundError,
  deleteSubscription,
  getSubscription,
  updateSubscription,
} from "@/lib/data/subscriptions";
import { subscriptionSchema } from "@/lib/validations/subscription";

interface RouteParams {
  params: Promise<{ id: string }>;
}

function handleError(error: unknown) {
  if (error instanceof UnauthorizedError) {
    return apiError("Unauthorized", 401);
  }
  if (error instanceof NotFoundError) {
    return apiError("Subscription not found", 404);
  }
  console.error("Subscription request failed:", error);
  return apiError("Something went wrong. Please try again.", 500);
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  try {
    const userId = await requireUserId();
    const subscription = await getSubscription(userId, id);
    return apiSuccess(subscription);
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  try {
    const userId = await requireUserId();

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiError("Request body must be valid JSON", 400);
    }

    const parsed = subscriptionSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Invalid subscription details", 422, {
        fields: flattenZodErrors(parsed.error),
      });
    }

    const subscription = await updateSubscription(userId, id, parsed.data);
    return apiSuccess(subscription);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  try {
    const userId = await requireUserId();
    await deleteSubscription(userId, id);
    return apiSuccess({ id });
  } catch (error) {
    return handleError(error);
  }
}
