import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Prefer Upstash Redis — it works correctly across every serverless function
// instance, which is what actually matters on Vercel. Without it, this falls
// back to an in-memory limiter that's fine for local dev but only
// best-effort in production, since each function instance has its own
// memory. Add UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN (free tier
// at upstash.com) to get the real guarantee.
const hasUpstash = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

const upstashLimiters = new Map();
function getUpstashLimiter(limit, windowSeconds) {
  const key = `${limit}:${windowSeconds}`;
  if (!upstashLimiters.has(key)) {
    const redis = Redis.fromEnv();
    upstashLimiters.set(key, new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
      analytics: false,
    }));
  }
  return upstashLimiters.get(key);
}

// In-memory fallback: identifier -> array of recent request timestamps (ms).
const memoryStore = new Map();
function memoryRateLimit(identifier, limit, windowSeconds) {
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
  if (hasUpstash) {
    const limiter = getUpstashLimiter(limit, windowSeconds);
    const result = await limiter.limit(identifier);
    return { success: result.success, remaining: result.remaining };
  }
  return memoryRateLimit(identifier, limit, windowSeconds);
}
