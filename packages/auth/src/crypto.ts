import { jwtDecrypt, errors } from 'jose';
import { Role, SessionPayload, VerifySessionResult } from './types.js';

const CANDIDATE_SALTS = ['authjs.session-token', '__Secure-authjs.session-token'];
const VALID_ROLES = new Set<Role>(['STUDENT', 'MENTOR', 'ADMIN']);

async function deriveEncryptionKey(secret: string, salt: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HKDF' },
    false,
    ['deriveBits']
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: encoder.encode(salt),
      info: encoder.encode(`Auth.js Generated Encryption Key (${salt})`),
    },
    keyMaterial,
    64 * 8
  );
  return new Uint8Array(derivedBits);
}

export async function verifySession(
  token: string | undefined | null,
  customSecret?: string
): Promise<VerifySessionResult> {
  try {
    if (!token || typeof token !== 'string') {
      return { ok: false, reason: 'malformed' };
    }

    const trimmed = token.trim();
    const parts = trimmed.split('.');
    // RFC 7516 §7.1: In direct encryption (alg: "dir"), parts[1] (encrypted key) is empty.
    if (
      parts.length !== 5 ||
      parts[0].length === 0 ||
      parts[2].length === 0 ||
      parts[3].length === 0 ||
      parts[4].length === 0
    ) {
      return { ok: false, reason: 'malformed' };
    }

    const secret = customSecret || process.env.AUTH_SECRET;
    if (!secret || secret.trim().length === 0) {
      return { ok: false, reason: 'decryption_failed' };
    }

    let payload: Record<string, unknown> | null = null;
    let isExpired = false;

    for (const salt of CANDIDATE_SALTS) {
      try {
        const encryptionKey = await deriveEncryptionKey(secret, salt);
        const decrypted = await jwtDecrypt(trimmed, encryptionKey, {
          clockTolerance: 15,
        });
        payload = decrypted.payload as Record<string, unknown>;
        break;
      } catch (err) {
        if (err instanceof errors.JWTExpired) {
          isExpired = true;
          break;
        }
      }
    }

    if (isExpired) {
      return { ok: false, reason: 'expired' };
    }

    if (!payload) {
      return { ok: false, reason: 'decryption_failed' };
    }

    const { uid, role, tv } = payload;

    if (uid === undefined || role === undefined || tv === undefined) {
      return { ok: false, reason: 'missing_claims' };
    }

    if (
      typeof uid !== 'string' ||
      uid.trim().length === 0 ||
      typeof role !== 'string' ||
      !VALID_ROLES.has(role as Role) ||
      typeof tv !== 'number' ||
      !Number.isInteger(tv) ||
      tv < 0
    ) {
      return { ok: false, reason: 'invalid_payload_shape' };
    }

    return {
      ok: true,
      payload: {
        uid,
        role: role as Role,
        tv,
      },
    };
  } catch {
    return { ok: false, reason: 'decryption_failed' };
  }
}
