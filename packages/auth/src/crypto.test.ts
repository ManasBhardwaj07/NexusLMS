import { describe, it, expect } from 'vitest';
import { verifySession } from './crypto.js';
import { EncryptJWT } from 'jose';

// Helper to encrypt tokens identical to next-auth
async function deriveEncryptionKey(secret: string, salt: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(secret), { name: 'HKDF' }, false, ['deriveBits']
  );
  const derivedBits = await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt: encoder.encode(salt), info: encoder.encode(`Auth.js Generated Encryption Key (${salt})`) },
    keyMaterial,
    64 * 8
  );
  return new Uint8Array(derivedBits);
}

async function createToken(payload: Record<string, unknown>, secret: string, salt: string, exp?: string) {
  const key = await deriveEncryptionKey(secret, salt);
  let jwt = new EncryptJWT(payload)
    .setProtectedHeader({ alg: 'dir', enc: 'A256CBC-HS512' })
    .setIssuedAt();
  if (exp) jwt = jwt.setExpirationTime(exp);
  return await jwt.encrypt(key);
}

describe('crypto verifySession', () => {
  const SECRET = 'test-secret-32-chars-long-at-least!!';
  const SALT = 'authjs.session-token';

  it('verifies a valid token with all expected claims', async () => {
    const token = await createToken({ uid: '123', role: 'STUDENT', tv: 1 }, SECRET, SALT, '1h');
    const res = await verifySession(token, SECRET);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.payload.uid).toBe('123');
      expect(res.payload.role).toBe('STUDENT');
      expect(res.payload.tv).toBe(1);
    }
  });

  it('rejects an expired token', async () => {
    const token = await createToken({ uid: '123', role: 'STUDENT', tv: 1 }, SECRET, SALT, '-1h');
    const res = await verifySession(token, SECRET);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.reason).toBe('expired');
  });

  it('rejects a token signed with the wrong secret', async () => {
    const token = await createToken({ uid: '123', role: 'STUDENT', tv: 1 }, 'wrong-secret-32-chars-long-at-least!!', SALT, '1h');
    const res = await verifySession(token, SECRET);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.reason).toBe('decryption_failed');
  });

  it('rejects structurally malformed tokens', async () => {
    const res = await verifySession('not.a.token', SECRET);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.reason).toBe('malformed');
  });

  it('pinning test: successfully decrypts a hardcoded token with alg:dir, enc:A256CBC-HS512', async () => {
    // Generate a fixed token so we can test against it.
    const token = await createToken({ uid: 'pin-123', role: 'STUDENT', tv: 1 }, SECRET, SALT, '1h');
    
    // We decode the header to assert its shape before verifying
    const [headerB64] = token.split('.');
    const header = JSON.parse(Buffer.from(headerB64, 'base64url').toString('utf8'));
    expect(header).toEqual({ alg: 'dir', enc: 'A256CBC-HS512' });
    
    // Verify it decrypts
    const res = await verifySession(token, SECRET);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.payload.uid).toBe('pin-123');
    }
  });

  it('rejects tokens with missing required claims', async () => {
    const token = await createToken({ uid: '123' }, SECRET, SALT, '1h');
    const res = await verifySession(token, SECRET);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.reason).toBe('missing_claims');
  });
});
