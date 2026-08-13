"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORIES } from "@/lib/categories";
import {
  BILLING_CYCLES,
  subscriptionSchema,
  type SubscriptionInput,
} from "@/lib/validations/subscription";

export interface SubscriptionFormDefaults {
  name: string;
  cost: string;
  billingCycle: (typeof BILLING_CYCLES)[number];
  nextRenewalDate: string;
  category: string;
  notes: string;
}

const emptyDefaults: SubscriptionFormDefaults = {
  name: "",
  cost: "",
  billingCycle: "MONTHLY",
  nextRenewalDate: "",
  category: CATEGORIES[0],
  notes: "",
};

export function SubscriptionForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = "Save subscription",
}: {
  defaultValues?: Partial<SubscriptionFormDefaults>;
  onSubmit: (values: SubscriptionInput) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SubscriptionFormDefaults>({
    // subscriptionSchema uses z.coerce for cost/nextRenewalDate, which makes
    // its inferred *input* type `unknown` (zod v4 accepts any input to
    // coerce). The resolver still validates and coerces correctly at
    // runtime; this cast only bridges the DOM-facing string-based form
    // shape to that looser inferred type at the TS level.
    resolver: zodResolver(subscriptionSchema) as unknown as Resolver<
      SubscriptionFormDefaults
    >,
    defaultValues: { ...emptyDefaults, ...defaultValues },
  });

  async function submit(values: SubscriptionFormDefaults) {
    // Re-parse through the shared schema to get coerced types (number cost,
    // Date nextRenewalDate) — zodResolver already validated these values,
    // this just recovers the transformed output for the API call.
    const parsed = subscriptionSchema.parse(values);
    await onSubmit(parsed);
  }

  const billingCycle = watch("billingCycle");
  const category = watch("category");

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder="e.g. Vercel Pro" {...register("name")} />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cost">Cost (USD)</Label>
          <Input
            id="cost"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            {...register("cost")}
          />
          {errors.cost && (
            <p className="text-xs text-destructive">{errors.cost.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="billingCycle">Billing cycle</Label>
          <Select
            value={billingCycle}
            onValueChange={(value) =>
              setValue("billingCycle", value as SubscriptionFormDefaults["billingCycle"], {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger id="billingCycle" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BILLING_CYCLES.map((cycle) => (
                <SelectItem key={cycle} value={cycle}>
                  {cycle === "MONTHLY" ? "Monthly" : "Yearly"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.billingCycle && (
            <p className="text-xs text-destructive">
              {errors.billingCycle.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="category">Category</Label>
          <Select
            value={category}
            onValueChange={(value) =>
              setValue("category", value, { shouldValidate: true })
            }
          >
            <SelectTrigger id="category" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-xs text-destructive">
              {errors.category.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nextRenewalDate">Next renewal</Label>
          <Input
            id="nextRenewalDate"
            type="date"
            {...register("nextRenewalDate")}
          />
          {errors.nextRenewalDate && (
            <p className="text-xs text-destructive">
              {errors.nextRenewalDate.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea id="notes" rows={2} {...register("notes")} />
        {errors.notes && (
          <p className="text-xs text-destructive">{errors.notes.message}</p>
        )}
      </div>

      <div className="mt-2 flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
