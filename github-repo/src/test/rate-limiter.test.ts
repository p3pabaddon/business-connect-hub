import { describe, it, expect } from "vitest";
import { checkRateLimit, getRateLimitMessage } from "@/lib/rate-limiter";

describe("Rate Limiter", () => {
  it("should allow first requests within limit", () => {
    expect(checkRateLimit("test-allow-1")).toBe(true);
    expect(checkRateLimit("test-allow-2")).toBe(true);
  });

  it("should block after exceeding burst limit", () => {
    const action = "test-burst-" + Date.now();
    // default maxTokens = 5
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(action)).toBe(true);
    }
    // 6th should be blocked
    expect(checkRateLimit(action)).toBe(false);
  });

  it("should return a rate limit message in Turkish", () => {
    const msg = getRateLimitMessage();
    expect(msg).toContain("bekleyin");
  });
});
