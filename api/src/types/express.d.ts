import { Role, ConsentState } from '@codeascend/auth';

declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        role: Role;
        isMinor: boolean;
        consentState: ConsentState;
        tv: number;
      };
    }
  }
}
