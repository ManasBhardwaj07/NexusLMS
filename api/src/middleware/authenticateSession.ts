import { Request, Response, NextFunction } from 'express';
import {
  verifySession,
  getRedisClient,
  getTv,
  setTv,
  getUserMeta,
  setUserMeta,
  ConsentState,
  UserMeta,
} from '@codeascend/auth';
import { prisma } from '../lib/prisma.js';

export async function authenticateSession(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // 1. Extract Bearer token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ ok: false });
      return;
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
      res.status(401).json({ ok: false });
      return;
    }

    // 2. Cryptographic session verification (oracle defense: uniform 401, reason logged server-side only)
    const result = await verifySession(token);
    if (!result.ok) {
      console.error('[auth] Session verification rejected:', result.reason);
      res.status(401).json({ ok: false });
      return;
    }

    const { payload } = result;

    // 3. Token Version revocation check (fail-closed on Redis/DB outage)
    let redis;
    try {
      redis = getRedisClient();
    } catch (err) {
      console.error('[auth] Redis client initialization failed:', err);
      res.status(503).json({ ok: false });
      return;
    }

    let cachedTv: number | null;
    try {
      cachedTv = await getTv(redis, payload.uid);
    } catch (err) {
      console.error('[auth] Redis getTv error:', err);
      res.status(503).json({ ok: false });
      return;
    }

    if (cachedTv !== null) {
      if (cachedTv !== payload.tv) {
        res.status(401).json({ ok: false });
        return;
      }
    } else {
      let dbUser;
      try {
        dbUser = await prisma.user.findUnique({
          where: { id: payload.uid },
          select: { tokenVersion: true },
        });
      } catch (err) {
        console.error('[auth] DB read error during tv miss:', err);
        res.status(503).json({ ok: false });
        return;
      }

      if (!dbUser) {
        res.status(401).json({ ok: false });
        return;
      }

      try {
        await setTv(redis, payload.uid, dbUser.tokenVersion);
      } catch (err) {
        console.error('[auth] Redis setTv error:', err);
        res.status(503).json({ ok: false });
        return;
      }

      if (dbUser.tokenVersion !== payload.tv) {
        res.status(401).json({ ok: false });
        return;
      }
    }

    // 4. Server-side UserMeta derivation (never trust token claims for minor/consent status)
    let meta: UserMeta | null;
    try {
      meta = await getUserMeta(redis, payload.uid);
    } catch (err) {
      console.error('[auth] Redis getUserMeta error:', err);
      res.status(503).json({ ok: false });
      return;
    }

    if (!meta) {
      let dbUser;
      try {
        dbUser = await prisma.user.findUnique({
          where: { id: payload.uid },
          select: { isMinor: true, consentState: true },
        });
      } catch (err) {
        console.error('[auth] DB read error during user:meta miss:', err);
        res.status(503).json({ ok: false });
        return;
      }

      if (!dbUser) {
        res.status(401).json({ ok: false });
        return;
      }

      if (!isConsentState(dbUser.consentState)) {
        console.error('[auth] Database consentState corruption:', dbUser.consentState);
        res.status(503).json({ ok: false });
        return;
      }

      meta = {
        isMinor: dbUser.isMinor,
        consentState: dbUser.consentState,
      };

      try {
        await setUserMeta(redis, payload.uid, meta);
      } catch (err) {
        console.error('[auth] Redis setUserMeta error:', err);
        res.status(503).json({ ok: false });
        return;
      }
    }

    // 5. Derive identity once per request and attach to Express context
    req.user = {
      uid: payload.uid,
      role: payload.role,
      isMinor: meta.isMinor,
      consentState: meta.consentState,
      tv: payload.tv,
    };

    next();
  } catch (err) {
    console.error('[auth] Unexpected failure in authenticateSession:', err);
    res.status(500).json({ ok: false });
  }
}

function isConsentState(v: unknown): v is ConsentState {
  return v === 'NOT_REQUIRED' || v === 'PENDING' || v === 'VERIFIED';
}
