import bcrypt from 'bcrypt';
import { prisma } from '../../lib/prisma.js';
import { ConsentState } from '@prisma/client';
import { getRedisClient, invalidateUserMeta } from '@codeascend/auth';

export const authService = {
  async register(data: { name?: string; email: string; passwordRaw: string; dateOfBirth: Date; trackingConsent: boolean }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return { success: false, reason: 'EMAIL_EXISTS' as const };
    }
    
    // bcrypt ONLY here (raw grep across middleware = empty) per D-1
    const passwordHash = await bcrypt.hash(data.passwordRaw, 12);
    
    const ageInMilliseconds = Date.now() - data.dateOfBirth.getTime();
    const ageInYears = ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25);
    const isMinor = ageInYears < 18;
    const consentState = isMinor ? ConsentState.PENDING : ConsentState.NOT_REQUIRED;
    
    // DPDPA rule: minors cannot consent to tracking
    const trackingConsent = data.trackingConsent && !isMinor;
    const consentAt = trackingConsent ? new Date() : null;

    const user = await prisma.$transaction(async (tx) => {
      return tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          passwordHash,
          dateOfBirth: data.dateOfBirth,
          isMinor,
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
       
       const ageInMilliseconds = Date.now() - dateOfBirth.getTime();
       const ageInYears = ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25);
       const isMinor = ageInYears < 18;
       const consentState = isMinor ? ConsentState.PENDING : ConsentState.NOT_REQUIRED;
       
       await tx.user.update({
         where: { id: userId },
         data: {
           dateOfBirth,
           isMinor,
           consentState,
           // If they become a minor, trackingConsent must be forced false per DPDPA
           ...(isMinor ? { trackingConsent: false } : {})
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
  }
};
