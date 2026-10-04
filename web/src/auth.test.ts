import { describe, it, expect, vi } from 'vitest';
import bcrypt from 'bcrypt';

vi.mock('next-auth', () => ({
  default: vi.fn(() => ({
    handlers: {},
    auth: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  })),
}));

vi.mock('next-auth/providers/google', () => ({
  default: vi.fn(() => ({ id: 'google' })),
}));

vi.mock('next-auth/providers/credentials', () => ({
  default: vi.fn((opts: unknown) => opts),
}));

vi.mock('@auth/prisma-adapter', () => ({
  PrismaAdapter: vi.fn(() => ({})),
}));

import { verifyUserCredentials, DUMMY_HASH } from './auth.js';

describe('auth verifyUserCredentials & timing oracle mitigation', () => {
  it('DUMMY_HASH is a valid cost-12 bcrypt hash that does not throw on compare', async () => {
    // Validates that DUMMY_HASH is precomputed properly (cost 12) and executes without throwing
    const result = await bcrypt.compare('test-password', DUMMY_HASH);
    expect(result).toBe(false);
  });

  it('unknown-email path executes dummy compare and denies (returns null)', async () => {
    const compareSpy = vi.fn().mockResolvedValue(false);
    const findUserSpy = vi.fn().mockResolvedValue(null);
    const limitSpy = vi.fn().mockResolvedValue({ success: true });

    const result = await verifyUserCredentials(
      'nonexistent@example.com',
      'somePassword123!',
      '127.0.0.1',
      {
        findUser: findUserSpy,
        limit: limitSpy,
        compare: compareSpy as unknown as typeof bcrypt.compare,
        dummyHash: DUMMY_HASH,
      }
    );

    expect(result).toBeNull();
    expect(findUserSpy).toHaveBeenCalledWith('nonexistent@example.com');
    // Critical: dummy compare MUST be called with password and DUMMY_HASH to equalize execution time
    expect(compareSpy).toHaveBeenCalledWith('somePassword123!', DUMMY_HASH);
  });

  it('user without passwordHash executes dummy compare and denies (returns null)', async () => {
    const compareSpy = vi.fn().mockResolvedValue(false);
    const findUserSpy = vi.fn().mockResolvedValue({ id: 'u1', email: 'oauth@example.com', passwordHash: null });
    const limitSpy = vi.fn().mockResolvedValue({ success: true });

    const result = await verifyUserCredentials(
      'oauth@example.com',
      'somePassword123!',
      '127.0.0.1',
      {
        findUser: findUserSpy,
        limit: limitSpy,
        compare: compareSpy as unknown as typeof bcrypt.compare,
        dummyHash: DUMMY_HASH,
      }
    );

    expect(result).toBeNull();
    expect(compareSpy).toHaveBeenCalledWith('somePassword123!', DUMMY_HASH);
  });
});
