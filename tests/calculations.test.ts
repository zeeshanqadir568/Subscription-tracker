import { addMonths, startOfMonth } from "date-fns";
import { describe, expect, it } from "vitest";
import {
  calculateBurnRate,
  fromCents,
  getCategoryBreakdown,
  getDaysUntil,
  getMonthlyEquivalentCents,
  getSpendForecast,
  getTotalSpentCents,
  getTrialUrgency,
  getUpcomingRenewals,
  getYearlyEquivalentCents,
  toCents,
} from "@/lib/calculations";

describe("toCents / fromCents", () => {
  it("converts dollars to integer cents and back", () => {
    expect(toCents(10)).toBe(1000);
    expect(toCents(9.99)).toBe(999);
    expect(fromCents(1000)).toBe(10);
    expect(fromCents(999)).toBe(9.99);
  });
});

describe("getMonthlyEquivalentCents", () => {
  it("leaves a monthly cost unchanged", () => {
    expect(getMonthlyEquivalentCents(1000, "MONTHLY")).toBe(1000);
  });

  it("pro-rates a $120/yr subscription to exactly $10.00/mo", () => {
    const yearlyCents = toCents(120);
    const monthlyCents = getMonthlyEquivalentCents(yearlyCents, "YEARLY");
    expect(monthlyCents).toBe(1000);
    expect(fromCents(monthlyCents)).toBe(10);
  });

  it("rounds a non-evenly-divisible yearly cost to the nearest cent", () => {
    // $100/yr -> 8.3333.../mo -> rounds to $8.33
    expect(getMonthlyEquivalentCents(toCents(100), "YEARLY")).toBe(833);
  });
});

describe("getYearlyEquivalentCents", () => {
  it("leaves a yearly cost unchanged", () => {
    expect(getYearlyEquivalentCents(1000, "YEARLY")).toBe(1000);
  });

  it("multiplies a monthly cost by 12", () => {
    // $10/mo -> $120/yr
    expect(getYearlyEquivalentCents(toCents(10), "MONTHLY")).toBe(12000);
  });
});

describe("calculateBurnRate", () => {
  it("returns zero totals for an empty list", () => {
    const result = calculateBurnRate([]);
    expect(result).toEqual({
      totalMonthlyCents: 0,
      totalYearlyCents: 0,
      activeCount: 0,
    });
  });

  it("sums a single $120/yr subscription to exactly $10.00 monthly burn", () => {
    const result = calculateBurnRate([
      { cost: 120, billingCycle: "YEARLY" },
    ]);
    expect(fromCents(result.totalMonthlyCents)).toBe(10);
    expect(fromCents(result.totalYearlyCents)).toBe(120);
    expect(result.activeCount).toBe(1);
  });

  it("sums mixed monthly and yearly subscriptions without floating point drift", () => {
    // Values chosen to be classic floating-point trouble spots (0.1 + 0.2 style).
    const result = calculateBurnRate([
      { cost: 0.1, billingCycle: "MONTHLY" },
      { cost: 0.2, billingCycle: "MONTHLY" },
      { cost: 10, billingCycle: "MONTHLY" },
      { cost: 120, billingCycle: "YEARLY" },
    ]);
    // 0.1 + 0.2 + 10 + 10 (120/12) = 20.3 exactly, in cents = 2030
    expect(result.totalMonthlyCents).toBe(2030);
    expect(fromCents(result.totalMonthlyCents)).toBe(20.3);
  });
});

describe("getCategoryBreakdown", () => {
  it("groups and sums monthly-equivalent spend per category", () => {
    const breakdown = getCategoryBreakdown([
      { cost: 10, billingCycle: "MONTHLY", category: "Dev Tools" },
      { cost: 120, billingCycle: "YEARLY", category: "Dev Tools" },
      { cost: 30, billingCycle: "MONTHLY", category: "Marketing" },
    ]);

    expect(breakdown).toEqual([
      { category: "Marketing", monthlyCents: 3000 },
      { category: "Dev Tools", monthlyCents: 2000 },
    ]);
  });

  it("returns an empty array for no subscriptions", () => {
    expect(getCategoryBreakdown([])).toEqual([]);
  });
});

describe("getSpendForecast", () => {
  const reference = new Date("2026-01-15T12:00:00Z");
  const horizonStart = startOfMonth(reference);

  it("returns one point per month, starting with the current month", () => {
    const forecast = getSpendForecast([], 3, reference);
    expect(forecast).toHaveLength(3);
    expect(forecast[0].date).toEqual(horizonStart);
    expect(forecast[1].date).toEqual(addMonths(horizonStart, 1));
    expect(forecast[2].date).toEqual(addMonths(horizonStart, 2));
  });

  it("charges a monthly subscription in every month of the horizon", () => {
    const forecast = getSpendForecast(
      [{ cost: 10, billingCycle: "MONTHLY", nextRenewalDate: reference }],
      4,
      reference,
    );
    expect(forecast.map((p) => p.totalCents)).toEqual([1000, 1000, 1000, 1000]);
  });

  it("charges a yearly subscription only in the month it renews", () => {
    const renewsInMonth2 = addMonths(horizonStart, 2);
    const forecast = getSpendForecast(
      [{ cost: 120, billingCycle: "YEARLY", nextRenewalDate: renewsInMonth2 }],
      4,
      reference,
    );
    expect(forecast.map((p) => p.totalCents)).toEqual([0, 0, 12000, 0]);
  });

  it("normalizes a yearly renewal date far outside the horizon to its in-window occurrence", () => {
    // Renewal date is 2 years out from the horizon's month-2 slot; the
    // subscription still renews annually, so it should land in month 2.
    const farFutureRenewal = addMonths(horizonStart, 2 + 24);
    const forecast = getSpendForecast(
      [{ cost: 120, billingCycle: "YEARLY", nextRenewalDate: farFutureRenewal }],
      4,
      reference,
    );
    expect(forecast.map((p) => p.totalCents)).toEqual([0, 0, 12000, 0]);
  });

  it("sums monthly and yearly subscriptions together in the month they overlap", () => {
    const renewsNow = horizonStart;
    const forecast = getSpendForecast(
      [
        { cost: 10, billingCycle: "MONTHLY", nextRenewalDate: reference },
        { cost: 120, billingCycle: "YEARLY", nextRenewalDate: renewsNow },
      ],
      2,
      reference,
    );
    expect(forecast.map((p) => p.totalCents)).toEqual([13000, 1000]);
  });

  it("returns an empty array when months is 0", () => {
    expect(getSpendForecast([], 0, reference)).toEqual([]);
  });
});

