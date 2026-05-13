const buckets = new Map();

/**
 * Fixed-window limiter (in-memory; best for single-instance / local dev).
 * @param {string} key
 * @param {{ windowMs: number; max: number }} opts
 * @returns {{ ok: true } | { ok: false; retryAfterSec: number }}
 */
export function rateLimit(key, { windowMs, max }) {
  const now = Date.now();
  let entry = buckets.get(key);
  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: now + windowMs };
    buckets.set(key, entry);
  }
  entry.count += 1;
  if (entry.count > max) {
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)) };
  }
  return { ok: true };
}
