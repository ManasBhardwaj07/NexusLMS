import { Redis } from '@upstash/redis';
import { UserMeta } from './types.js';

export const CACHE_TTL_SECONDS = 60;

export async function getTv(redis: Redis, uid: string): Promise<number | null> {
  const value = await redis.get<string | number>(`tv:${uid}`);
  if (value === null || value === undefined) {
    return null;
  }
  const parsed = typeof value === 'number' ? value : parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

export async function setTv(
  redis: Redis,
  uid: string,
  tv: number,
  ttlSeconds: number = CACHE_TTL_SECONDS
): Promise<void> {
  const cappedTtl = Math.min(ttlSeconds, CACHE_TTL_SECONDS);
  await redis.set(`tv:${uid}`, tv, { ex: cappedTtl });
}

export async function invalidateTv(redis: Redis, uid: string): Promise<void> {
  await redis.del(`tv:${uid}`);
}

const VALID_CONSENT_STATES = new Set(['NOT_REQUIRED', 'PENDING', 'VERIFIED']);

function isValidUserMeta(obj: unknown): obj is UserMeta {
  if (!obj || typeof obj !== 'object') {
    return false;
  }
  const candidate = obj as Record<string, unknown>;
  return (
    typeof candidate.isMinor === 'boolean' &&
    typeof candidate.consentState === 'string' &&
    VALID_CONSENT_STATES.has(candidate.consentState)
  );
}

export async function getUserMeta(redis: Redis, uid: string): Promise<UserMeta | null> {
  const value = await redis.get<UserMeta | string>(`user:meta:${uid}`);
  if (!value) {
    return null;
  }
  let parsed: unknown = value;
  if (typeof value === 'string') {
    try {
      parsed = JSON.parse(value);
    } catch {
      return null;
    }
  }
  if (isValidUserMeta(parsed)) {
    return parsed;
  }
  return null;
}

export async function setUserMeta(
  redis: Redis,
  uid: string,
  meta: UserMeta,
  ttlSeconds: number = CACHE_TTL_SECONDS
): Promise<void> {
  const cappedTtl = Math.min(ttlSeconds, CACHE_TTL_SECONDS);
  await redis.set(`user:meta:${uid}`, JSON.stringify(meta), { ex: cappedTtl });
}

export async function invalidateUserMeta(redis: Redis, uid: string): Promise<void> {
  await redis.del(`user:meta:${uid}`);
}
