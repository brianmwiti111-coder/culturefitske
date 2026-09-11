// Simple in-memory rate limiter, keyed per action + actor (e.g. "login:1.2.3.4"
// or "review:<userId>"). This runs with zero setup and no extra dependencies.
//
// One honest limitation: on Vercel, each serverless function instance has its
// own memory, so this is best-effort in production (a request that lands on a
// fresh/different instance resets the count) rather than a hard guarantee.
// That's an acceptable trade-off for a store this size. If you outgrow it,
// a persistent store like Upstash Redis can be dropped in behind this same
// function signature later — ask and it can be added when you're ready to
// install the extra package for it.

const memoryStore = new Map(); // identifier -> array of recent request timestamps (ms)

// Best-effort client IP from a Next.js Request. Vercel sets x-forwarded-for.
export function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

// identifier should be scoped to both the action and the actor, e.g.
// `login:${ip}` or `review:${userId}` — so different endpoints never share
// a bucket by accident.
export async function rateLimit(identifier, { limit, windowSeconds }) {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const timestamps = (memoryStore.get(identifier) || []).filter((t) => now - t < windowMs);

  if (timestamps.length >= limit) {
    memoryStore.set(identifier, timestamps);
    return { success: false, remaining: 0 };
  }
  timestamps.push(now);
  memoryStore.set(identifier, timestamps);
  return { success: true, remaining: limit - timestamps.length };
}
