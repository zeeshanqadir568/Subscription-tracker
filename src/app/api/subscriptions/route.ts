import type { NextRequest } from "next/server";
import { apiError, apiSuccess, flattenZodErrors } from "@/lib/api-response";
import { UnauthorizedError, requireUserId } from "@/lib/auth";
import { createSubscription, listSubscriptions } from "@/lib/data/subscriptions";
import { subscriptionSchema } from "@/lib/validations/subscription";

export async function GET() {
  try {
    const userId = await requireUserId();
    const subscriptions = await listSubscriptions(userId);
    return apiSuccess(subscriptions);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return apiError("Unauthorized", 401);
    }
    console.error("Failed to list subscriptions:", error);
    return apiError("Something went wrong. Please try again.", 500);
  }
}

export async function POST(request: NextRequest) {
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

    const subscription = await createSubscription(userId, parsed.data);
    return apiSuccess(subscription, 201);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return apiError("Unauthorized", 401);
    }
    console.error("Failed to create subscription:", error);
    return apiError("Something went wrong. Please try again.", 500);
  }
}
