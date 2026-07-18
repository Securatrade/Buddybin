type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
  lockMs?: number;
  now?: number;
};

type Bucket = {
  count: number;
  resetAt: number;
  lockedUntil: number;
};

const buckets = new Map<string, Bucket>();

export function checkRateLimit({
  key,
  limit,
  windowMs,
  lockMs = 0,
  now = Date.now(),
}: RateLimitOptions) {
  const existing = buckets.get(key);
  const bucket =
    !existing || existing.resetAt <= now
      ? { count: 0, resetAt: now + windowMs, lockedUntil: 0 }
      : existing;

  if (bucket.lockedUntil > now) {
    buckets.set(key, bucket);
    return {
      allowed: false,
      remaining: 0,
      resetAt: bucket.resetAt,
      lockedUntil: bucket.lockedUntil,
    };
  }

  bucket.count += 1;

  if (bucket.count > limit) {
    bucket.lockedUntil = lockMs > 0 ? now + lockMs : bucket.resetAt;
  }

  buckets.set(key, bucket);

  return {
    allowed: bucket.count <= limit,
    remaining: Math.max(0, limit - bucket.count),
    resetAt: bucket.resetAt,
    lockedUntil: bucket.lockedUntil,
  };
}

export function resetRateLimitForTests() {
  buckets.clear();
}
