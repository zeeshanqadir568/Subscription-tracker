"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { FreeTrials } from "@/components/dashboard/free-trials";
import { InsightsRow } from "@/components/dashboard/insights";
import { SpendForecastChart } from "@/components/dashboard/spend-forecast-chart";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { UpcomingRenewals } from "@/components/dashboard/upcoming-renewals";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DeleteSubscriptionDialog } from "@/components/subscriptions/delete-subscription-dialog";
import {
  SubscriptionForm,
  type SubscriptionFormDefaults,
} from "@/components/subscriptions/subscription-form";
import { SubscriptionTable } from "@/components/subscriptions/subscription-table";
import {
  calculateBurnRate,
  getCategoryBreakdown,
  getSpendForecast,
  getUpcomingRenewals,
} from "@/lib/calculations";
import type { SubscriptionClientDTO } from "@/lib/types";
import type { SubscriptionInput } from "@/lib/validations/subscription";

function toFormDefaults(
  subscription: SubscriptionClientDTO,
): SubscriptionFormDefaults {
  return {
    name: subscription.name,
    cost: String(subscription.cost),
    billingCycle: subscription.billingCycle,
    nextRenewalDate: subscription.nextRenewalDate.slice(0, 10),
    isFreeTrial: subscription.isFreeTrial,
    category: subscription.category,
    notes: subscription.notes ?? "",
  };
}

function timeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function byRenewalDate(
  a: SubscriptionClientDTO,
  b: SubscriptionClientDTO,
): number {
  return (
    new Date(a.nextRenewalDate).getTime() -
    new Date(b.nextRenewalDate).getTime()
  );
}

async function parseApiResponse<T>(response: Response): Promise<T> {
  const body = await response.json();
  if (!response.ok) {
    const message =
      (body as { error?: { message?: string } })?.error?.message ??
      "Request failed";
    throw new Error(message);
  }
  return (body as { data: T }).data;
}

