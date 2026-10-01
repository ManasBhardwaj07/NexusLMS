import crypto from 'node:crypto';
import { ConsentMethod } from '@prisma/client';
import { getRedisClient, invalidateUserMeta } from '@codeascend/auth';
import { prisma } from '../../lib/prisma.js';

export interface RequestConsentParams {
  userId: string;
  method: ConsentMethod;
  parentEmail?: string;
  parentPhone?: string;
}

export type RequestConsentResult =
  | { success: true }
  | { success: false; reason: 'ALREADY_VERIFIED' };

export type VerifyConsentResult =
  | { success: true }
  | { success: false; reason: 'CONSENT_TOKEN_INVALID' };

export interface ConsentStatusResult {
  consentState: string;
  verifiedAt?: Date | null;
  method?: ConsentMethod | null;
}

export const consentService = {
  /**
   * Generates single-use parental consent token, stores SHA-256 hash in DB with 48h expiry,
   * and dispatches legal instrument notice via Resend API (plain fetch spike simplification).
   */
  async requestParentalConsent(params: RequestConsentParams): Promise<RequestConsentResult> {
    const { userId, method, parentEmail, parentPhone } = params;

    // Check existing ParentalConsent row for user
    const existing = await prisma.parentalConsent.findUnique({
      where: { userId },
    });

    if (existing && existing.verifiedAt !== null) {
      return { success: false, reason: 'ALREADY_VERIFIED' };
    }

    // Lookup student identifier for parent notice
    const student = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    // Invariant: crypto.randomBytes(32) -> sha256 hex hash stored in DB; plaintext never stored or logged
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const tokenExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48h expiry

    if (existing) {
      await prisma.parentalConsent.update({
        where: { userId },
        data: {
          method,
          parentEmail: method === 'EMAIL' ? parentEmail : null,
          parentPhone: method === 'PHONE' ? parentPhone : null,
          tokenHash,
          tokenExpiresAt,
        },
      });
    } else {
      await prisma.parentalConsent.create({
        data: {
          userId,
          method,
          parentEmail: method === 'EMAIL' ? parentEmail : null,
          parentPhone: method === 'PHONE' ? parentPhone : null,
          tokenHash,
          tokenExpiresAt,
        },
      });
    }

    // D4 Minors-mail rule: Dispatched TO THE PARENT with neutral legal-instrument tone.
    // Explains student identity, CodeAscend service, DPDP §9 consent, 48h expiry, zero marketing.
    if (method === 'EMAIL' && parentEmail) {
      const consentBaseUrl = process.env.CONSENT_BASE_URL || 'http://localhost:3000';
      const verifyUrl = `${consentBaseUrl}/consent/verify?token=${rawToken}`;
      const studentIdentifier = student?.email || student?.name || userId;

      const emailSubject = 'Parental Consent Verification for CodeAscend Account';
      const emailBody = `A CodeAscend account registration has been initiated by student (${studentIdentifier}).\n\nCodeAscend is an educational coding platform. In accordance with the Digital Personal Data Protection Act (DPDP Act §9), verifiable parental consent is legally required before a minor student may access educational services and courses on CodeAscend.\n\nBy following the link below, you confirm that you are the parent or legal guardian of this student and grant verifiable parental consent for their account access:\n\n${verifyUrl}\n\nThis verification link is valid for 48 hours and can only be used once.\n\nIf you did not authorize this request, no action is required and the account will remain locked.`;

      const apiKey = process.env.RESEND_API_KEY;
      if (apiKey) {
        try {
          const resendRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: process.env.EMAIL_FROM || 'CodeAscend Consent <onboarding@resend.dev>',
              to: parentEmail,
              subject: emailSubject,
              text: emailBody,
            }),
          });

          if (!resendRes.ok) {
            console.error('[consent] Resend email delivery failed with status:', resendRes.status);
          }
        } catch (err) {
          console.error('[consent] Error dispatching email via Resend API:', err);
        }
      } else {
        console.warn('[consent] RESEND_API_KEY is not configured; skipped email dispatch.');
      }
    }

    return { success: true };
  },

  /**
   * Verifies parental consent token, enforces expiry and single-use inside an atomic transaction,
   * records DPDP audit evidence (timestamp, ip, userAgent), marks student VERIFIED,
   * and triggers the real-time unlock via Redis user:meta cache invalidation.
   */
  async verifyParentalConsent(
    token: string,
    ipAddress?: string | null,
    userAgent?: string | null
  ): Promise<VerifyConsentResult> {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const now = new Date();

    // 1. Initial lookup by tokenHash (DB equality via unique index)
    const consentRecord = await prisma.parentalConsent.findUnique({
      where: { tokenHash },
    });

    if (!consentRecord) {
      return { success: false, reason: 'CONSENT_TOKEN_INVALID' };
    }

    // 2. Expiry check before consume
    if (consentRecord.tokenExpiresAt < now) {
      return { success: false, reason: 'CONSENT_TOKEN_INVALID' };
    }

    // 3. Single-use check
    if (consentRecord.verifiedAt !== null) {
      return { success: false, reason: 'CONSENT_TOKEN_INVALID' };
    }

    // 4. The Transaction: re-check verifiedAt inside $transaction, record evidence, and unlock user
    const updated = await prisma.$transaction(async (tx) => {
      // Invariant: re-check inside transaction to prevent concurrent-verify race conditions
      const row = await tx.parentalConsent.findUnique({
        where: { tokenHash },
      });

      if (!row || row.verifiedAt !== null || row.tokenExpiresAt < now) {
        return null;
      }

      const consent = await tx.parentalConsent.update({
        where: { tokenHash },
        data: {
          verifiedAt: now,
          ipAddress: ipAddress ?? null,
          userAgent: userAgent ?? null,
        },
      });

      await tx.user.update({
        where: { id: consent.userId },
        data: {
          consentState: 'VERIFIED',
          consentAt: now,
        },
      });

      return consent;
    });

    if (!updated) {
      return { success: false, reason: 'CONSENT_TOKEN_INVALID' };
    }

    // 5. THE REAL-TIME UNLOCK: Invalidate Redis user:meta cache so student's next request
    // immediately re-derives VERIFIED without requiring re-login (C1 architecture)
    try {
      const redis = getRedisClient();
      await invalidateUserMeta(redis, updated.userId);
    } catch (err) {
      // Invariant: Redis cache invalidation failure must be logged, but does NOT fail request.
      // Consent is durable in DB; Redis user:meta cache key expires in <=60s anyway.
      console.error('[consent] Redis invalidateUserMeta error after verification commit:', err);
    }

    return { success: true };
  },

  /**
   * Retrieves current parental consent status for driving the pending-consent UI.
   */
  async getConsentStatus(userId: string): Promise<ConsentStatusResult | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        consentState: true,
        parentalConsent: {
          select: {
            verifiedAt: true,
            method: true,
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    return {
      consentState: user.consentState,
      verifiedAt: user.parentalConsent?.verifiedAt ?? null,
      method: user.parentalConsent?.method ?? null,
    };
  },
};
