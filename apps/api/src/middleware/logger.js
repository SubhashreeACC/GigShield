// Phase 4 Task 29 & 30: Request logging middleware
// Logs method, path, status code, response time for every request

export async function requestLogger(app) {
  app.addHook("onResponse", (request, reply, done) => {
    const duration = reply.elapsedTime?.toFixed(2) || "N/A";
    request.log.info(
      {
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        responseTime: `${duration}ms`,
      },
      `${request.method} ${request.url} → ${reply.statusCode} (${duration}ms)`
    );
    done();
  });
}
