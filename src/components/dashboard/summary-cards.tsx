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
    <span className="relative flex size-1.5">
      <span className="absolute inline-flex size-full animate-pulse-ring rounded-full bg-emerald-500" />
      <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
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
      color: "#184f95",
      bg: "color-mix(in oklch, #2a78d6 14%, transparent)",
    },
    {
      label: "Projected Annual Cost",
      value: currencyFormatter.format(yearly),
      icon: CalendarClock,
      color: "#7c3a9e",
      bg: "color-mix(in oklch, #4a3aa7 14%, transparent)",
    },
    {
      label: "Active Subscriptions",
      value: String(Math.round(active)),
      icon: Layers,
      color: "#0f8a5f",
      bg: "color-mix(in oklch, #1baf7a 14%, transparent)",
    },
  ];

  return (
    <div className="grid gap-5 sm:grid-cols-3">
      {cards.map((card, index) => (
        <SpotlightCard
          key={card.label}
          style={{
            "--card-spacing": "1.25rem",
            animationDelay: `${index * 80}ms`,
          } as React.CSSProperties}
          className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-500"
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-normal text-muted-foreground">
                {card.label}
              </CardTitle>
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-xl"
                style={{ background: card.bg, color: card.color }}
              >
                <card.icon className="size-4.5" />
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold tracking-tight tabular-nums">
                {card.value}
              </p>
              {index === 0 && (
                <span className="flex items-center gap-1 text-[10px] font-medium tracking-wide text-emerald-600 uppercase dark:text-emerald-400">
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
