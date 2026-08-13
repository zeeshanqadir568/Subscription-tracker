"use client";

import { useMemo } from "react";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { fromCents, type SpendForecastPoint } from "@/lib/calculations";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short" });
const monthYearFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

interface ForecastDatum {
  date: Date;
  month: string;
  amount: number;
}

function ForecastTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ForecastDatum }>;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold tabular-nums text-popover-foreground">
        {currencyFormatter.format(point.amount)}
      </p>
      <p className="text-muted-foreground">
        {monthYearFormatter.format(point.date)}
      </p>
    </div>
  );
}

function TrendBadge({ percent }: { percent: number }) {
  const flat = Math.abs(percent) < 0.5;
  const up = percent >= 0.5;

  const Icon = flat ? Minus : up ? TrendingUp : TrendingDown;
  const label = flat ? "Flat" : `${up ? "+" : ""}${percent.toFixed(0)}%`;
  const color = flat
    ? "var(--muted-foreground)"
    : up
      ? "var(--critical)"
      : "var(--success)";
  const bg = flat
    ? "color-mix(in oklch, var(--muted-foreground) 12%, transparent)"
    : up
      ? "color-mix(in oklch, var(--critical) 14%, transparent)"
      : "color-mix(in oklch, var(--success) 14%, transparent)";

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ color, background: bg }}
    >
      <Icon className="size-3.5" />
      {label}
    </span>
  );
}

function makeForecastDot(peakIndex: number) {
  return function ForecastDot(props: {
    cx?: number;
    cy?: number;
    index?: number;
  }) {
    const { cx, cy, index } = props;
    if (cx === undefined || cy === undefined || index === undefined) {
      return <g />;
    }
    const isPeak = index === peakIndex;
    return (
      <g key={`dot-${index}`}>
        {isPeak && (
          <circle cx={cx} cy={cy} r={9} fill="var(--chart-1)" opacity={0.16} />
        )}
        <circle
          cx={cx}
          cy={cy}
          r={isPeak ? 4.5 : 3}
          fill="var(--chart-1)"
          stroke="var(--card)"
          strokeWidth={isPeak ? 2.5 : 1.5}
        />
      </g>
    );
  };
}

export function SpendForecastChart({
  points,
}: {
  points: SpendForecastPoint[];
}) {
  const data: ForecastDatum[] = useMemo(
    () =>
      points.map((point) => ({
        date: point.date,
        month: monthFormatter.format(point.date),
        amount: fromCents(point.totalCents),
      })),
    [points],
  );

  const { peak, peakIndex, hasSpike, average, percentChange } = useMemo(() => {
    if (data.length === 0) {
      return {
        peak: undefined,
        peakIndex: -1,
        hasSpike: false,
        average: 0,
        percentChange: 0,
      };
    }
    let peakPoint = data[0];
    let peakIdx = 0;
    data.forEach((point, index) => {
      if (point.amount > peakPoint.amount) {
        peakPoint = point;
        peakIdx = index;
      }
    });
    const baseline = data[0].amount;
    const avg = data.reduce((sum, point) => sum + point.amount, 0) / data.length;
    const last = data[data.length - 1].amount;
    const change = baseline > 0 ? ((last - baseline) / baseline) * 100 : 0;
    return {
      peak: peakPoint,
      peakIndex: peakIdx,
      hasSpike: peakPoint.amount > baseline + 0.01,
      average: avg,
      percentChange: change,
    };
  }, [data]);

  const forecastDot = useMemo(() => makeForecastDot(peakIndex), [peakIndex]);

  return (
    <SpotlightCard className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-500 delay-75">
      <CardHeader>
        <CardTitle>6-Month Spend Forecast</CardTitle>
        <CardDescription>
          {hasSpike && peak
            ? `Peaks at ${currencyFormatter.format(peak.amount)} in ${monthYearFormatter.format(peak.date)} — an annual renewal lands that month.`
            : "Projected monthly cash outflow from your active subscriptions."}
        </CardDescription>
        {data.length > 0 && (
          <CardAction>
            <TrendBadge percent={percentChange} />
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Add a subscription to see your spend forecast.
          </p>
        ) : (
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <AreaChart
                data={data}
                margin={{ top: 12, right: 12, bottom: 0, left: 0 }}
              >
                <defs>
                  <linearGradient
                    id="forecastFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#2a78d6" stopOpacity={0.32} />
                    <stop
                      offset="55%"
                      stopColor="#9085e9"
                      stopOpacity={0.1}
                    />
                    <stop offset="100%" stopColor="#9085e9" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="forecastStroke"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >
                    <stop offset="0%" stopColor="#2a78d6" />
                    <stop offset="100%" stopColor="#9085e9" />
                  </linearGradient>
                  <filter
                    id="forecastGlow"
                    x="-50%"
                    y="-50%"
                    width="200%"
                    height="200%"
                  >
                    <feGaussianBlur stdDeviation="6" />
                  </filter>
                </defs>
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 5"
                  stroke="var(--border)"
                  strokeOpacity={0.7}
                />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={48}
                  tickFormatter={(value: number) =>
                    currencyFormatter.format(value)
                  }
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                />
                <ReferenceLine
                  y={average}
                  stroke="var(--muted-foreground)"
                  strokeDasharray="4 4"
                  strokeOpacity={0.6}
                  label={{
                    value: `Avg ${currencyFormatter.format(average)}`,
                    position: "insideTopRight",
                    fill: "var(--muted-foreground)",
                    fontSize: 11,
                  }}
                />
                <Tooltip
                  content={<ForecastTooltip />}
                  cursor={{
                    stroke: "var(--border)",
                    strokeWidth: 1,
                    strokeDasharray: "4 4",
                  }}
                />
                {/* Soft glow halo beneath the crisp line for depth */}
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="url(#forecastStroke)"
                  strokeWidth={10}
                  strokeOpacity={0.22}
                  dot={false}
                  activeDot={false}
                  legendType="none"
                  filter="url(#forecastGlow)"
                  animationDuration={900}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="url(#forecastStroke)"
                  strokeWidth={2.5}
                  fill="url(#forecastFill)"
                  dot={forecastDot}
                  activeDot={{
                    r: 6,
                    fill: "var(--chart-1)",
                    stroke: "var(--card)",
                    strokeWidth: 2,
                  }}
                  animationDuration={900}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </SpotlightCard>
  );
}
