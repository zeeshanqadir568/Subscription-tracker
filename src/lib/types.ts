import type { BillingCycle } from "@/lib/calculations";

/** Client-safe subscription shape: dates as ISO strings, matching what API routes return as JSON. */
export interface SubscriptionClientDTO {
  id: string;
  name: string;
  cost: number;
  billingCycle: BillingCycle;
  nextRenewalDate: string;
  category: string;
  notes: string | null;
}
