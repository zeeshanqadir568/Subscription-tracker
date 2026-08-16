import type { BillingCycle } from "@/lib/calculations";

/** Client-safe subscription shape: dates as ISO strings, matching what API routes return as JSON. */
export interface SubscriptionClientDTO {
  id: string;
  name: string;
  cost: number;
  billingCycle: BillingCycle;
  nextRenewalDate: string;
  /** True while on a free trial — nextRenewalDate is the day billing starts. */
  isFreeTrial: boolean;
  category: string;
  notes: string | null;
}
