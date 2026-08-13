"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  PencilIcon,
  Search,
  TrashIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  fromCents,
  getMonthlyEquivalentCents,
  toCents,
} from "@/lib/calculations";
import { getCategoryColor } from "@/lib/categories";
import { matchSubscriptionLogo } from "@/lib/subscription-logos";
import type { SubscriptionClientDTO } from "@/lib/types";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

type SortKey = "name" | "cost" | "renewal";
type SortDirection = "asc" | "desc";

function monthlyEquivCents(subscription: SubscriptionClientDTO): number {
  return getMonthlyEquivalentCents(
    toCents(subscription.cost),
    subscription.billingCycle,
  );
}

function SortIcon({
  active,
  direction,
}: {
  active: boolean;
  direction: SortDirection;
}) {
  if (!active) {
    return <ArrowUpDown className="size-3.5 text-muted-foreground/40" />;
  }
  return direction === "asc" ? (
    <ArrowUp className="size-3.5" />
  ) : (
    <ArrowDown className="size-3.5" />
  );
}

function SubscriptionLogo({
  name,
  category,
}: {
  name: string;
  category: string;
}) {
  const brand = matchSubscriptionLogo(name);

  if (brand) {
    return (
      <span
        aria-hidden
        className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white ring-1 ring-black/5"
      >
        <svg
          role="img"
          viewBox="0 0 24 24"
          className="size-4"
          fill={`#${brand.hex}`}
        >
          <path d={brand.path} />
        </svg>
      </span>
    );
  }

  const color = getCategoryColor(category);
  return (
    <span
      aria-hidden
      className="flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
      style={{
        background: `color-mix(in oklch, ${color} 16%, transparent)`,
        color,
      }}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

export function SubscriptionTable({
  subscriptions,
  onEdit,
  onDelete,
}: {
  subscriptions: SubscriptionClientDTO[];
  onEdit: (subscription: SubscriptionClientDTO) => void;
  onDelete: (subscription: SubscriptionClientDTO) => void;
}) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("renewal");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? subscriptions.filter(
          (subscription) =>
            subscription.name.toLowerCase().includes(q) ||
            subscription.category.toLowerCase().includes(q),
        )
      : subscriptions;

    return [...base].sort((a, b) => {
      let diff = 0;
      if (sortKey === "name") {
        diff = a.name.localeCompare(b.name);
      } else if (sortKey === "cost") {
        diff = monthlyEquivCents(a) - monthlyEquivCents(b);
      } else {
        diff =
          new Date(a.nextRenewalDate).getTime() -
          new Date(b.nextRenewalDate).getTime();
      }
      return sortDirection === "asc" ? diff : -diff;
    });
  }, [subscriptions, query, sortKey, sortDirection]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  }

  if (subscriptions.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        No subscriptions yet. Add your first one to start tracking your burn
        rate.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative w-full max-w-xs">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name or category…"
          className="h-8 pl-8"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No subscriptions match &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <button
                  type="button"
                  onClick={() => toggleSort("name")}
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  Name
                  <SortIcon
                    active={sortKey === "name"}
                    direction={sortDirection}
                  />
                </button>
              </TableHead>
              <TableHead>Category</TableHead>
              <TableHead>
                <button
                  type="button"
                  onClick={() => toggleSort("cost")}
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  Cost
                  <SortIcon
                    active={sortKey === "cost"}
                    direction={sortDirection}
                  />
                </button>
              </TableHead>
              <TableHead>Monthly equiv.</TableHead>
              <TableHead>
                <button
                  type="button"
                  onClick={() => toggleSort("renewal")}
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  Next renewal
                  <SortIcon
                    active={sortKey === "renewal"}
                    direction={sortDirection}
                  />
                </button>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((subscription) => (
              <TableRow key={subscription.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2.5">
                    <SubscriptionLogo
                      name={subscription.name}
                      category={subscription.category}
                    />
                    {subscription.name}
                  </div>
                </TableCell>
                <TableCell>{subscription.category}</TableCell>
                <TableCell>
                  {currencyFormatter.format(subscription.cost)} /{" "}
                  {subscription.billingCycle === "MONTHLY" ? "mo" : "yr"}
                </TableCell>
                <TableCell>
                  {currencyFormatter.format(
                    fromCents(monthlyEquivCents(subscription)),
                  )}
                </TableCell>
                <TableCell>
                  {format(
                    parseISO(subscription.nextRenewalDate),
                    "MMM d, yyyy",
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
