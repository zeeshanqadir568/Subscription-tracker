"use client";

import { Crown, Layers3, TrendingUp } from "lucide-react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import {
  fromCents,
  getCategoryBreakdown,
  getMonthlyEquivalentCents,
  toCents,
} from "@/lib/calculations";
import type { SubscriptionClientDTO } from "@/lib/types";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

/**
 * Quick-glance stat tiles derived purely from the current subscription
 * list — no fabricated trend data, since there's no historical spend log.
 */
export function InsightsRow({
  subscriptions,
}: {
  subscriptions: SubscriptionClientDTO[];
}) {
  if (subscriptions.length === 0) return null;

  const withMonthly = subscriptions.map((subscription) => ({
    ...subscription,
    monthlyCents: getMonthlyEquivalentCents(
      toCents(subscription.cost),
      subscription.billingCycle,
    ),
  }));

  const priciest = withMonthly.reduce((max, subscription) =>
    subscription.monthlyCents > max.monthlyCents ? subscription : max,
  );
  const topCategory = getCategoryBreakdown(subscriptions)[0];
  const totalMonthlyCents = withMonthly.reduce(
    (sum, subscription) => sum + subscription.monthlyCents,
    0,
  );
  const averageCents = Math.round(totalMonthlyCents / subscriptions.length);

  const insights = [
    {
      label: "Priciest subscription",
      value: priciest.name,
      detail: `${currencyFormatter.format(fromCents(priciest.monthlyCents))}/mo equiv.`,
      icon: Crown,
      color: "#c98500",
      bg: "color-mix(in oklch, #eda100 16%, transparent)",
    },
    {
      label: "Top category",
      value: topCategory?.category ?? "—",
      detail: topCategory
        ? `${currencyFormatter.format(fromCents(topCategory.monthlyCents))}/mo`
        : "No spend yet",
      icon: TrendingUp,
      color: "#4a3aa7",
      bg: "color-mix(in oklch, #4a3aa7 14%, transparent)",
    },
    {
      label: "Average per subscription",
      value: currencyFormatter.format(fromCents(averageCents)),
      detail: `${subscriptions.length} active`,
      icon: Layers3,
      color: "#199e70",
      bg: "color-mix(in oklch, #1baf7a 16%, transparent)",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {insights.map((insight, index) => (
        <SpotlightCard
          key={insight.label}
          size="sm"
          className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-500"
          style={{ animationDelay: `${index * 60 + 40}ms` }}
        >
          <CardHeader>
            <div className="flex items-center gap-2">
              <span
                className="flex size-7 shrink-0 items-center justify-center rounded-lg"
                style={{ background: insight.bg, color: insight.color }}
              >
                <insight.icon className="size-3.5" />
              </span>
              <CardTitle className="text-xs font-normal text-muted-foreground">
                {insight.label}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="truncate text-base font-semibold">
              {insight.value}
            </p>
            <p className="text-xs text-muted-foreground">{insight.detail}</p>
          </CardContent>
        </SpotlightCard>
      ))}
    </div>
  );
}
