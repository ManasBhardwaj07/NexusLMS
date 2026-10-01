import { Request, Response, NextFunction } from 'express';
import { Role } from '@codeascend/auth';

export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // AuthenticateSession must run prior to requireRole in the route chain
    if (!req.user) {
      res.status(401).json({ ok: false });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ ok: false });
      return;
    }

    next();
  };
}
