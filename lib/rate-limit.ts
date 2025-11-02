import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

export function getRedis() {
  if (!redis) {
    if (
      !process.env.UPSTASH_REDIS_REST_URL ||
      !process.env.UPSTASH_REDIS_REST_TOKEN
    ) {
      return null;
    }
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return redis;
}

export function createRateLimiter(limit: number, window: string) {
  const redisClient = getRedis();
  if (!redisClient) return null;

  return new Ratelimit({
    redis: redisClient,
    // Upstash Duration type accepts string like "10 s"; cast to avoid TS friction
    limiter: Ratelimit.slidingWindow(limit, window as any),
    analytics: true,
    prefix: "servixing:rl",
  });
}

export const loginRateLimiter = () => createRateLimiter(5, "15 m");
export const registerRateLimiter = () => createRateLimiter(5, "1 h");
