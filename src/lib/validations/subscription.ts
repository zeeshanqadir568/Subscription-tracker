import { z } from "zod";
import { CATEGORIES } from "@/lib/categories";

export const BILLING_CYCLES = ["MONTHLY", "YEARLY"] as const;

export const subscriptionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or fewer"),
  cost: z.coerce
    .number({ message: "Cost must be a number" })
    .positive("Cost must be greater than 0")
    .max(1_000_000, "Cost is unreasonably large"),
  billingCycle: z.enum(BILLING_CYCLES, {
    message: "Select a billing cycle",
  }),
  nextRenewalDate: z.coerce.date({ message: "Enter a valid date" }),
  // When true, nextRenewalDate is the trial end date and cost/billingCycle
  // describe the charge that kicks in once it ends.
  isFreeTrial: z.boolean().default(false),
  category: z.enum(CATEGORIES, { message: "Select a category" }),
  notes: z
    .string()
    .trim()
    .max(500, "Notes must be 500 characters or fewer")
    .optional()
    .or(z.literal("")),
});

export type SubscriptionInput = z.infer<typeof subscriptionSchema>;
