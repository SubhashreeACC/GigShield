// In-Memory Cache — replaces Redis for local development
// Provides the same API surface (cacheGet, cacheSet, cacheDelete) but uses
// a local Map with TTL-based expiration. No external service required.
//
// For production, this can be swapped back to ioredis or replaced with
// a managed Redis instance (e.g. Upstash, Redis Cloud).

/** @type {Map<string, { value: any, expiresAt: number }>} */
const store = new Map();

// Periodic cleanup of expired entries (every 60 seconds)
const CLEANUP_INTERVAL = 60_000;
let cleanupTimer = null;

function startCleanup() {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (entry.expiresAt <= now) {
        store.delete(key);
      }
    }
  }, CLEANUP_INTERVAL);
  // Allow the process to exit even if the timer is running
  if (cleanupTimer.unref) cleanupTimer.unref();
}

startCleanup();

// ─── Public API (same interface as the old Redis module) ─────────────────

/** Always returns true — in-memory cache is always available */
export function isRedisAvailable() {
  return false; // Return false so BullMQ queues use local fallback path
}

/** Returns null — no real Redis instance */
export function getRedis() {
  return null;
}

/**
 * Get a cached value by key
 * @param {string} key
 * @returns {Promise<any|null>}
 */
export async function cacheGet(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

/**
 * Set a cached value with TTL
 * @param {string} key
 * @param {any} value
 * @param {number} ttlSeconds - Time-to-live in seconds (default 300 = 5 min)
 */
export async function cacheSet(key, value, ttlSeconds = 300) {
  store.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

/**
 * Delete a cached value
 * @param {string} key
 */
export async function cacheDelete(key) {
  store.delete(key);
}

/**
 * Get current cache stats (for debugging)
 */
export function getCacheStats() {
  const now = Date.now();
  let active = 0;
  let expired = 0;
  for (const entry of store.values()) {
    if (entry.expiresAt > now) active++;
    else expired++;
  }
  return { total: store.size, active, expired };
}

console.log("✅ In-memory cache initialized (no Redis required)");
