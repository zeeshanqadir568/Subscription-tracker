"use client";

import { format, parseISO } from "date-fns";
import { Coffee, Flame } from "lucide-react";
import { SubscriptionLogo } from "@/components/subscriptions/subscription-table";
import { TiltCard } from "@/components/effects/tilt-card";
import {
  getDaysUntil,
  getTrialUrgency,
  type TrialUrgency,
} from "@/lib/calculations";
import { matchSubscriptionLogo } from "@/lib/subscription-logos";
import type { SubscriptionClientDTO } from "@/lib/types";

/**
 * Brands are stored however the user typed them ("netflix", "NETFLIX").
 * Simple Icons ships each brand's own canonical display name (`title`) —
 * use that when we recognize the brand so it reads the way the company
 * actually writes it, falling back to the raw input otherwise.
 */
function officialName(name: string): string {
  return matchSubscriptionLogo(name)?.title ?? name;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const urgencyStyles: Record<TrialUrgency, { color: string; mood: string }> = {
  green: { color: "var(--success)", mood: "Smooth sailing" },
  yellow: { color: "var(--warning)", mood: "Keep an eye on it" },
  red: { color: "var(--critical)", mood: "Act now" },
};

/** Nearest-dated subscription in the list, or undefined if the list is empty. */
function nearest(
  subscriptions: SubscriptionClientDTO[],
): SubscriptionClientDTO | undefined {
  return subscriptions.reduce<SubscriptionClientDTO | undefined>(
    (closest, subscription) => {
      if (!closest) return subscription;
      return new Date(subscription.nextRenewalDate) <
        new Date(closest.nextRenewalDate)
        ? subscription
        : closest;
    },
    undefined,
  );
}

function bigDate(iso: string) {
  const date = parseISO(iso);
  return {
    day: format(date, "MMM d"),
    year: format(date, "yyyy"),
    weekday: format(date, "EEEE"),
  };
}

function daysLeftPill(days: number): string {
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Today";
  if (days === 1) return "1 day left";
  return `${days} days left`;
}

function renewalMood(name: string, days: number): string {
  if (days < 0) return `${name} already renewed — hope it's earning its keep.`;
  if (days === 0) return `Buckle up — ${name} renews today.`;
  if (days === 1) return `Buckle up — ${name} renews tomorrow.`;
  if (days <= 3) return `Buckle up — ${name} renews in ${days} days.`;
  if (days <= 9) return `${name} renews in ${days} days. Worth a second look?`;
  return `Smooth sailing — ${name} isn't due again for a while.`;
}

function trialMood(name: string, days: number): string {
  if (days < 0) return `${name}'s trial already ended — you're on the hook now.`;
  if (days === 0) return `Last call — ${name}'s free trial ends today.`;
  if (days === 1) return `Chill for 1 more day — then ${name} starts billing you.`;
  if (days <= 3) return `Chill for ${days} more days — then ${name} starts charging you.`;
  if (days <= 9) return `Enjoy the ride — ${name}'s free trial has ${days} days left.`;
  return `Relax, ${name}'s free trial still has plenty of runway.`;
}

function HighlightCard({
  eyebrow,
  icon: Icon,
  subscription,
  mood,
  metaPrefix,
  delayMs,
}: {
  eyebrow: string;
  icon: typeof Flame;
  subscription: SubscriptionClientDTO;
  mood: string;
  metaPrefix?: string;
  delayMs: number;
}) {
  const days = getDaysUntil(parseISO(subscription.nextRenewalDate));
  const style = urgencyStyles[getTrialUrgency(days)];
  const { day, year, weekday } = bigDate(subscription.nextRenewalDate);
  const name = officialName(subscription.name);

  return (
    <TiltCard
      className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-500"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div
        className="highlight-card group relative flex flex-col gap-5 overflow-hidden rounded-2xl p-6"
        style={
          {
            "--glow": style.color,
            background: `linear-gradient(155deg, color-mix(in oklch, ${style.color} 22%, var(--card)) 0%, var(--card) 60%)`,
          } as React.CSSProperties
        }
      >
        <div className="flex items-center gap-3">
          <span
            className="flex size-12 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-6"
            style={{
              background: `color-mix(in oklch, ${style.color} 30%, transparent)`,
              color: style.color,
            }}
          >
            <Icon className="size-6" />
          </span>
          <div className="min-w-0">
            <p
              className="text-lg font-extrabold tracking-tight sm:text-xl"
              style={{ color: style.color }}
            >
              {eyebrow}
            </p>
            <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
              {style.mood}
            </p>
          </div>
        </div>

        <div className="flex items-end justify-between gap-3 border-t-2 pt-4">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold tracking-tight tabular-nums sm:text-4xl">
                {day}
              </span>
              <span className="text-lg font-bold text-foreground/70">
                {year}
              </span>
            </div>
            <p className="text-xs font-semibold text-muted-foreground">
              {weekday}
            </p>
          </div>
          <span
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-extrabold"
            style={{
              background: `color-mix(in oklch, ${style.color} 30%, transparent)`,
              color: style.color,
            }}
          >
            <span
              aria-hidden
              className="size-1.5 rounded-full"
              style={{ background: style.color }}
            />
            {daysLeftPill(days)}
          </span>
        </div>

        <div className="flex items-center gap-3 border-t-2 pt-4">
          <SubscriptionLogo
            name={subscription.name}
            category={subscription.category}
            size="lg"
          />
          <div className="min-w-0">
            <p className="truncate text-xl font-extrabold tracking-tight sm:text-2xl">
              {name}
            </p>
            <p
              className="truncate text-sm font-extrabold sm:text-base"
              style={{ color: style.color }}
            >
              {metaPrefix}
              {currencyFormatter.format(subscription.cost)} /{" "}
              {subscription.billingCycle === "MONTHLY" ? "mo" : "yr"}
            </p>
          </div>
        </div>

        <p
          className="rounded-lg border-l-4 py-1.5 pl-3.5 font-mono text-sm font-bold leading-snug text-foreground sm:text-base"
          style={{
            borderColor: style.color,
            background: `color-mix(in oklch, ${style.color} 10%, transparent)`,
          }}
        >
          &ldquo;{mood}&rdquo;
        </p>
      </div>
    </TiltCard>
  );
}

/**
 * Top-of-dashboard summary: the paid subscription renewing soonest, and the
 * free trial closest to converting to a paid charge. Skips a side entirely
 * if there's nothing to show (e.g. no trials being tracked).
 */
export function Highlights({
  paidSubscriptions,
  trialSubscriptions,
}: {
  paidSubscriptions: SubscriptionClientDTO[];
  trialSubscriptions: SubscriptionClientDTO[];
}) {
  const riskiest = nearest(paidSubscriptions);
  const closestTrial = nearest(trialSubscriptions);

  if (!riskiest && !closestTrial) return null;

  return (
    <section className="grid gap-4 sm:grid-cols-2">
      {riskiest && (
        <HighlightCard
          eyebrow="Most At Risk"
          icon={Flame}
          subscription={riskiest}
          mood={renewalMood(
            riskiest.name,
            getDaysUntil(parseISO(riskiest.nextRenewalDate)),
          )}
          delayMs={0}
        />
      )}
      {closestTrial && (
        <HighlightCard
          eyebrow="Free Trial Watch"
          icon={Coffee}
          subscription={closestTrial}
          mood={trialMood(
            closestTrial.name,
            getDaysUntil(parseISO(closestTrial.nextRenewalDate)),
          )}
          metaPrefix="Then "
          delayMs={80}
        />
      )}
    </section>
  );
}
