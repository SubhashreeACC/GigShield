// Phase 4 Task 22: GET /api/plans — return all active plans
import { prisma } from "../lib/prisma.js";

export async function planRoutes(app) {
  // Task 22: Public endpoint — list all active plans
  app.get("/plans", async (_request, reply) => {
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { weeklyPremium: "asc" },
    });

    return reply.send({
      data: plans,
      count: plans.length,
    });
  });
}
