/**
 * Client-side rate limiter using a simple token bucket approach.
 * Prevents spam on forms, booking, reviews etc.
 */

const buckets = new Map<string, { tokens: number; lastRefill: number }>();

interface RateLimitConfig {
  maxTokens: number;    // max burst
  refillRate: number;   // tokens per second
}

const DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
  appointment: { maxTokens: 3, refillRate: 0.05 },   // 3 per 20s
  review: { maxTokens: 2, refillRate: 0.033 },        // 2 per 30s
  register: { maxTokens: 2, refillRate: 0.017 },      // 2 per 60s
  login: { maxTokens: 5, refillRate: 0.1 },            // 5 per 10s
  contact: { maxTokens: 2, refillRate: 0.033 },        // 2 per 30s
  default: { maxTokens: 5, refillRate: 0.2 },
};

export function checkRateLimit(action: string): boolean {
  const config = DEFAULT_CONFIGS[action] || DEFAULT_CONFIGS.default;
  const now = Date.now();
  let bucket = buckets.get(action);

  if (!bucket) {
    bucket = { tokens: config.maxTokens, lastRefill: now };
    buckets.set(action, bucket);
  }

  // Refill tokens
  const elapsed = (now - bucket.lastRefill) / 1000;
  bucket.tokens = Math.min(config.maxTokens, bucket.tokens + elapsed * config.refillRate);
  bucket.lastRefill = now;

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return true; // allowed
  }

  return false; // rate limited
}

export function getRateLimitMessage(): string {
  return "Çok fazla istek gönderdiniz. Lütfen bir süre bekleyin.";
}
