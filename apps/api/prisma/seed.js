// Task 10 & 16: Seed script — insert 3 fixed plans
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const plans = [
  {
    name: "Basic",
    weeklyPremium: 29,
    coverageAmount: 500,
    isActive: true,
  },
  {
    name: "Standard",
    weeklyPremium: 59,
    coverageAmount: 1000,
    isActive: true,
  },
  {
    name: "Pro",
    weeklyPremium: 99,
    coverageAmount: 2000,
    isActive: true,
  },
];

async function main() {
  console.log("🌱 Seeding GigShield database...");

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan,
    });
    console.log(`  ✅ Plan "${plan.name}" — ₹${plan.weeklyPremium}/week, ₹${plan.coverageAmount} coverage`);
  }

  console.log("🌱 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
