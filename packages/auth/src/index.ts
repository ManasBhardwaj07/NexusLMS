export type SessionPayload = {
  uid: string;
  role: 'STUDENT' | 'MENTOR' | 'ADMIN';
  tv: number;
};

export type UserMeta = {
  isMinor: boolean;
  consentState: 'NOT_REQUIRED' | 'PENDING' | 'VERIFIED';
};
