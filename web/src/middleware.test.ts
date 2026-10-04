import { describe, it, expect, vi, beforeEach } from 'vitest';
import { middleware } from './middleware.js';
import { NextResponse, NextRequest } from 'next/server';
import * as auth from '@codeascend/auth';

vi.mock('next/server', () => {
  class MockNextResponse {
    status: number;
    constructor(body?: unknown, init?: { status?: number }) {
      this.status = init?.status || 200;
    }
    static next = vi.fn(() => ({ type: 'next' }));
    static redirect = vi.fn((url: string) => ({ type: 'redirect', url }));
  }
  return {
    NextResponse: MockNextResponse
  };
});

vi.mock('@codeascend/auth', () => ({
  verifySession: vi.fn(),
}));

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

function createReq(path: string, token?: string) {
  const req = {
    nextUrl: { pathname: path },
    url: `http://localhost:3000${path}`,
    cookies: {
      get: (name: string) => name === 'authjs.session-token' ? (token ? { value: token } : undefined) : undefined,
    }
  } as unknown as NextRequest;
  return req;
}

describe('middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('allows non-learn paths to bypass completely', async () => {
    const req = createReq('/login');
    const res = await middleware(req);
    expect(res).toEqual({ type: 'next' });
    expect(auth.verifySession).not.toHaveBeenCalled();
  });

  it('redirects to /login if no token present on /learn', async () => {
    const req = createReq('/learn/dashboard');
    const res = await middleware(req);
    expect(NextResponse.redirect).toHaveBeenCalled();
    expect((res as unknown as { url: { toString: () => string }; status: number }).url.toString()).toContain('/login');
  });

  it('redirects to /login if token is invalid', async () => {
    const req = createReq('/learn/dashboard', 'bad-token');
    (auth.verifySession as import('vitest').Mock).mockResolvedValue({ ok: false });
    const res = await middleware(req);
    expect((res as unknown as { url: { toString: () => string }; status: number }).url.toString()).toContain('/login');
  });

  it('redirects to /consent/pending if consentState is PENDING', async () => {
    const req = createReq('/learn/dashboard', 'good-token');
    (auth.verifySession as import('vitest').Mock).mockResolvedValue({ ok: true });
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ consentState: 'PENDING', dateOfBirth: '2010-01-01' })
    });

    const res = await middleware(req);
    expect((res as unknown as { url: { toString: () => string }; status: number }).url.toString()).toContain('/consent/pending');
  });

  it('redirects to /auth/complete-profile if dob is missing', async () => {
    const req = createReq('/learn/dashboard', 'good-token');
    (auth.verifySession as import('vitest').Mock).mockResolvedValue({ ok: true });
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ consentState: 'NOT_REQUIRED', dateOfBirth: null })
    });

    const res = await middleware(req);
    expect((res as unknown as { url: { toString: () => string }; status: number }).url.toString()).toContain('/auth/complete-profile');
  });

  it('allows access if consent and dob are valid', async () => {
    const req = createReq('/learn/dashboard', 'good-token');
    (auth.verifySession as import('vitest').Mock).mockResolvedValue({ ok: true });
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ consentState: 'VERIFIED', dateOfBirth: '2005-01-01' })
    });

    const res = await middleware(req);
    expect(res).toEqual({ type: 'next' });
  });

  it('fails closed (503) if api is down', async () => {
    const req = createReq('/learn/dashboard', 'good-token');
    (auth.verifySession as import('vitest').Mock).mockResolvedValue({ ok: true });
    mockFetch.mockRejectedValue(new Error('Fetch failed'));

    const res = await middleware(req);
    expect((res as unknown as { url: { toString: () => string }; status: number }).status).toBe(503);
  });
});
