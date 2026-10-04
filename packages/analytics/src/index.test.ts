import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { track, type TrackingUser } from './index.js';

describe('analytics track() DPDP gating and zero-PII dispatch', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it('gates minors (returns gated, zero network/dispatch)', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const user: TrackingUser = {
      isMinor: true,
      consentState: 'PENDING',
    };

    const result = track(user, 'user_registered');
    expect(result).toBe('gated');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('gates pending-consent adults (returns gated, zero network/dispatch)', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const user: TrackingUser = {
      isMinor: false,
      consentState: 'PENDING',
    };

    const result = track(user, 'user_registered');
    expect(result).toBe('gated');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('no-ops in development/test environment (returns noop)', () => {
    process.env.NODE_ENV = 'test';
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const user: TrackingUser = {
      isMinor: false,
      consentState: 'NOT_REQUIRED',
    };

    const result = track(user, 'user_registered', { method: 'credentials' });
    expect(result).toBe('noop');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('in production, fires provably anonymous payload to PostHog EU endpoint', async () => {
    process.env.NODE_ENV = 'production';
    process.env.POSTHOG_KEY = 'ph_test_key_eu';
    delete process.env.POSTHOG_HOST;

    let capturedUrl = '';
    let capturedBody: Record<string, unknown> | null = null;

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, init) => {
      capturedUrl = String(url);
      capturedBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
      return new Response(JSON.stringify({ status: 1 }), { status: 200 });
    });

    const user: TrackingUser = {
      isMinor: false,
      consentState: 'NOT_REQUIRED',
    };

    const result = track(user, 'user_registered', { method: 'credentials' });
    expect(result).toBe('fired');
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    // Target endpoint must default to EU region
    expect(capturedUrl).toBe('https://eu.i.posthog.com/capture/');

    // PII verification: zero identifying information in payload
    expect(capturedBody).not.toBeNull();
    const body = capturedBody as unknown as Record<string, unknown>;
    expect(body.api_key).toBe('ph_test_key_eu');
    expect(body.event).toBe('user_registered');
    expect(body.distinct_id).toBe('anonymous'); // STRICTLY anonymous
    expect(body).not.toHaveProperty('uid');
    expect(body).not.toHaveProperty('email');

    const properties = body.properties as Record<string, unknown>;
    expect(properties).toBeDefined();
    expect(properties.method).toBe('credentials');
    expect(properties.$lib).toBe('codeascend-analytics/1.0');
    expect(properties).not.toHaveProperty('uid');
    expect(properties).not.toHaveProperty('email');
  });

  it('strips PII keys at boundary even if caller passes them in properties', async () => {
    process.env.NODE_ENV = 'production';
    process.env.POSTHOG_KEY = 'ph_test_key_eu';

    let capturedBody: Record<string, unknown> | null = null;
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (_url, init) => {
      capturedBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
      return new Response(JSON.stringify({ status: 1 }), { status: 200 });
    });

    const user: TrackingUser = {
      isMinor: false,
      consentState: 'NOT_REQUIRED',
    };

    // Caller attempts to pass forbidden PII keys in properties
    const result = track(user, 'user_registered', {
      uid: 'user-123',
      email: 'student@example.com',
      userId: '456',
      name: 'John Doe',
      phone: '+919999999999',
      dob: '2000-01-01',
      method: 'credentials',
    });

    expect(result).toBe('fired');
    const body = capturedBody as unknown as Record<string, unknown>;
    const properties = body.properties as Record<string, unknown>;

    // Boundary enforcement: safe non-PII properties preserved
    expect(properties.method).toBe('credentials');
    expect(properties.$lib).toBe('codeascend-analytics/1.0');

    // Denylisted keys stripped completely at the boundary
    expect(properties).not.toHaveProperty('uid');
    expect(properties).not.toHaveProperty('email');
    expect(properties).not.toHaveProperty('userId');
    expect(properties).not.toHaveProperty('name');
    expect(properties).not.toHaveProperty('phone');
    expect(properties).not.toHaveProperty('dob');
  });
});
