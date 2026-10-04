import bcrypt from 'bcrypt';
import { prisma } from '../../lib/prisma.js';
import { ConsentState } from '@prisma/client';
import { getRedisClient, invalidateUserMeta, invalidateTv } from '@codeascend/auth';

/**
 * Calendar age comparison for DPDP compliance:
 * Compares today against dateOfBirth + 18 calendar years.
 * If born on Feb 29 (leap year), 18th birthday is celebrated on Feb 28 in non-leap years.
 * Returns true if today is strictly before their 18th birthday.
 */
export function isMinor(dateOfBirth: Date, today: Date = new Date()): boolean {
  const targetYear = dateOfBirth.getUTCFullYear() + 18;
  const month = dateOfBirth.getUTCMonth();
  let day = dateOfBirth.getUTCDate();

  if (month === 1 && day === 29) {
    const isTargetLeap = (targetYear % 4 === 0 && targetYear % 100 !== 0) || (targetYear % 400 === 0);
    if (!isTargetLeap) {
      day = 28;
    }
  }

  const eighteenthBirthday = new Date(Date.UTC(targetYear, month, day, 0, 0, 0, 0));
  const todayStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0, 0));

  return todayStart < eighteenthBirthday;
}

export const authService = {
  async register(data: { name?: string; email: string; passwordRaw: string; dateOfBirth: Date; trackingConsent: boolean }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return { success: false, reason: 'EMAIL_EXISTS' as const };
    }
    
    // bcrypt ONLY here (raw grep across middleware = empty) per D-1
    const passwordHash = await bcrypt.hash(data.passwordRaw, 12);
    
    const minor = isMinor(data.dateOfBirth);
    const consentState = minor ? ConsentState.PENDING : ConsentState.NOT_REQUIRED;
    
    // DPDPA rule: minors cannot consent to tracking
    const trackingConsent = data.trackingConsent && !minor;
    const consentAt = trackingConsent ? new Date() : null;

    const user = await prisma.$transaction(async (tx) => {
      return tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          passwordHash,
          dateOfBirth: data.dateOfBirth,
          isMinor: minor,
          consentState,
          trackingConsent,
          consentAt
        }
      });
    });
    
    // Email-verification token DEFERRED (Days-4-5 queue)
    
    return { success: true, userId: user.id };
  },
  
  async updateDob(userId: string, dateOfBirth: Date) {
    const result = await prisma.$transaction(async (tx) => {
       const user = await tx.user.findUnique({ where: { id: userId } });
       if (!user) return { success: false, reason: 'NOT_FOUND' as const };
       if (user.dateOfBirth) return { success: false, reason: 'DOB_ALREADY_SET' as const };
       
       const minor = isMinor(dateOfBirth);
       const consentState = minor ? ConsentState.PENDING : ConsentState.NOT_REQUIRED;
       
       await tx.user.update({
         where: { id: userId },
         data: {
           dateOfBirth,
           isMinor: minor,
           consentState,
           // If they become a minor, trackingConsent must be forced false per DPDPA
           ...(minor ? { trackingConsent: false } : {})
         }
       });
       
       return { success: true };
    });
    
    if (result.success) {
      try {
        const redis = getRedisClient();
        await invalidateUserMeta(redis, userId);
      } catch (err) {
        console.error('[auth] Redis invalidateUserMeta error after DOB update:', err);
      }
    }
    
    return result;
  },

  async logoutAll(userId: string) {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { tokenVersion: { increment: 1 } },
      select: { tokenVersion: true }
    });

    try {
      const redis = getRedisClient();
      await Promise.all([
        invalidateTv(redis, userId),
        invalidateUserMeta(redis, userId),
      ]);
    } catch (err) {
      console.error('[auth] Redis invalidation error during logoutAll:', err);
    }

    return { success: true, tokenVersion: updated.tokenVersion };
  }
};
