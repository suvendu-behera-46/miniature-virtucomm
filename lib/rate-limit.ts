import "server-only";

// In-memory sliding-window limiter. Good enough for a single Node instance;
// state resets when the server restarts.
const globalForRateLimit = globalThis as unknown as { rateLimitBuckets?: Map<string, number[]> };
const buckets = (globalForRateLimit.rateLimitBuckets ??= new Map<string, number[]>());

export function takeRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((time) => now - time < windowMs);

  if (hits.length >= limit) {
    buckets.set(key, hits);
    return false;
  }

  hits.push(now);
  buckets.set(key, hits);

  if (buckets.size > 10_000) {
    for (const [bucketKey, times] of buckets) {
      if (times.every((time) => now - time >= windowMs)) buckets.delete(bucketKey);
    }
  }

  return true;
}

export function getClientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}
