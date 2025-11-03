import { Redis } from "@upstash/redis";

// Initialize Redis client
let redis: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      throw new Error(
        "Redis configuration missing. Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN"
      );
    }

    redis = new Redis({
      url,
      token,
    });
  }

  return redis;
}

/**
 * Cache data with expiration
 * @param key - Cache key
 * @param value - Value to cache (will be JSON stringified)
 * @param expirationSeconds - Expiration time in seconds (default: 3600 = 1 hour)
 */
export async function setCache<T>(
  key: string,
  value: T,
  expirationSeconds: number = 3600
): Promise<void> {
  try {
    const client = getRedisClient();
    await client.set(key, JSON.stringify(value), { ex: expirationSeconds });
  } catch (error) {
    console.error("Redis set error:", error);
    // Don't throw - caching failures shouldn't break the app
  }
}

/**
 * Get cached data
 * @param key - Cache key
 * @returns Cached value or null if not found
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const client = getRedisClient();
    const value = await client.get(key);

    if (!value) return null;

    return (typeof value === "string" ? JSON.parse(value) : value) as T;
  } catch (error) {
    console.error("Redis get error:", error);
    return null;
  }
}

/**
 * Delete cached data
 * @param key - Cache key
 */
export async function deleteCache(key: string): Promise<void> {
  try {
    const client = getRedisClient();
    await client.del(key);
  } catch (error) {
    console.error("Redis delete error:", error);
  }
}

/**
 * Delete multiple cache keys matching a pattern
 * @param pattern - Pattern to match (e.g., 'user:*')
 */
export async function deleteCachePattern(pattern: string): Promise<void> {
  try {
    const client = getRedisClient();
    const keys = await client.keys(pattern);

    if (keys.length > 0) {
      await client.del(...keys);
    }
  } catch (error) {
    console.error("Redis delete pattern error:", error);
  }
}

/**
 * Check if key exists in cache
 * @param key - Cache key
 * @returns True if exists, false otherwise
 */
export async function existsInCache(key: string): Promise<boolean> {
  try {
    const client = getRedisClient();
    const exists = await client.exists(key);
    return exists === 1;
  } catch (error) {
    console.error("Redis exists error:", error);
    return false;
  }
}

/**
 * Increment a counter in Redis
 * @param key - Counter key
 * @param amount - Amount to increment (default: 1)
 * @returns New counter value
 */
export async function incrementCounter(
  key: string,
  amount: number = 1
): Promise<number> {
  try {
    const client = getRedisClient();
    const newValue = await client.incrby(key, amount);
    return newValue;
  } catch (error) {
    console.error("Redis increment error:", error);
    return 0;
  }
}

/**
 * Set expiration on a key
 * @param key - Cache key
 * @param expirationSeconds - Expiration time in seconds
 */
export async function setExpiration(
  key: string,
  expirationSeconds: number
): Promise<void> {
  try {
    const client = getRedisClient();
    await client.expire(key, expirationSeconds);
  } catch (error) {
    console.error("Redis expire error:", error);
  }
}

/**
 * Add item to a Redis list
 * @param key - List key
 * @param value - Value to add
 */
export async function addToList<T>(key: string, value: T): Promise<void> {
  try {
    const client = getRedisClient();
    await client.rpush(key, JSON.stringify(value));
  } catch (error) {
    console.error("Redis list push error:", error);
  }
}

/**
 * Get all items from a Redis list
 * @param key - List key
 * @returns Array of items
 */
export async function getList<T>(key: string): Promise<T[]> {
  try {
    const client = getRedisClient();
    const items = await client.lrange(key, 0, -1);
    return items.map((item) =>
      typeof item === "string" ? JSON.parse(item) : item
    );
  } catch (error) {
    console.error("Redis list get error:", error);
    return [];
  }
}

/**
 * Add item to a Redis set
 * @param key - Set key
 * @param value - Value to add
 */
export async function addToSet<T>(key: string, value: T): Promise<void> {
  try {
    const client = getRedisClient();
    await client.sadd(key, JSON.stringify(value));
  } catch (error) {
    console.error("Redis set add error:", error);
  }
}

/**
 * Get all items from a Redis set
 * @param key - Set key
 * @returns Array of unique items
 */
export async function getSet<T>(key: string): Promise<T[]> {
  try {
    const client = getRedisClient();
    const items = await client.smembers(key);
    return items.map((item) =>
      typeof item === "string" ? JSON.parse(item) : item
    );
  } catch (error) {
    console.error("Redis set get error:", error);
    return [];
  }
}

// Cache key helpers
export const CacheKeys = {
  warrantyCheck: (serialNumber: string) => `warranty:${serialNumber}`,
  partsSearch: (query: string) => `parts:search:${query}`,
  userProfile: (userId: string) => `user:${userId}`,
  workOrder: (workOrderId: string) => `workorder:${workOrderId}`,
  deviceInfo: (deviceId: string) => `device:${deviceId}`,
  ebayToken: () => "ebay:oauth:token",
} as const;

export { Redis };
