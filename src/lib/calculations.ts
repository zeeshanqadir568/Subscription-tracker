import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  differenceInCalendarMonths,
  endOfMonth,
  isWithinInterval,
  startOfDay,
  startOfMonth,
} from "date-fns";

/**
 * Pure financial calculation utilities. No I/O, no Prisma types — kept
 * framework-agnostic so it's trivially unit-testable and reusable from both
 * server components and API routes.
 *
 * Money is handled in integer cents everywhere internally to avoid
 * floating-point drift when summing many subscriptions (0.1 + 0.2 style
 * errors). Dollars are only used at the input/output boundary.
 */

export type BillingCycle = "MONTHLY" | "YEARLY";

interface CostAndCycle {
  cost: number;
  billingCycle: BillingCycle;
}

interface CategorizedSubscription extends CostAndCycle {
  category: string;
}

export function toCents(dollars: number): number {
  return Math.round(dollars * 100);
}

export function fromCents(cents: number): number {
  return Math.round(cents) / 100;
}

export function getMonthlyEquivalentCents(
  costCents: number,
  cycle: BillingCycle,
): number {
  if (cycle === "MONTHLY") return costCents;
  return Math.round(costCents / 12);
}

export function getYearlyEquivalentCents(
  costCents: number,
  cycle: BillingCycle,
): number {
  if (cycle === "YEARLY") return costCents;
  return costCents * 12;
}

export interface BurnRateSummary {
  totalMonthlyCents: number;
  totalYearlyCents: number;
  activeCount: number;
}

/**
 * Sums per-subscription monthly/yearly equivalents (each already rounded to
 * the nearest cent) rather than rounding once at the end, so the total
 * always matches the sum of the per-row amounts shown in the UI.
 */
export function calculateBurnRate(
  subscriptions: CostAndCycle[],
): BurnRateSummary {
  let totalMonthlyCents = 0;
  let totalYearlyCents = 0;

  for (const subscription of subscriptions) {
    const costCents = toCents(subscription.cost);
    totalMonthlyCents += getMonthlyEquivalentCents(
      costCents,
      subscription.billingCycle,
    );
    totalYearlyCents += getYearlyEquivalentCents(
      costCents,
      subscription.billingCycle,
    );
  }

  return {
    totalMonthlyCents,
    totalYearlyCents,
    activeCount: subscriptions.length,
  };
}

export interface CategorySpend {
  category: string;
  monthlyCents: number;
}

export function getCategoryBreakdown(
  subscriptions: CategorizedSubscription[],
): CategorySpend[] {
  const totals = new Map<string, number>();

  for (const subscription of subscriptions) {
    const monthlyCents = getMonthlyEquivalentCents(
      toCents(subscription.cost),
      subscription.billingCycle,
    );
    totals.set(
      subscription.category,
      (totals.get(subscription.category) ?? 0) + monthlyCents,
    );
  }

  return Array.from(totals.entries())
    .map(([category, monthlyCents]) => ({ category, monthlyCents }))
    .sort((a, b) => b.monthlyCents - a.monthlyCents);
}

export interface UpcomingRenewals<T> {
  /** Includes overdue subscriptions (past nextRenewalDate) as the most urgent case. */
  dueWithin7Days: T[];
  /** 8-30 days out. Disjoint from dueWithin7Days. */
  dueWithin30Days: T[];
}

export interface SpendForecastPoint {
  /** First day of the forecasted month. */
  date: Date;
  totalCents: number;
}

interface ForecastSubscription extends CostAndCycle {
  nextRenewalDate: Date;
}

/**
 * Projects real cash outflow for each of the next `months` months: monthly
 * subscriptions contribute every month, yearly subscriptions contribute only
 * in the month their renewal actually lands (found by walking the known
 * `nextRenewalDate` forward/backward in 12-month steps). No synthetic or
 * historical data — every dollar here traces back to a real subscription.
 */
export function getSpendForecast(
  subscriptions: ForecastSubscription[],
  months: number,
  referenceDate: Date = new Date(),
): SpendForecastPoint[] {
  const horizonStart = startOfMonth(referenceDate);

  return Array.from({ length: months }, (_, i) => {
    const monthStart = addMonths(horizonStart, i);
    const window = { start: monthStart, end: endOfMonth(monthStart) };

    let totalCents = 0;
    for (const subscription of subscriptions) {
      const costCents = toCents(subscription.cost);
      if (subscription.billingCycle === "MONTHLY") {
        totalCents += costCents;
        continue;
      }

      let occurrence = subscription.nextRenewalDate;
      while (occurrence > window.end) occurrence = addMonths(occurrence, -12);
      while (occurrence < window.start) occurrence = addMonths(occurrence, 12);
      if (isWithinInterval(occurrence, window)) {
        totalCents += costCents;
      }
    }

    return { date: monthStart, totalCents };
  });
}

export type TrialUrgency = "green" | "yellow" | "red";

/**
 * green: 10+ days left · yellow: 4-9 days left (about a week) · red: 3 days
 * or fewer, including a trial that's already ended and about to bill.
 */
export function getTrialUrgency(daysLeft: number): TrialUrgency {
  if (daysLeft >= 10) return "green";
  if (daysLeft >= 4) return "yellow";
  return "red";
}

export function getDaysUntil(
  date: Date,
  referenceDate: Date = new Date(),
): number {
  return differenceInCalendarDays(startOfDay(date), startOfDay(referenceDate));
}

interface SpendTrackedSubscription extends CostAndCycle {
  createdAt: Date;
}

/**
 * Estimated total charged for a subscription so far: one period's cost for
 * every billing cycle completed since it was added, including the initial
 * charge at signup. There's no real payment ledger, so this assumes billing
 * started exactly on `createdAt` and every cycle since has been paid in
 * full — an estimate, not a reconciled total.
 */
export function getTotalSpentCents(
  subscription: SpendTrackedSubscription,
  referenceDate: Date = new Date(),
): number {
  const periodMonths = subscription.billingCycle === "MONTHLY" ? 1 : 12;
  const monthsElapsed = Math.max(
    0,
    differenceInCalendarMonths(referenceDate, subscription.createdAt),
  );
  const completedPeriods = Math.floor(monthsElapsed / periodMonths) + 1;
  return completedPeriods * toCents(subscription.cost);
}

export function getUpcomingRenewals<T extends { nextRenewalDate: Date }>(
  subscriptions: T[],
  referenceDate: Date = new Date(),
): UpcomingRenewals<T> {
  const today = startOfDay(referenceDate);
  const sevenDaysOut = addDays(today, 7);
  const thirtyDaysOut = addDays(today, 30);

  const dueWithin7Days: T[] = [];
  const dueWithin30Days: T[] = [];

  for (const subscription of subscriptions) {
    const renewal = startOfDay(subscription.nextRenewalDate);
    if (renewal <= sevenDaysOut) {
      dueWithin7Days.push(subscription);
    } else if (renewal <= thirtyDaysOut) {
      dueWithin30Days.push(subscription);
    }
  }

  return { dueWithin7Days, dueWithin30Days };
}
