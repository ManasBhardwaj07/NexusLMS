import { describe, it, expect, vi, beforeEach } from 'vitest';
import { rateLimiter } from './rateLimiter.js';
import * as auth from '@codeascend/auth';
import { Request, Response } from 'express';

vi.mock('@codeascend/auth', () => ({
  getRedisClient: vi.fn(),
}));

function createMocks() {
  const req = {
    ip: '127.0.0.1',
    user: undefined,
  } as unknown as Request;
  
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
    setHeader: vi.fn(),
  } as unknown as Response;
  
  const next = vi.fn();
  
  return { req, res, next };
}

describe('rateLimiter middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('allows request when within limit', async () => {
    const { req, res, next } = createMocks();
    
    // Mock Redis pipeline
    const mockPipeline = {
      zremrangebyscore: vi.fn(),
      zadd: vi.fn(),
      zcard: vi.fn(),
      expire: vi.fn(),
      exec: vi.fn().mockResolvedValue([0, 0, 3, 1]), // 3 is currentCount
    };
    
    (auth.getRedisClient as import('vitest').Mock).mockReturnValue({
      pipeline: () => mockPipeline,
    });

    const mw = rateLimiter(5, 60);
    await mw(req, res, next);
    
    expect(next).toHaveBeenCalled();
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 2);
  });

  it('denies request when limit exceeded (429)', async () => {
    const { req, res, next } = createMocks();
    
    const mockPipeline = {
      zremrangebyscore: vi.fn(),
      zadd: vi.fn(),
      zcard: vi.fn(),
      expire: vi.fn(),
      exec: vi.fn().mockResolvedValue([0, 0, 6, 1]), // 6 is currentCount (limit 5)
    };
    
    (auth.getRedisClient as import('vitest').Mock).mockReturnValue({
      pipeline: () => mockPipeline,
    });

    const mw = rateLimiter(5, 60);
    await mw(req, res, next);
    
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({ ok: false });
  });

  it('fails closed when Redis network fails', async () => {
    const { req, res, next } = createMocks();
    
    const mockPipeline = {
      zremrangebyscore: vi.fn(),
      zadd: vi.fn(),
      zcard: vi.fn(),
      expire: vi.fn(),
      exec: vi.fn().mockRejectedValue(new Error('Redis Timeout')),
    };
    
    (auth.getRedisClient as import('vitest').Mock).mockReturnValue({
      pipeline: () => mockPipeline,
    });

    const mw = rateLimiter(5, 60);
    await mw(req, res, next);
    
    // MUST FAIL CLOSED!
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({ ok: false });
  });

  it('fails closed when Redis client throws', async () => {
    const { req, res, next } = createMocks();
    
    (auth.getRedisClient as import('vitest').Mock).mockImplementation(() => {
      throw new Error('No redis client');
    });

    const mw = rateLimiter(5, 60);
    await mw(req, res, next);
    
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({ ok: false });
  });
});
