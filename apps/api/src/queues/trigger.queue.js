// Trigger processing — in-memory implementation
// Processes trigger events → identifies affected users → creates claims
// No external queue dependency required
import { runTriggerPipeline } from "../services/triggers.js";

/**
 * Add a trigger processing job (runs inline with a small delay)
 */
export async function addTriggerJob(city, zone) {
  setTimeout(async () => {
    console.log(`🔄 Processing trigger for ${city}/${zone}`);
    try {
      const result = await runTriggerPipeline(city, zone);
      if (result.triggered) {
        console.log(`⚡ Trigger fired for ${city}/${zone}: ${result.events.length} events`);
      }
    } catch (err) {
      console.error(`❌ Trigger processing failed:`, err.message);
    }
  }, 100);
  return { id: `trigger-${city}-${zone}-${Date.now()}` };
}

/**
 * Start trigger worker (no-op — processing is inline)
 */
export function startTriggerWorker() {
  console.log("✅ Trigger processor ready (in-memory)");
}
