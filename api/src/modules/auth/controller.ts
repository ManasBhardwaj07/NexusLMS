import { Request, Response } from 'express';
import { z } from 'zod';
import { authService } from './service.js';

const registerSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().transform(val => val.toLowerCase()),
  password: z.string().min(8),
  dateOfBirth: z.string().datetime().refine((val) => new Date(val) <= new Date(), { message: 'dateOfBirth cannot be in the future' }),
  trackingConsent: z.boolean()
});

const dobSchema = z.object({
  dateOfBirth: z.string().datetime().refine((val) => new Date(val) <= new Date(), { message: 'dateOfBirth cannot be in the future' })
});

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(422).json({ ok: false, error: { code: 'VALIDATION', issues: parsed.error.issues } });
        return;
      }
      
      const { name, email, password, dateOfBirth, trackingConsent } = parsed.data;
      const result = await authService.register({
        name,
        email,
        passwordRaw: password,
        dateOfBirth: new Date(dateOfBirth),
        trackingConsent
      });
      
      if (!result.success) {
        if (result.reason === 'EMAIL_EXISTS') {
          res.status(409).json({ ok: false, error: { code: 'EMAIL_EXISTS' } });
          return;
        }
        res.status(400).json({ ok: false });
        return;
      }
      
      res.status(200).json({ ok: true });
    } catch (err) {
      console.error('[auth] register error:', err);
      // Commandment 14: fail-closed everywhere, uniform {ok: false}
      res.status(500).json({ ok: false });
    }
  },
  
  async updateDob(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || !req.user.uid) {
        res.status(401).json({ ok: false, error: { code: 'UNAUTHORIZED' } });
        return;
      }
      
      const parsed = dobSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(422).json({ ok: false, error: { code: 'VALIDATION', issues: parsed.error.issues } });
        return;
      }
      
      const result = await authService.updateDob(req.user.uid, new Date(parsed.data.dateOfBirth));
      
      if (!result.success) {
        if (result.reason === 'DOB_ALREADY_SET') {
          res.status(409).json({ ok: false, error: { code: 'DOB_ALREADY_SET' } });
          return;
        }
        res.status(400).json({ ok: false });
        return;
      }
      
      res.status(200).json({ ok: true });
    } catch (err) {
      console.error('[auth] updateDob error:', err);
      res.status(500).json({ ok: false });
    }
  }
};
