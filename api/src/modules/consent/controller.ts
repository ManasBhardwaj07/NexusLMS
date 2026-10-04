import { Request, Response } from 'express';
import { z } from 'zod';
import { consentService } from './service.js';

const requestBodySchema = z
  .object({
    method: z.enum(['EMAIL', 'PHONE']),
    parentEmail: z.string().email().optional(),
    parentPhone: z.string().min(1).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.method === 'EMAIL') {
      if (!data.parentEmail) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'parentEmail is required when method is EMAIL',
          path: ['parentEmail'],
        });
      }
    } else if (data.method === 'PHONE') {
      if (!data.parentPhone) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'parentPhone is required when method is PHONE',
          path: ['parentPhone'],
        });
      }
    }
  });

const verifyBodySchema = z.object({
  token: z.string().min(32),
});

export const consentController = {
  /**
   * POST /consent/parental/request
   * Minor student with PENDING consent requests parent verification email/SMS.
   */
  async request(req: Request, res: Response): Promise<void> {
    // Authorization: minor (isMinor) AND consentState === 'PENDING' only.
    // Anything else -> 403 uniform {"ok":false} (no new error codes invented)
    if (!req.user || !req.user.isMinor || req.user.consentState !== 'PENDING') {
      res.status(403).json({ ok: false });
      return;
    }

    // Zod validation: wrong shape -> 422 {error:{code: 'VALIDATION'}} per contract
    const parseResult = requestBodySchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(422).json({
        ok: false,
        error: { code: 'VALIDATION' },
      });
      return;
    }

    try {
      const result = await consentService.requestParentalConsent({
        userId: req.user.uid,
        method: parseResult.data.method,
        parentEmail: parseResult.data.parentEmail,
        parentPhone: parseResult.data.parentPhone,
      });

      if (!result.success && result.reason === 'ALREADY_VERIFIED') {
        res.status(403).json({ ok: false });
        return;
      }

      // 200 {"ok":true} — NEVER include the raw token in the response
      res.status(200).json({ ok: true });
    } catch (err) {
      console.error('[consent] Database/service error in consent request:', err);
      res.status(503).json({ ok: false });
    }
  },

  /**
   * POST /consent/parental/verify (PUBLIC endpoint)
   * Parent consumes single-use verification token to unlock minor student's account.
   */
  async verify(req: Request, res: Response): Promise<void> {
    // Zod validation: token string (min 32) -> 422 on violation
    const parseResult = verifyBodySchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(422).json({
        ok: false,
        error: { code: 'VALIDATION' },
      });
      return;
    }

    // Capture evidence fields (DPDP §9 requirement)
    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || null;
    const userAgent = req.headers['user-agent'] || null;

    try {
      const result = await consentService.verifyParentalConsent(
        parseResult.data.token,
        ipAddress,
        userAgent
      );

      if (!result.success) {
        res.status(400).json({
          ok: false,
          error: { code: 'CONSENT_TOKEN_INVALID' },
        });
        return;
      }

      res.status(200).json({ ok: true });
    } catch (err) {
      console.error('[consent] Database/service error in consent verification:', err);
      res.status(503).json({ ok: false });
    }
  },

  /**
   * GET /consent/parental/status
   * Authenticated student inspects consent verification status.
   */
  async status(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ ok: false });
      return;
    }

    try {
      const statusData = await consentService.getConsentStatus(req.user.uid);
      if (!statusData) {
        res.status(503).json({ ok: false });
        return;
      }

      res.status(200).json({
        ok: true,
        consentState: statusData.consentState,
        dateOfBirth: statusData.dateOfBirth ? statusData.dateOfBirth.toISOString() : null,
        ...(statusData.consentState === 'VERIFIED' && statusData.verifiedAt
          ? { verifiedAt: statusData.verifiedAt }
          : {}),
        ...(statusData.method ? { method: statusData.method } : {}),
      });
    } catch (err) {
      console.error('[consent] Database/service error in consent status:', err);
      res.status(503).json({ ok: false });
    }
  },
};
