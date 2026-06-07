import Fastify from "fastify";
import cors from "@fastify/cors";
import { healthRoutes } from "./routes/health.js";
import { planRoutes } from "./routes/plans.js";
import { userRoutes } from "./routes/users.js";
import { subscriptionRoutes } from "./routes/subscriptions.js";
import { claimRoutes } from "./routes/claims.js";
import { weatherRoutes } from "./routes/weather.js";
import { adminRoutes } from "./routes/admin.js";
import { webhookRoutes } from "./routes/webhooks.js";
import { requestLogger } from "./middleware/logger.js";

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || "info",
      transport:
        process.env.NODE_ENV !== "production"
          ? { target: "pino-pretty", options: { colorize: true } }
          : undefined,
    },
  });

  // --- Plugins ---
  await app.register(cors, {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  });

  // --- Request logging (Task 30) ---
  await requestLogger(app);

  // --- Global error handler (Task 29) ---
  app.setErrorHandler((/** @type {any} */ error, _request, reply) => {
    const statusCode = error?.statusCode ?? 500;
    app.log.error({ err: error, statusCode }, "Request error");
    reply.status(statusCode).send({
      error: error?.name || "InternalServerError",
      message: error?.message || "An unexpected error occurred",
      statusCode,
    });
  });

  // --- Routes ---
  await app.register(healthRoutes, { prefix: "/api" });
  await app.register(planRoutes, { prefix: "/api" });
  await app.register(userRoutes, { prefix: "/api" });
  await app.register(subscriptionRoutes, { prefix: "/api" });
  await app.register(claimRoutes, { prefix: "/api" });
  await app.register(weatherRoutes, { prefix: "/api" });
  await app.register(adminRoutes, { prefix: "/api/admin" });
  await app.register(webhookRoutes, { prefix: "/api" });

  return app;
}
