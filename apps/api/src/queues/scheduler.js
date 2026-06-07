// Trigger polling scheduler — in-memory implementation
// Runs every 15 minutes, evaluates all active zones
import { prisma } from "../lib/prisma.js";
import { addTriggerJob } from "./trigger.queue.js";

/**
 * Start the trigger scheduler using setInterval
 * Checks all active subscription zones every 15 minutes
 */
export async function startTriggerScheduler() {
  console.log("⏰ Trigger scheduler started (every 15 min)");

  // Run evaluation loop
  async function evaluateZones() {
    try {
      console.log("⏰ Trigger scheduler running...");
      const activeZones = await prisma.user.findMany({
        where: {
          city: { not: null },
          zone: { not: null },
          subscriptions: { some: { status: "active" } },
        },
        select: { city: true, zone: true },
        distinct: ["city", "zone"],
      });
      console.log(`📍 Evaluating ${activeZones.length} active zones`);
      for (const { city, zone } of activeZones) {
        await addTriggerJob(city, zone);
      }
    } catch (err) {
      console.error("⏰ Scheduler evaluation failed:", err.message);
    }
  }

  // Schedule repeating evaluation every 15 minutes
  const timer = setInterval(evaluateZones, 15 * 60 * 1000);
  if (timer.unref) timer.unref(); // Allow process to exit cleanly
}
