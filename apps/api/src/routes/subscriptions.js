// Phase 4 Tasks 25, 26: Subscription routes
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middleware/auth.js";

export async function subscriptionRoutes(app) {
  // Task 25: POST /api/subscriptions — create subscription
  app.post("/subscriptions", { preHandler: [authMiddleware] }, async (request, reply) => {
    const { planId } = request.body || {};

    if (!planId) {
      return reply.status(400).send({
        error: "ValidationError",
        message: "planId is required",
        statusCode: 400,
      });
    }

    // Verify plan exists
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan || !plan.isActive) {
      return reply.status(404).send({
        error: "NotFound",
        message: "Plan not found or inactive",
        statusCode: 404,
      });
    }

    // Check for existing active subscription
    const existing = await prisma.subscription.findFirst({
      where: { userId: request.user.id, status: "active" },
    });
    if (existing) {
      return reply.status(409).send({
        error: "Conflict",
        message: "User already has an active subscription. Cancel it first or upgrade.",
        statusCode: 409,
      });
    }

    // Set start to current Monday, end to Sunday
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon...
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const subscription = await prisma.subscription.create({
      data: {
        userId: request.user.id,
        planId,
        status: "active",
        startDate: monday,
        endDate: sunday,
        autoRenew: true,
      },
      include: { plan: true },
    });

    return reply.status(201).send({ data: subscription });
  });

  // Task 26: GET /api/subscriptions/active — current active subscription
  app.get("/subscriptions/active", { preHandler: [authMiddleware] }, async (request, reply) => {
    const subscription = await prisma.subscription.findFirst({
      where: { userId: request.user.id, status: "active" },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    });

    if (!subscription) {
      return reply.send({ data: null, message: "No active subscription" });
    }

    // Calculate days remaining
    const now = new Date();
    const endDate = new Date(subscription.endDate);
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    return reply.send({
      data: {
        ...subscription,
        daysRemaining,
      },
    });
  });

  // Task 56: POST /api/subscriptions/renew — auto-renew
  app.post("/subscriptions/renew", { preHandler: [authMiddleware] }, async (request, reply) => {
    const current = await prisma.subscription.findFirst({
      where: { userId: request.user.id, status: "active" },
      include: { plan: true },
    });

    if (!current) {
      return reply.status(404).send({
        error: "NotFound",
        message: "No active subscription to renew",
        statusCode: 404,
      });
    }

    // Expire current subscription
    await prisma.subscription.update({
      where: { id: current.id },
      data: { status: "expired" },
    });

    // Create new subscription for next week
    const nextMonday = new Date(current.endDate);
    nextMonday.setDate(nextMonday.getDate() + 1);
    nextMonday.setHours(0, 0, 0, 0);

    const nextSunday = new Date(nextMonday);
    nextSunday.setDate(nextMonday.getDate() + 6);
    nextSunday.setHours(23, 59, 59, 999);

    const renewed = await prisma.subscription.create({
      data: {
        userId: request.user.id,
        planId: current.planId,
        status: "active",
        startDate: nextMonday,
        endDate: nextSunday,
        autoRenew: current.autoRenew,
      },
      include: { plan: true },
    });

    return reply.status(201).send({ data: renewed });
  });
}
