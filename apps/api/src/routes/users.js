// Phase 4 Tasks 23, 24: User routes
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middleware/auth.js";

export async function userRoutes(app) {
  // POST /api/users/register — register a new user
  app.post("/users/register", async (request, reply) => {
    const { name, phone, email, password, dob, address } = request.body || {};

    if (!name || !password) {
      return reply.status(400).send({
        error: "ValidationError",
        message: "name and password are required",
        statusCode: 400,
      });
    }

    if (!phone && !email) {
      return reply.status(400).send({
        error: "ValidationError",
        message: "Either phone or email is required",
        statusCode: 400,
      });
    }

    // Check for existing user
    if (phone) {
      const existing = await prisma.user.findUnique({ where: { phone } });
      if (existing) {
        return reply.status(409).send({
          error: "ConflictError",
          message: "User with this phone already exists",
          statusCode: 409,
        });
      }
    }

    const user = await prisma.user.create({
      data: {
        name,
        phone: phone || `email_${Date.now()}`,
        onboarded: true,
      },
    });

    return reply.status(201).send({ data: user });
  });

  // POST /api/users/login — validate login
  app.post("/users/login", async (request, reply) => {
    const { phone, email } = request.body || {};
    const identifier = phone || email;

    if (!identifier) {
      return reply.status(400).send({
        error: "ValidationError",
        message: "Phone or email is required",
        statusCode: 400,
      });
    }

    const user = await prisma.user.findFirst({
      where: phone ? { phone } : { name: email },
    });

    if (!user) {
      return reply.status(404).send({
        error: "NotFound",
        message: "No account found. Please register first.",
        statusCode: 404,
      });
    }

    return reply.send({ data: user });
  });

  // Task 23: POST /api/users/onboard — complete user onboarding
  app.post("/users/onboard", { preHandler: [authMiddleware] }, async (request, reply) => {
    const { name, platform, city, zone, lat, lng } = request.body || {};

    if (!name || !platform || !city || !zone) {
      return reply.status(400).send({
        error: "ValidationError",
        message: "name, platform, city, and zone are required",
        statusCode: 400,
      });
    }

    // Validate platform
    const validPlatforms = ["Swiggy", "Zomato", "Amazon"];
    if (!validPlatforms.includes(platform)) {
      return reply.status(400).send({
        error: "ValidationError",
        message: `platform must be one of: ${validPlatforms.join(", ")}`,
        statusCode: 400,
      });
    }

    // Call ML service for risk score (Task 61 integration)
    let riskScore = null;
    let riskLevel = null;
    try {
      const mlUrl = process.env.ML_SERVICE_URL || "http://localhost:8000";
      const season = getCurrentSeason();
      const res = await fetch(`${mlUrl}/ml/risk-score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city: city.toLowerCase(), zone: zone.toLowerCase(), season }),
      });
      if (res.ok) {
        const data = await res.json();
        riskScore = data.risk_score;
        riskLevel = data.risk_level;
      }
    } catch (err) {
      request.log.warn({ err }, "ML service unavailable, skipping risk scoring");
    }

    const user = await prisma.user.update({
      where: { id: request.user.id },
      data: {
        name,
        platform,
        city,
        zone,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        riskScore,
        riskLevel,
        onboarded: true,
      },
    });

    return reply.send({ data: user });
  });

  // Task 24: GET /api/users/me — current user profile
  app.get("/users/me", { preHandler: [authMiddleware] }, async (request, reply) => {
    const user = await prisma.user.findUnique({
      where: { id: request.user.id },
      include: {
        subscriptions: {
          where: { status: "active" },
          include: { plan: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!user) {
      return reply.status(404).send({
        error: "NotFound",
        message: "User not found",
        statusCode: 404,
      });
    }

    return reply.send({
      data: {
        ...user,
        activeSubscription: user.subscriptions[0] || null,
        subscriptions: undefined,
      },
    });
  });
}

function getCurrentSeason() {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return "summer";
  if (month >= 6 && month <= 9) return "monsoon";
  if (month >= 10 && month <= 11) return "spring";
  return "winter";
}
