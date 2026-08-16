"use client";

import { format, parseISO } from "date-fns";
import { PencilIcon, TrashIcon } from "lucide-react";
import { SubscriptionLogo } from "@/components/subscriptions/subscription-table";
import { Button } from "@/components/ui/button";
import { getDaysUntil, getTrialUrgency, type TrialUrgency } from "@/lib/calculations";
import type { SubscriptionClientDTO } from "@/lib/types";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const urgencyStyles: Record<TrialUrgency, { color: string; bg: string }> = {
  green: {
    color: "var(--success)",
    bg: "color-mix(in oklch, var(--success) 14%, transparent)",
  },
  yellow: {
    color: "var(--warning)",
    bg: "color-mix(in oklch, var(--warning) 22%, transparent)",
  },
  red: {
    color: "var(--critical)",
    bg: "color-mix(in oklch, var(--critical) 16%, transparent)",
  },
};

function daysLeftLabel(days: number): string {
  if (days < 0) return "Billing has started";
  if (days === 0) return "Charges today";
  if (days === 1) return "1 day left";
  return `${days} days left`;
}

function TrialCountdown({ days }: { days: number }) {
  const urgency = getTrialUrgency(days);
  const style = urgencyStyles[urgency];

  return (
    <span
      className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ background: style.bg, color: style.color }}
    >
      <span
        aria-hidden
        className="size-1.5 shrink-0 rounded-full"
        style={{ background: style.color }}
      />
      {daysLeftLabel(days)}
    </span>
  );
}

export function FreeTrials({
  subscriptions,
  onEdit,
  onDelete,
}: {
  subscriptions: SubscriptionClientDTO[];
  onEdit: (subscription: SubscriptionClientDTO) => void;
  onDelete: (subscription: SubscriptionClientDTO) => void;
}) {
  if (subscriptions.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        No free trials being tracked. Add one and mark it as a free trial to
        get a countdown before you&apos;re charged.
      </p>
    );
  }

  const sorted = [...subscriptions].sort(
    (a, b) =>
      new Date(a.nextRenewalDate).getTime() -
      new Date(b.nextRenewalDate).getTime(),
  );

  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {sorted.map((subscription) => {
        const days = getDaysUntil(parseISO(subscription.nextRenewalDate));
        return (
          <li
            key={subscription.id}
            className="flex flex-col gap-3 rounded-xl bg-card p-4 text-sm ring-1 ring-foreground/10"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <SubscriptionLogo
                  name={subscription.name}
                  category={subscription.category}
                />
                <div className="min-w-0">
                  <p className="truncate font-medium">{subscription.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {subscription.category}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Edit ${subscription.name}`}
                  onClick={() => onEdit(subscription)}
                >
                  <PencilIcon />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Delete ${subscription.name}`}
                  onClick={() => onDelete(subscription)}
                >
                  <TrashIcon />
                </Button>
              </div>
            </div>

            <TrialCountdown days={days} />

            <div className="flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
              <span>
                Trial ends{" "}
                {format(parseISO(subscription.nextRenewalDate), "MMM d, yyyy")}
              </span>
              <span className="font-medium text-foreground">
                {currencyFormatter.format(subscription.cost)} /{" "}
                {subscription.billingCycle === "MONTHLY" ? "mo" : "yr"}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
