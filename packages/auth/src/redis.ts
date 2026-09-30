import { Redis } from '@upstash/redis';

let defaultRedisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (defaultRedisClient) {
    return defaultRedisClient;
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be defined');
  }

  defaultRedisClient = new Redis({ url, token });
  return defaultRedisClient;
}

export function resetRedisClient(): void {
  defaultRedisClient = null;
}