export function SubscriptionsDashboard({
  initialSubscriptions,
}: {
  initialSubscriptions: SubscriptionClientDTO[];
}) {
  const { data: session } = useSession();
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] =
    useState<SubscriptionClientDTO | null>(null);
  const [deletingSubscription, setDeletingSubscription] =
    useState<SubscriptionClientDTO | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Free trials aren't costing anything yet, so they're kept out of every
  // spend calculation below and surfaced in their own section instead.
  const paidSubscriptions = useMemo(
    () => subscriptions.filter((s) => !s.isFreeTrial),
    [subscriptions],
  );
  const trialSubscriptions = useMemo(
    () => subscriptions.filter((s) => s.isFreeTrial),
    [subscriptions],
  );

  const burnRate = useMemo(
    () => calculateBurnRate(paidSubscriptions),
    [paidSubscriptions],
  );
  const categoryBreakdown = useMemo(
    () => getCategoryBreakdown(paidSubscriptions),
    [paidSubscriptions],
  );
  const forecast = useMemo(
    () =>
      getSpendForecast(
        paidSubscriptions.map((s) => ({
          ...s,
          nextRenewalDate: new Date(s.nextRenewalDate),
        })),
        6,
      ),
    [paidSubscriptions],
  );

  const { dueWithin7Days, dueWithin30Days } = useMemo(() => {
    const withDates = paidSubscriptions.map((subscription) => ({
      ...subscription,
      nextRenewalDate: new Date(subscription.nextRenewalDate),
    }));
    const result = getUpcomingRenewals(withDates);
    return {
      dueWithin7Days: result.dueWithin7Days.map((s) => ({
        ...s,
        nextRenewalDate: s.nextRenewalDate.toISOString(),
      })),
      dueWithin30Days: result.dueWithin30Days.map((s) => ({
        ...s,
        nextRenewalDate: s.nextRenewalDate.toISOString(),
      })),
    };
  }, [paidSubscriptions]);

  function openCreateForm() {
    setEditingSubscription(null);
    setIsFormOpen(true);
  }

  function openEditForm(subscription: SubscriptionClientDTO) {
    setEditingSubscription(subscription);
    setIsFormOpen(true);
  }

  async function handleCreate(values: SubscriptionInput) {
    try {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const created = await parseApiResponse<SubscriptionClientDTO>(response);
      setSubscriptions((prev) => [...prev, created].sort(byRenewalDate));
      toast.success("Subscription added");
      setIsFormOpen(false);
    } catch (error) {
      console.error("Failed to create subscription:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to add subscription",
      );
    }
  }

  async function handleUpdate(values: SubscriptionInput) {
    if (!editingSubscription) return;
    try {
      const response = await fetch(
        `/api/subscriptions/${editingSubscription.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        },
      );
      const updated = await parseApiResponse<SubscriptionClientDTO>(response);
      setSubscriptions((prev) =>
        prev
          .map((s) => (s.id === updated.id ? updated : s))
          .sort(byRenewalDate),
      );
      toast.success("Subscription updated");
      setIsFormOpen(false);
      setEditingSubscription(null);
    } catch (error) {
      console.error("Failed to update subscription:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update subscription",
      );
    }
  }

  async function handleDeleteConfirm() {
    if (!deletingSubscription) return;
    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/subscriptions/${deletingSubscription.id}`,
        { method: "DELETE" },
      );
      await parseApiResponse<{ id: string }>(response);
      setSubscriptions((prev) =>
        prev.filter((s) => s.id !== deletingSubscription.id),
      );
      toast.success("Subscription deleted");
      setDeletingSubscription(null);
    } catch (error) {
      console.error("Failed to delete subscription:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete subscription",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  const firstName = session?.user?.name?.split(" ")[0];

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {timeGreeting()}
          {firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="text-base text-muted-foreground">
          Here&apos;s where your money is going.
        </p>
      </div>

      <section className="flex flex-col gap-5">
        <SummaryCards
          totalMonthlyCents={burnRate.totalMonthlyCents}
          totalYearlyCents={burnRate.totalYearlyCents}
          activeCount={burnRate.activeCount}
        />
        <InsightsRow subscriptions={paidSubscriptions} />
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-xl font-semibold tracking-tight">Trends</h2>
        <SpendForecastChart points={forecast} />
        <div className="grid gap-5 lg:grid-cols-2">
          <CategoryChart data={categoryBreakdown} />
          <UpcomingRenewals
            dueWithin7Days={dueWithin7Days}
            dueWithin30Days={dueWithin30Days}
          />
        </div>
      </section>

      <section className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both flex flex-col gap-5 delay-200 duration-500">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">
            Subscriptions
          </h2>
          <Button size="lg" onClick={openCreateForm}>
            Add subscription
          </Button>
        </div>
        <SubscriptionTable
          subscriptions={paidSubscriptions}
          onEdit={openEditForm}
          onDelete={setDeletingSubscription}
        />
      </section>

      <section className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both flex flex-col gap-5 delay-300 duration-500">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold tracking-tight">
            Free Trials
          </h2>
          <p className="text-sm text-muted-foreground">
            Services you&apos;re trying for free — see how many days you have
            before they start charging you.
          </p>
        </div>
        <FreeTrials
          subscriptions={trialSubscriptions}
          onEdit={openEditForm}
          onDelete={setDeletingSubscription}
        />
      </section>

      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingSubscription(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingSubscription ? "Edit subscription" : "Add subscription"}
            </DialogTitle>
          </DialogHeader>
          <SubscriptionForm
            key={editingSubscription?.id ?? "create"}
            defaultValues={
              editingSubscription
                ? toFormDefaults(editingSubscription)
                : undefined
            }
            onSubmit={editingSubscription ? handleUpdate : handleCreate}
            onCancel={() => setIsFormOpen(false)}
            submitLabel={
              editingSubscription ? "Save changes" : "Add subscription"
            }
          />
        </DialogContent>
      </Dialog>

      <DeleteSubscriptionDialog
        subscription={deletingSubscription}
        open={deletingSubscription !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingSubscription(null);
        }}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}
