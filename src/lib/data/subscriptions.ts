import { prisma } from "@/lib/prisma";
import type { BillingCycle } from "@/lib/calculations";
import type { SubscriptionInput } from "@/lib/validations/subscription";

export class NotFoundError extends Error {
  constructor(message = "Not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

export interface SubscriptionDTO {
  id: string;
  name: string;
  cost: number;
  billingCycle: BillingCycle;
  nextRenewalDate: Date;
  isFreeTrial: boolean;
  category: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface SubscriptionRow {
  id: string;
  name: string;
  cost: { toNumber: () => number };
  billingCycle: string;
  nextRenewalDate: Date;
  isFreeTrial: boolean;
  category: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

function toDTO(row: SubscriptionRow): SubscriptionDTO {
  return {
    id: row.id,
    name: row.name,
    cost: row.cost.toNumber(),
    billingCycle: row.billingCycle as BillingCycle,
    nextRenewalDate: row.nextRenewalDate,
    isFreeTrial: row.isFreeTrial,
    category: row.category,
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/**
 * All reads/writes below scope every query by `userId` in the `where`
 * clause — this is the application-layer ownership enforcement ("Row Level
 * Security via Prisma queries") a subscription can never be read, edited,
 * or deleted by anyone other than its owner.
 */

export async function listSubscriptions(
  userId: string,
): Promise<SubscriptionDTO[]> {
  const rows = await prisma.subscription.findMany({
    where: { userId },
    orderBy: { nextRenewalDate: "asc" },
  });
  return rows.map(toDTO);
}

export async function getSubscription(
  userId: string,
  id: string,
): Promise<SubscriptionDTO> {
  const row = await prisma.subscription.findFirst({ where: { id, userId } });
  if (!row) throw new NotFoundError("Subscription not found");
  return toDTO(row);
}

export async function createSubscription(
  userId: string,
  input: SubscriptionInput,
): Promise<SubscriptionDTO> {
  const row = await prisma.subscription.create({
    data: {
      userId,
      name: input.name,
      cost: input.cost,
      billingCycle: input.billingCycle,
      nextRenewalDate: input.nextRenewalDate,
      isFreeTrial: input.isFreeTrial,
      category: input.category,
      notes: input.notes || null,
    },
  });
  return toDTO(row);
}

export async function updateSubscription(
  userId: string,
  id: string,
  input: SubscriptionInput,
): Promise<SubscriptionDTO> {
  const existing = await prisma.subscription.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!existing) throw new NotFoundError("Subscription not found");

  const row = await prisma.subscription.update({
    where: { id },
    data: {
      name: input.name,
      cost: input.cost,
      billingCycle: input.billingCycle,
      nextRenewalDate: input.nextRenewalDate,
      isFreeTrial: input.isFreeTrial,
      category: input.category,
      notes: input.notes || null,
    },
  });
  return toDTO(row);
}

export async function deleteSubscription(
  userId: string,
  id: string,
): Promise<void> {
  const existing = await prisma.subscription.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!existing) throw new NotFoundError("Subscription not found");

  await prisma.subscription.delete({ where: { id } });
}
