"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { ChevronDown, Wallet as WalletIcon } from "lucide-react";
import { SubscriptionLogo } from "@/components/subscriptions/subscription-table";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { useCountUp } from "@/hooks/use-count-up";
import { fromCents, getTotalSpentCents } from "@/lib/calculations";
import type { SubscriptionClientDTO } from "@/lib/types";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

interface SpendRow {
  subscription: SubscriptionClientDTO;
  spentCents: number;
}

/**
 * Total-spent-to-date tracker. There's no real payment ledger, so every
 * figure here is an estimate derived from `getTotalSpentCents` (one charge
 * per completed billing period since the subscription was added) — labeled
 * as such rather than presented as a reconciled total.
 */
export function Wallet({
  subscriptions,
}: {
  subscriptions: SubscriptionClientDTO[];
}) {
  const [expanded, setExpanded] = useState(false);

  const rows: SpendRow[] = useMemo(
    () =>
      subscriptions
        .map((subscription) => ({
          subscription,
          spentCents: getTotalSpentCents({
            cost: subscription.cost,
            billingCycle: subscription.billingCycle,
            createdAt: parseISO(subscription.createdAt),
          }),
        }))
        .sort((a, b) => b.spentCents - a.spentCents),
    [subscriptions],
  );

  const totalCents = rows.reduce((sum, row) => sum + row.spentCents, 0);
  const total = useCountUp(fromCents(totalCents));

  if (subscriptions.length === 0) return null;

  return (
    <SpotlightCard className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-500">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-xl"
              style={{
                background: "color-mix(in oklch, #1baf7a 16%, transparent)",
                color: "#0f8a5f",
              }}
            >
              <WalletIcon className="size-4.5" />
            </span>
            <CardTitle className="text-sm font-normal text-muted-foreground">
              Wallet — Total Spent
            </CardTitle>
          </div>
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
            className="flex shrink-0 items-center gap-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            {expanded ? "Hide breakdown" : "Breakdown per app"}
            <ChevronDown
              className={`size-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div>
          <p className="text-3xl font-bold tracking-tight tabular-nums">
            {currencyFormatter.format(total)}
          </p>
          <p className="text-xs text-muted-foreground">
            Estimated spend since you started tracking, across{" "}
            {subscriptions.length} active subscription
            {subscriptions.length === 1 ? "" : "s"}.
          </p>
        </div>

        {expanded && (
          <ul className="flex flex-col gap-2 border-t pt-4">
            {rows.map(({ subscription, spentCents }) => (
              <li
                key={subscription.id}
                className="flex items-center justify-between gap-2 rounded-lg border p-2.5 transition-colors hover:bg-muted/40"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <SubscriptionLogo
                    name={subscription.name}
                    category={subscription.category}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {subscription.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      Since{" "}
                      {format(parseISO(subscription.createdAt), "MMM yyyy")}
                    </p>
                  </div>
                </div>
                <p className="shrink-0 text-sm font-semibold tabular-nums">
                  {currencyFormatter.format(fromCents(spentCents))}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </SpotlightCard>
  );
}
