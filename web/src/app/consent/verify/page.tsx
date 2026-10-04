'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

type VerificationState = 'submitting' | 'success' | 'invalid' | 'no-token' | 'error';

function VerifyConsentContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [state, setState] = useState<VerificationState>(token ? 'submitting' : 'no-token');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setState('no-token');
      return;
    }

    let isMounted = true;

    async function verifyToken() {
      try {
        const res = await fetch('/api/v1/consent/parental/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        if (!isMounted) return;

        if (res.ok) {
          setState('success');
        } else {
          const data = (await res.json().catch(() => ({}))) as {
            ok?: boolean;
            error?: { code?: string };
          };

          if (res.status === 400 || data.error?.code === 'CONSENT_TOKEN_INVALID') {
            setState('invalid');
          } else {
            setState('error');
            setErrorMessage('Unable to verify consent at this time. Please try again.');
          }
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('[consent] Verification failed:', err);
        setState('error');
        setErrorMessage('Network error occurred. Please check your connection and try again.');
      }
    }

    verifyToken();

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <div className="w-full max-w-lg glass-card rounded-2xl p-10 space-y-6 text-center">
      {state === 'submitting' && (
        <div id="verify-status-submitting" className="space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-3xl animate-pulse">
            ⏳
          </div>
          <h1 className="text-2xl font-bold text-foreground">Verifying parental consent</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Please wait while we record and securely verify your consent instrument under the DPDP Act.
          </p>
        </div>
      )}

      {state === 'success' && (
        <div id="verify-status-success" className="space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-3xl text-emerald-400">
            ✓
          </div>
          <h1 className="text-2xl font-bold text-foreground">Consent recorded</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Thank you. Verifiable parental consent has been successfully recorded. Your student can now access their courses on CodeAscend.
          </p>
          <div className="rounded-xl border border-border bg-secondary/50 p-4 text-xs text-muted-foreground text-left">
            Under India&apos;s Digital Personal Data Protection Act (DPDP) 2023 §9, this verification is logged with a secure timestamp and audit record. No further action is required from you.
          </div>
        </div>
      )}

      {state === 'invalid' && (
        <div id="verify-status-invalid" className="space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-3xl text-red-400">
            ⚠️
          </div>
          <h1 className="text-2xl font-bold text-foreground">Link expired or invalid</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This verification link is invalid, has expired (valid for 48 hours), or has already been used.
          </p>
          <div className="rounded-xl border border-border bg-secondary/50 p-4 text-xs text-foreground text-left space-y-1">
            <span className="font-semibold text-muted-foreground uppercase tracking-wide block">Next Steps</span>
            <p>Ask your student to sign in to CodeAscend and resend the verification email to your address.</p>
          </div>
        </div>
      )}

      {state === 'no-token' && (
        <div id="verify-status-no-token" className="space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-3xl text-amber-400">
            ℹ️
          </div>
          <h1 className="text-2xl font-bold text-foreground">Verification link incomplete</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            No verification token was detected in your request URL.
          </p>
          <p className="text-xs text-muted-foreground">
            Please make sure you clicked the complete link provided in the parental consent email.
          </p>
        </div>
      )}

      {state === 'error' && (
        <div id="verify-status-error" className="space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-3xl text-red-400">
            ⚠️
          </div>
          <h1 className="text-2xl font-bold text-foreground">Verification service unavailable</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {errorMessage || 'A temporary error occurred while processing your consent.'}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-lg bg-primary text-primary-foreground font-semibold px-4 py-2 text-sm hover:opacity-90 transition"
          >
            Try again
          </button>
        </div>
      )}

      <div className="pt-2 text-xs text-muted-foreground">
        Questions?{' '}
        <Link href="mailto:support@codeascend.in" className="text-primary hover:underline font-medium">
          Contact support
        </Link>
      </div>
    </div>
  );
}

export default function ConsentVerifyPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <Suspense
        fallback={
          <div className="w-full max-w-lg glass-card rounded-2xl p-10 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-2xl animate-pulse">
              ⏳
            </div>
            <p className="text-sm text-muted-foreground">Loading verification portal…</p>
          </div>
        }
      >
        <VerifyConsentContent />
      </Suspense>
    </main>
  );
}
