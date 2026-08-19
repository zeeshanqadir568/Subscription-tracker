"use client";

import { CalendarClock, Layers, Wallet } from "lucide-react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { useCountUp } from "@/hooks/use-count-up";
import { fromCents } from "@/lib/calculations";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function LiveDot() {
  return (
    <span className="relative flex size-2">
      <span className="absolute inline-flex size-full animate-pulse-ring rounded-full bg-emerald-500 opacity-75" />
      <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
    </span>
  );
}

export function SummaryCards({
  totalMonthlyCents,
  totalYearlyCents,
  activeCount,
}: {
  totalMonthlyCents: number;
  totalYearlyCents: number;
  activeCount: number;
}) {
  const monthly = useCountUp(fromCents(totalMonthlyCents));
  const yearly = useCountUp(fromCents(totalYearlyCents));
  const active = useCountUp(activeCount);

  const cards = [
    {
      label: "Total Monthly Spend",
      value: currencyFormatter.format(monthly),
      icon: Wallet,
      gradient: "from-blue-500/10 via-indigo-500/5 to-transparent",
      iconBg: "bg-blue-500/15 text-blue-600 dark:text-blue-400 dark:bg-blue-500/20",
      accentBorder: "group-hover:border-blue-500/30",
    },
    {
      label: "Projected Annual Cost",
      value: currencyFormatter.format(yearly),
      icon: CalendarClock,
      gradient: "from-purple-500/10 via-pink-500/5 to-transparent",
      iconBg: "bg-purple-500/15 text-purple-600 dark:text-purple-400 dark:bg-purple-500/20",
      accentBorder: "group-hover:border-purple-500/30",
    },
    {
      label: "Active Subscriptions",
      value: String(Math.round(active)),
      icon: Layers,
      gradient: "from-emerald-500/10 via-teal-500/5 to-transparent",
      iconBg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/20",
      accentBorder: "group-hover:border-emerald-500/30",
    },
  ];

  return (
    <div className="grid gap-5 sm:grid-cols-3">
      {cards.map((card, index) => (
        <SpotlightCard
          key={card.label}
          style={
            {
              "--card-spacing": "1.25rem",
              animationDelay: `${index * 80}ms`,
            } as React.CSSProperties
          }
          className={`group relative overflow-hidden border border-border/60 bg-gradient-to-br ${card.gradient} transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 ${card.accentBorder} animate-in fade-in slide-in-from-bottom-2 fill-mode-both`}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {card.label}
              </CardTitle>
              <span
                className={`flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${card.iconBg}`}
              >
                <card.icon className="size-5" />
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2.5">
              <p className="text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
                {card.value}
              </p>
              {index === 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-emerald-600 uppercase dark:text-emerald-400">
                  <LiveDot />
                  Live
                </span>
              )}
            </div>
          </CardContent>
        </SpotlightCard>
      ))}
    </div>
  );
}