describe("getUpcomingRenewals", () => {
  const reference = new Date("2026-08-13T12:00:00Z");

  it("includes a renewal exactly 7 days out in the 7-day bucket", () => {
    const result = getUpcomingRenewals(
      [{ nextRenewalDate: new Date("2026-08-20T00:00:00Z") }],
      reference,
    );
    expect(result.dueWithin7Days).toHaveLength(1);
    expect(result.dueWithin30Days).toHaveLength(0);
  });

  it("includes a renewal exactly 30 days out in the 30-day bucket, not the 7-day one", () => {
    const result = getUpcomingRenewals(
      [{ nextRenewalDate: new Date("2026-09-12T00:00:00Z") }],
      reference,
    );
    expect(result.dueWithin7Days).toHaveLength(0);
    expect(result.dueWithin30Days).toHaveLength(1);
  });

  it("treats an overdue (past) renewal as urgent and puts it in the 7-day bucket", () => {
    const result = getUpcomingRenewals(
      [{ nextRenewalDate: new Date("2026-08-01T00:00:00Z") }],
      reference,
    );
    expect(result.dueWithin7Days).toHaveLength(1);
  });

  it("excludes a renewal more than 30 days out", () => {
    const result = getUpcomingRenewals(
      [{ nextRenewalDate: new Date("2026-09-20T00:00:00Z") }],
      reference,
    );
    expect(result.dueWithin7Days).toHaveLength(0);
    expect(result.dueWithin30Days).toHaveLength(0);
  });
});

describe("getTrialUrgency", () => {
  it("is green at exactly 10 days left", () => {
    expect(getTrialUrgency(10)).toBe("green");
  });

  it("is green for anything further out than 10 days", () => {
    expect(getTrialUrgency(30)).toBe("green");
  });

  it("is yellow at exactly 9 days left", () => {
    expect(getTrialUrgency(9)).toBe("yellow");
  });

  it("is yellow at exactly 4 days left", () => {
    expect(getTrialUrgency(4)).toBe("yellow");
  });

  it("is red at exactly 3 days left", () => {
    expect(getTrialUrgency(3)).toBe("red");
  });

  it("is red once the trial has already ended", () => {
    expect(getTrialUrgency(-1)).toBe("red");
  });
});

describe("getTotalSpentCents", () => {
  it("counts the initial charge even on the day it was added", () => {
    const reference = new Date("2026-08-13T12:00:00Z");
    const spent = getTotalSpentCents(
      { cost: 10, billingCycle: "MONTHLY", createdAt: reference },
      reference,
    );
    expect(spent).toBe(1000);
  });

  it("adds one more monthly charge per full month elapsed", () => {
    const spent = getTotalSpentCents(
      {
        cost: 10,
        billingCycle: "MONTHLY",
        createdAt: new Date("2026-05-13T00:00:00Z"),
      },
      new Date("2026-08-13T00:00:00Z"),
    );
    // May, Jun, Jul, Aug charges = 4
    expect(spent).toBe(4000);
  });

  it("only charges a yearly subscription once per 12 elapsed months", () => {
    const spent = getTotalSpentCents(
      {
        cost: 120,
        billingCycle: "YEARLY",
        createdAt: new Date("2025-08-13T00:00:00Z"),
      },
      new Date("2026-08-13T00:00:00Z"),
    );
    // Exactly one year elapsed -> 2 charges (signup + renewal)
    expect(spent).toBe(24000);
  });

  it("never counts a partial period as a future charge", () => {
    const spent = getTotalSpentCents(
      {
        cost: 120,
        billingCycle: "YEARLY",
        createdAt: new Date("2026-01-01T00:00:00Z"),
      },
      new Date("2026-08-13T00:00:00Z"),
    );
    expect(spent).toBe(12000);
  });
});

describe("getDaysUntil", () => {
  it("returns 0 for the same calendar day", () => {
    const day = new Date("2026-08-13T18:00:00Z");
    expect(getDaysUntil(day, new Date("2026-08-13T02:00:00Z"))).toBe(0);
  });

  it("returns a positive count for a future date", () => {
    const reference = new Date("2026-08-13T12:00:00Z");
    expect(getDaysUntil(new Date("2026-08-20T00:00:00Z"), reference)).toBe(7);
  });

  it("returns a negative count for a past date", () => {
    const reference = new Date("2026-08-13T12:00:00Z");
    expect(getDaysUntil(new Date("2026-08-10T00:00:00Z"), reference)).toBe(
      -3,
    );
  });
});
