import crypto from 'node:crypto';
import { Request, Response, NextFunction } from 'express';
import { getRedisClient } from '@codeascend/auth';

export function rateLimiter(limit: number, windowSeconds: number, keyPrefix: string = 'rl') {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      let redis;
      try {
        redis = getRedisClient();
      } catch (err) {
        console.error('[rateLimiter] Redis client initialization failed:', err);
        res.status(503).json({ ok: false });
        return;
      }

      // Keyed by authenticated user ID if present; fallback to IP
      const identifier = req.user?.uid || req.ip || req.socket.remoteAddress || 'anonymous';
      const key = `${keyPrefix}:${identifier}`;
      const now = Date.now();
      const windowMs = windowSeconds * 1000;
      const clearBefore = now - windowMs;

      // ZSET member uniqueness must not rely on PRNG collision odds
      try {
        const pipeline = redis.pipeline();
        pipeline.zremrangebyscore(key, 0, clearBefore);
        pipeline.zadd(key, { score: now, member: `${now}:${crypto.randomUUID()}` });
        pipeline.zcard(key);
        pipeline.expire(key, windowSeconds);

        const results = await pipeline.exec<[number, number, number, number]>();
        const currentCount = results[2];

        res.setHeader('X-RateLimit-Limit', limit);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - currentCount));

        if (currentCount > limit) {
          res.setHeader('Retry-After', windowSeconds);
          res.status(429).json({ ok: false });
          return;
        }

        next();
      } catch (err) {
        console.error('[rateLimiter] Redis execution failed (fail-closed):', err);
        res.status(503).json({ ok: false });
      }
    } catch (err) {
      console.error('[rateLimiter] Unexpected error:', err);
      res.status(500).json({ ok: false });
    }
  };
}
