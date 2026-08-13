import { describe, expect, it } from "vitest";
import { subscriptionSchema } from "@/lib/validations/subscription";
import { registerSchema } from "@/lib/validations/auth";

const validSubscription = {
  name: "Vercel Pro",
  cost: 20,
  billingCycle: "MONTHLY" as const,
  nextRenewalDate: "2026-09-01",
  category: "Hosting & Infra",
};

describe("subscriptionSchema", () => {
  it("accepts a valid subscription", () => {
    expect(subscriptionSchema.safeParse(validSubscription).success).toBe(
      true,
    );
  });

  it("rejects an empty name", () => {
    const result = subscriptionSchema.safeParse({
      ...validSubscription,
      name: "   ",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a negative cost", () => {
    const result = subscriptionSchema.safeParse({
      ...validSubscription,
      cost: -10,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a zero cost", () => {
    const result = subscriptionSchema.safeParse({
      ...validSubscription,
      cost: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid date", () => {
    const result = subscriptionSchema.safeParse({
      ...validSubscription,
      nextRenewalDate: "not-a-date",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a category outside the allow-list", () => {
    const result = subscriptionSchema.safeParse({
      ...validSubscription,
      category: "Not A Real Category",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid billing cycle", () => {
    const result = subscriptionSchema.safeParse({
      ...validSubscription,
      billingCycle: "WEEKLY",
    });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("accepts valid registration input", () => {
    const result = registerSchema.safeParse({
      name: "Demo User",
      email: "demo@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = registerSchema.safeParse({
      name: "Demo User",
      email: "not-an-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a short password", () => {
    const result = registerSchema.safeParse({
      name: "Demo User",
      email: "demo@example.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });
});
