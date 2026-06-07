// Phase 4 Tasks 27, 28: Claims routes
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middleware/auth.js";

export async function claimRoutes(app) {
  // POST /api/claims — create a new claim application
  app.post("/claims", { preHandler: [authMiddleware] }, async (request, reply) => {
    const {
      situation,
      severity,
      description,
      hoursAffected,
      dailyEarning,
      city,
      zone,
      dateOccurred,
      estimatedAmount,
    } = request.body || {};

    if (!situation || !severity || !description) {
      return reply.status(400).send({
        error: "ValidationError",
        message: "situation, severity, and description are required",
        statusCode: 400,
      });
    }

    // Find or create a trigger event for this claim
    let triggerEvent;
    try {
      triggerEvent = await prisma.triggerEvent.create({
        data: {
          type: situation,
          city: city || "unknown",
          zone: zone || "unknown",
          severity: severity,
          rawData: { description, hoursAffected, dailyEarning, dateOccurred },
          source: "user_report",
          thresholdBreached: `User-reported ${situation} disruption (${severity} severity)`,
          detectedAt: dateOccurred ? new Date(dateOccurred) : new Date(),
        },
      });
    } catch (err) {
      request.log.error({ err }, "Failed to create trigger event for claim");
      return reply.status(500).send({
        error: "InternalServerError",
        message: "Failed to create claim",
        statusCode: 500,
      });
    }

    // Find active subscription (if any)
    const subscription = await prisma.subscription.findFirst({
      where: { userId: request.user.id, status: "active" },
      orderBy: { createdAt: "desc" },
    });

    // Create the claim
    const claim = await prisma.claim.create({
      data: {
        userId: request.user.id,
        subscriptionId: subscription?.id || "no_subscription",
        triggerEventId: triggerEvent.id,
        status: "pending",
        amount: estimatedAmount || 0,
        fraudScore: null,
      },
      include: {
        triggerEvent: true,
      },
    });

    return reply.status(201).send({ data: claim });
  });

  // Task 27: GET /api/claims — paginated claims history
  app.get("/claims", { preHandler: [authMiddleware] }, async (request, reply) => {
    const page = parseInt(request.query.page) || 1;
    const limit = parseInt(request.query.limit) || 10;
    const status = request.query.status; // optional filter
    const skip = (page - 1) * limit;

    const where = { userId: request.user.id };
    if (status) where.status = status;

    const [claims, total] = await Promise.all([
      prisma.claim.findMany({
        where,
        include: {
          triggerEvent: true,
          payouts: { orderBy: { createdAt: "desc" }, take: 1 },
          subscription: { include: { plan: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.claim.count({ where }),
    ]);

    return reply.send({
      data: claims,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  });

  // Task 28: GET /api/claims/:id — single claim detail (transparency endpoint)
  app.get("/claims/:id", { preHandler: [authMiddleware] }, async (request, reply) => {
    const claim = await prisma.claim.findFirst({
      where: {
        id: request.params.id,
        userId: request.user.id,
      },
      include: {
        triggerEvent: true,
        payouts: { orderBy: { createdAt: "desc" } },
        fraudChecks: true,
        subscription: { include: { plan: true } },
      },
    });

    if (!claim) {
      return reply.status(404).send({
        error: "NotFound",
        message: "Claim not found",
        statusCode: 404,
      });
    }

    return reply.send({ data: claim });
  });
}
