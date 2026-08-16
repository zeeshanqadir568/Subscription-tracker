import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SubscriptionsDashboard } from "@/components/dashboard/subscriptions-dashboard";
import { requireUserId } from "@/lib/auth";
import { listSubscriptions } from "@/lib/data/subscriptions";
import type { SubscriptionClientDTO } from "@/lib/types";

export const metadata: Metadata = {
  title: "Dashboard — Subscription Tracker",
};

export default async function DashboardPage() {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    redirect("/login");
  }

  const subscriptions = await listSubscriptions(userId);
  const initialSubscriptions: SubscriptionClientDTO[] = subscriptions.map(
    (subscription) => ({
      id: subscription.id,
      name: subscription.name,
      cost: subscription.cost,
      billingCycle: subscription.billingCycle,
      nextRenewalDate: subscription.nextRenewalDate.toISOString(),
      isFreeTrial: subscription.isFreeTrial,
      category: subscription.category,
      notes: subscription.notes,
    }),
  );

  return (
    <SubscriptionsDashboard initialSubscriptions={initialSubscriptions} />
  );
}
