import { describe, it, expect, vi, beforeEach } from 'vitest';
import { consentService } from './service.js';
import { prisma } from '../../lib/prisma.js';
import * as auth from '@codeascend/auth';

// Mock dependencies
vi.mock('../../lib/prisma.js', () => ({
  prisma: {
    parentalConsent: {
      findUnique: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  }
}));

vi.mock('@codeascend/auth', () => ({
  getRedisClient: vi.fn(),
  invalidateUserMeta: vi.fn(),
}));

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

describe('consentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('requestParentalConsent', () => {
    it('creates new consent request and dispatches email', async () => {
      (prisma.parentalConsent.findUnique as import('vitest').Mock).mockResolvedValue(null);
      (prisma.user.findUnique as import('vitest').Mock).mockResolvedValue({ id: 'u1', email: 's@test.com' });
      (prisma.parentalConsent.create as import('vitest').Mock).mockResolvedValue({});
      mockFetch.mockResolvedValue({ ok: true });
      process.env.RESEND_API_KEY = 'test-key';

      const res = await consentService.requestParentalConsent({
        userId: 'u1',
        method: 'EMAIL',
        parentEmail: 'p@test.com'
      });

      expect(res).toEqual({ success: true });
      expect(prisma.parentalConsent.create).toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalled();
      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[0]).toBe('https://api.resend.com/emails');
    });

    it('returns ALREADY_VERIFIED if existing verified consent exists', async () => {
      (prisma.parentalConsent.findUnique as import('vitest').Mock).mockResolvedValue({
        userId: 'u1',
        verifiedAt: new Date()
      });

      const res = await consentService.requestParentalConsent({
        userId: 'u1',
        method: 'EMAIL',
        parentEmail: 'p@test.com'
      });

      expect(res).toEqual({ success: false, reason: 'ALREADY_VERIFIED' });
    });
  });

  describe('verifyParentalConsent', () => {
    it('verifies valid token, updates user, and invalidates cache', async () => {
      const future = new Date(Date.now() + 100000);
      (prisma.parentalConsent.findUnique as import('vitest').Mock).mockResolvedValue({
        tokenHash: 'hashed',
        tokenExpiresAt: future,
        verifiedAt: null,
      });

      // Mock the transaction callback directly
      (prisma.$transaction as import('vitest').Mock).mockImplementation(async (cb: (tx: unknown) => unknown) => {
        return cb({
          parentalConsent: {
            findUnique: vi.fn().mockResolvedValue({ tokenHash: 'hashed', tokenExpiresAt: future, verifiedAt: null }),
            update: vi.fn().mockResolvedValue({ userId: 'u1' })
          },
          user: {
            update: vi.fn()
          }
        });
      });

      const res = await consentService.verifyParentalConsent('raw-token', '127.0.0.1', 'agent');
      expect(res).toEqual({ success: true });
      expect(auth.invalidateUserMeta).toHaveBeenCalled();
    });

    it('rejects expired token', async () => {
      const past = new Date(Date.now() - 100000);
      (prisma.parentalConsent.findUnique as import('vitest').Mock).mockResolvedValue({
        tokenHash: 'hashed',
        tokenExpiresAt: past,
        verifiedAt: null,
      });

      const res = await consentService.verifyParentalConsent('raw-token');
      expect(res).toEqual({ success: false, reason: 'CONSENT_TOKEN_INVALID' });
    });

    it('rejects replayed token (already verified)', async () => {
      const future = new Date(Date.now() + 100000);
      (prisma.parentalConsent.findUnique as import('vitest').Mock).mockResolvedValue({
        tokenHash: 'hashed',
        tokenExpiresAt: future,
        verifiedAt: new Date(),
      });

      const res = await consentService.verifyParentalConsent('raw-token');
      expect(res).toEqual({ success: false, reason: 'CONSENT_TOKEN_INVALID' });
    });
  });
});
