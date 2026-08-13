"use client";

import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import type { CategorySpend } from "@/lib/calculations";
import { fromCents } from "@/lib/calculations";
import { getCategoryColor } from "@/lib/categories";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function CategoryChart({ data }: { data: CategorySpend[] }) {
  const chartData = data.map((item) => ({
    category: item.category,
    monthly: fromCents(item.monthlyCents),
  }));

  return (
    <SpotlightCard className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-500 delay-100">
      <CardHeader>
        <CardTitle>Spend by Category</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Add a subscription to see your spending breakdown.
          </p>
        ) : (
          <div
            style={{
              width: "100%",
              height: Math.max(chartData.length * 44, 120),
            }}
          >
            <ResponsiveContainer>
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 4, right: 56, bottom: 4, left: 4 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="category"
                  width={110}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                />
                <Tooltip
                  formatter={(value) =>
                    currencyFormatter.format(Number(value ?? 0))
                  }
                  cursor={{ fill: "var(--muted)" }}
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="monthly" radius={[0, 4, 4, 0]} maxBarSize={24}>
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.category}
                      fill={getCategoryColor(entry.category)}
                    />
                  ))}
                  <LabelList
                    dataKey="monthly"
                    position="right"
                    formatter={(value) =>
                      currencyFormatter.format(Number(value ?? 0))
                    }
                    style={{ fontSize: 12, fill: "var(--foreground)" }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </SpotlightCard>
  );
}
