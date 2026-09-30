export type Role = 'STUDENT' | 'MENTOR' | 'ADMIN';

export type ConsentState = 'NOT_REQUIRED' | 'PENDING' | 'VERIFIED';

export type SessionPayload = {
  uid: string;
  role: Role;
  tv: number;
};

export type UserMeta = {
  isMinor: boolean;
  consentState: ConsentState;
};

export type VerifySessionFailureReason =
  | 'malformed'
  | 'expired'
  | 'decryption_failed'
  | 'missing_claims'
  | 'invalid_payload_shape';

export type VerifySessionResult =
  | { ok: true; payload: SessionPayload }
  | { ok: false; reason: VerifySessionFailureReason };
