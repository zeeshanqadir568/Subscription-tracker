import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { AlertTriangle, Clock } from "lucide-react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import type { SubscriptionClientDTO } from "@/lib/types";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function renewalLabel(dateStr: string): string {
  const days = differenceInCalendarDays(parseISO(dateStr), new Date());
  if (days < 0) {
    return `Overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"}`;
  }
  if (days === 0) return "Renews today";
  return `In ${days} day${days === 1 ? "" : "s"}`;
}

function isOverdue(dateStr: string): boolean {
  return differenceInCalendarDays(parseISO(dateStr), new Date()) < 0;
}

function UrgencyBadge({ level }: { level: "critical" | "warning" }) {
  const config =
    level === "critical"
      ? {
          icon: AlertTriangle,
          label: "Next 7 days",
          color: "var(--critical)",
          bg: "color-mix(in oklch, var(--critical) 12%, transparent)",
        }
      : {
          icon: Clock,
          label: "Next 8-30 days",
          color: "var(--warning)",
          bg: "color-mix(in oklch, var(--warning) 20%, transparent)",
        };
  const Icon = config.icon;

  return (
    <span
      className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-foreground"
      style={{ background: config.bg }}
    >
      <Icon className="size-3" style={{ color: config.color }} />
      {config.label}
    </span>
  );
}

function RenewalList({
  items,
  emptyLabel,
}: {
  items: SubscriptionClientDTO[];
  emptyLabel: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => {
        const overdue = isOverdue(item.nextRenewalDate);
        return (
          <li
            key={item.id}
            className="flex items-center justify-between gap-2 rounded-lg border p-2.5 transition-colors hover:bg-muted/40"
            style={
              overdue
                ? { borderColor: "color-mix(in oklch, var(--critical) 35%, transparent)" }
                : undefined
            }
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{item.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {item.category} ·{" "}
                {format(parseISO(item.nextRenewalDate), "MMM d, yyyy")}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-medium">
                {currencyFormatter.format(item.cost)}
              </p>
              <p
                className="text-xs font-medium"
                style={
                  overdue
                    ? { color: "var(--critical)" }
                    : { color: "var(--muted-foreground)" }
                }
              >
                {renewalLabel(item.nextRenewalDate)}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function UpcomingRenewals({
  dueWithin7Days,
  dueWithin30Days,
}: {
  dueWithin7Days: SubscriptionClientDTO[];
  dueWithin30Days: SubscriptionClientDTO[];
}) {
  return (
    <SpotlightCard className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both delay-150 duration-500">
      <CardHeader>
        <CardTitle>Upcoming Renewals</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <UrgencyBadge level="critical" />
          <RenewalList
            items={dueWithin7Days}
            emptyLabel="Nothing renewing in the next 7 days."
          />
        </div>
        <div className="flex flex-col gap-2">
          <UrgencyBadge level="warning" />
          <RenewalList
            items={dueWithin30Days}
            emptyLabel="Nothing renewing in the next 8-30 days."
          />
        </div>
      </CardContent>
    </SpotlightCard>
  );
}
