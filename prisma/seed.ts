import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DAY_MS = 24 * 60 * 60 * 1000;
const daysFromNow = (days: number) => new Date(Date.now() + days * DAY_MS);

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      name: "Demo User",
      passwordHash,
    },
  });

  await prisma.subscription.deleteMany({ where: { userId: user.id } });

  await prisma.subscription.createMany({
    data: [
      {
        userId: user.id,
        name: "GitHub Team",
        cost: 4,
        billingCycle: "MONTHLY",
        category: "Dev Tools",
        nextRenewalDate: daysFromNow(3),
      },
      {
        userId: user.id,
        name: "Vercel Pro",
        cost: 20,
        billingCycle: "MONTHLY",
        category: "Hosting & Infra",
        nextRenewalDate: daysFromNow(6),
      },
      {
        userId: user.id,
        name: "AWS",
        cost: 85.5,
        billingCycle: "MONTHLY",
        category: "Hosting & Infra",
        nextRenewalDate: daysFromNow(-1),
      },
      {
        userId: user.id,
        name: "Figma Professional",
        cost: 144,
        billingCycle: "YEARLY",
        category: "Design",
        nextRenewalDate: daysFromNow(18),
      },
      {
        userId: user.id,
        name: "Notion Plus",
        cost: 96,
        billingCycle: "YEARLY",
        category: "Productivity",
        nextRenewalDate: daysFromNow(29),
      },
      {
        userId: user.id,
        name: "Mailchimp",
        cost: 13,
        billingCycle: "MONTHLY",
        category: "Marketing",
        nextRenewalDate: daysFromNow(45),
      },
      {
        userId: user.id,
        name: "QuickBooks",
        cost: 30,
        billingCycle: "MONTHLY",
        category: "Finance & Ops",
        nextRenewalDate: daysFromNow(12),
      },
      {
        userId: user.id,
        name: "Slack Pro",
        cost: 87,
        billingCycle: "YEARLY",
        category: "Communication",
        nextRenewalDate: daysFromNow(60),
      },
    ],
  });

  console.log(`Seeded demo user (${user.email}) with 8 sample subscriptions.`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
