// Phase 8 Task 51 + Phase 12: Admin routes
import { prisma } from "../lib/prisma.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";

export async function adminRoutes(app) {
  // All admin routes require auth + admin role
  app.addHook("preHandler", authMiddleware);
  app.addHook("preHandler", adminMiddleware);

  // Task 51: GET /api/admin/fraud-alerts — claims flagged for manual review
  app.get("/fraud-alerts", async (request, reply) => {
    const page = parseInt(request.query.page) || 1;
    const limit = parseInt(request.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [alerts, total] = await Promise.all([
      prisma.claim.findMany({
        where: {
          status: "pending",
          fraudScore: { gte: 0.3, lte: 0.7 },
        },
        include: {
          user: { select: { id: true, name: true, phone: true, city: true, zone: true } },
          triggerEvent: true,
          fraudChecks: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.claim.count({
        where: { status: "pending", fraudScore: { gte: 0.3, lte: 0.7 } },
      }),
    ]);

    return reply.send({
      data: alerts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  });

  // Phase 12 Task 79: GET /api/admin/overview — dashboard stats
  app.get("/overview", async (_request, reply) => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      activeUsers,
      totalSubscriptions,
      weeklyPremiums,
      weeklyPayouts,
      activeTriggers,
      pendingClaims,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.subscription.count({ where: { status: "active" } }),
      prisma.subscription.count(),
      prisma.subscription.findMany({
        where: { status: "active" },
        include: { plan: true },
      }),
      prisma.payout.aggregate({
        where: { createdAt: { gte: weekStart }, status: "success" },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.triggerEvent.count({
        where: { detectedAt: { gte: weekStart } },
      }),
      prisma.claim.count({ where: { status: "pending" } }),
    ]);

    const premiumCollected = weeklyPremiums.reduce(
      (sum, sub) => sum + (sub.plan?.weeklyPremium || 0),
      0
    );
    const payoutTotal = weeklyPayouts._sum.amount || 0;
    const lossRatio = premiumCollected > 0 ? (payoutTotal / premiumCollected).toFixed(2) : "0";

    return reply.send({
      data: {
        totalUsers,
        activeSubscriptions: activeUsers,
        premiumCollectedThisWeek: premiumCollected,
        payoutsThisWeek: payoutTotal,
        payoutCount: weeklyPayouts._count,
        lossRatio: parseFloat(lossRatio),
        activeTriggersThisWeek: activeTriggers,
        pendingClaims,
      },
    });
  });

  // Phase 12 Task 80: GET /api/admin/users — paginated user list
  app.get("/users", async (request, reply) => {
    const page = parseInt(request.query.page) || 1;
    const limit = parseInt(request.query.limit) || 20;
    const search = request.query.search || "";
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { phone: { contains: search } },
            { city: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          subscriptions: {
            where: { status: "active" },
            include: { plan: true },
            take: 1,
          },
          _count: { select: { claims: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return reply.send({
      data: users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  });

  // Phase 12 Task 81: GET /api/admin/claims — all claims with filters
  app.get("/claims", async (request, reply) => {
    const page = parseInt(request.query.page) || 1;
    const limit = parseInt(request.query.limit) || 20;
    const status = request.query.status;
    const city = request.query.city;
    const skip = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (city) where.user = { city: { equals: city, mode: "insensitive" } };

    const [claims, total] = await Promise.all([
      prisma.claim.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, phone: true, city: true, zone: true } },
          triggerEvent: true,
          payouts: { orderBy: { createdAt: "desc" }, take: 1 },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.claim.count({ where }),
    ]);

    return reply.send({
      data: claims,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  });

  // POST /api/admin/claims/:id/approve — approve a flagged claim
  app.post("/claims/:id/approve", async (request, reply) => {
    const claim = await prisma.claim.findUnique({ where: { id: request.params.id } });
    if (!claim) {
      return reply.status(404).send({ error: "NotFound", message: "Claim not found", statusCode: 404 });
    }

    // Append-only: create new entry with approved status
    const approved = await prisma.claim.create({
      data: {
        userId: claim.userId,
        subscriptionId: claim.subscriptionId,
        triggerEventId: claim.triggerEventId,
        status: "approved",
        amount: claim.amount,
        fraudScore: claim.fraudScore,
      },
    });

    return reply.send({ data: approved });
  });

  // POST /api/admin/claims/:id/reject — reject a flagged claim
  app.post("/claims/:id/reject", async (request, reply) => {
    const claim = await prisma.claim.findUnique({ where: { id: request.params.id } });
    if (!claim) {
      return reply.status(404).send({ error: "NotFound", message: "Claim not found", statusCode: 404 });
    }

    const rejected = await prisma.claim.create({
      data: {
        userId: claim.userId,
        subscriptionId: claim.subscriptionId,
        triggerEventId: claim.triggerEventId,
        status: "rejected",
        amount: claim.amount,
        fraudScore: claim.fraudScore,
      },
    });

    return reply.send({ data: rejected });
  });

  // Phase 12 Task 83: GET /api/admin/trigger-events — timeline of all trigger events
  app.get("/trigger-events", async (request, reply) => {
    const page = parseInt(request.query.page) || 1;
    const limit = parseInt(request.query.limit) || 20;
    const city = request.query.city;
    const type = request.query.type;
    const skip = (page - 1) * limit;

    const where = {};
    if (city) where.city = { equals: city, mode: "insensitive" };
    if (type) where.type = type;

    const [events, total] = await Promise.all([
      prisma.triggerEvent.findMany({
        where,
        include: {
          _count: { select: { claims: true } },
        },
        orderBy: { detectedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.triggerEvent.count({ where }),
    ]);

    return reply.send({
      data: events,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  });
}
