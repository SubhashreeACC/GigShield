// Phase 3 Task 20: Auth middleware for Fastify
// Verifies Clerk session tokens on protected routes
// In MVP mode — uses a simplified token check; swap with @clerk/fastify in production

import { prisma } from "../lib/prisma.js";

/**
 * Auth middleware — extracts user from Authorization header.
 * MVP: Accepts a userId header for development.
 * Production: Use @clerk/fastify verifyToken.
 */
export async function authMiddleware(request, reply) {
  try {
    // MVP dev mode: accept x-user-id header for testing without Clerk
    const devUserId = request.headers["x-user-id"];
    if (devUserId && process.env.NODE_ENV !== "production") {
      const user = await prisma.user.findUnique({ where: { id: devUserId } });
      if (user) {
        request.user = user;
        return;
      }
    }

    // Check Authorization header
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return reply.status(401).send({
        error: "Unauthorized",
        message: "Missing or invalid authorization token",
        statusCode: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");

    // MVP: Simple token-as-phone lookup for development
    // Production: Replace with Clerk verifyToken + session claims
    if (process.env.NODE_ENV !== "production") {
      // In dev, token is treated as phone number for easy testing
      let user = await prisma.user.findUnique({ where: { phone: token } });
      if (!user) {
        // Auto-create user on first auth (Task 21: post-login sync)
        user = await prisma.user.create({
          data: { phone: token },
        });
      }
      request.user = user;
      return;
    }

    // Production Clerk verification would go here
    return reply.status(401).send({
      error: "Unauthorized",
      message: "Invalid token",
      statusCode: 401,
    });
  } catch (err) {
    request.log.error({ err }, "Auth middleware error");
    return reply.status(500).send({
      error: "InternalServerError",
      message: "Authentication failed",
      statusCode: 500,
    });
  }
}

/**
 * Admin-only middleware — requires user.role === 'admin'
 */
export async function adminMiddleware(request, reply) {
  if (!request.user || request.user.role !== "admin") {
    return reply.status(403).send({
      error: "Forbidden",
      message: "Admin access required",
      statusCode: 403,
    });
  }
}
