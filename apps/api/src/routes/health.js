export async function healthRoutes(app) {
  app.get("/health", async (_request, reply) => {
    return reply.send({
      status: "ok",
      service: "gigshield-api",
      timestamp: new Date().toISOString(),
    });
  });
}
