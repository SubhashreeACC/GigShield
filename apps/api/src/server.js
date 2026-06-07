import "dotenv/config";
import { buildApp } from "./app.js";

const PORT = Number(process.env.PORT) || 4000;
const HOST = process.env.HOST || "0.0.0.0";

async function start() {
  const app = await buildApp();

  // Start background workers after a short delay
  setTimeout(async () => {
    try {
      const { startTriggerWorker } = await import("./queues/trigger.queue.js");
      const { startPayoutWorker } = await import("./queues/payout.queue.js");
      const { startTriggerScheduler } = await import("./queues/scheduler.js");

      startTriggerWorker();
      startPayoutWorker();
      await startTriggerScheduler();
      app.log.info("✅ All background workers started (in-memory)");
    } catch (err) {
      app.log.warn(`⚠️  Background workers failed to start: ${err.message}`);
      app.log.warn("    This is non-critical — API endpoints continue working normally");
    }
  }, 1000);

  try {
    await app.listen({ port: PORT, host: HOST });
    app.log.info(`🛡️  GigShield API running at http://${HOST}:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
