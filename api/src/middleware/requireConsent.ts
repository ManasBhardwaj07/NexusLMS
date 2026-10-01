import { Request, Response, NextFunction } from 'express';

export function requireConsent(req: Request, res: Response, next: NextFunction): void {
  // AuthenticateSession must run prior to requireConsent in the route chain
  if (!req.user) {
    res.status(401).json({ ok: false });
    return;
  }

  // DPDP §9: Minor accounts require VERIFIED parental consent before accessing gated routes
  if (req.user.isMinor && req.user.consentState !== 'VERIFIED') {
    res.status(403).json({
      ok: false,
      error: {
        code: 'CONSENT_REQUIRED',
        message: 'Parental consent required for minor accounts',
      },
    });
    return;
  }

  next();
}
