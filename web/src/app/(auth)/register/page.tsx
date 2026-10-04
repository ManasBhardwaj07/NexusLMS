'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { track } from '@codeascend/analytics';

const MIN_AGE_YEARS = 6;

function parseAge(dob: string): number {
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState('');
  const [trackingConsent, setTrackingConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    // Client-side age floor (server validates authoritatively too)
    const age = parseAge(dob);
    if (age < MIN_AGE_YEARS) {
      setError('You must be at least 6 years old to register.');
      return;
    }

    setLoading(true);

    try {
      const isoDob = new Date(dob).toISOString();
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, dateOfBirth: isoDob, trackingConsent }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message ?? 'Registration failed. Please try again.');
        setLoading(false);
        return;
      }

      // Registration succeeded — track event (adult non-minor only; track() gates minors)
      // We use age-based isMinor determination for the analytics user object
      const isMinor = age < 18;
      track(
        { isMinor, consentState: isMinor ? 'PENDING' : 'NOT_REQUIRED' },
        'user_registered',
        { method: 'credentials' },
      );

      // Auto-sign-in after registration
      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError('Account created but sign-in failed. Please go to login.');
        setLoading(false);
        return;
      }

      // Let middleware gate to the correct next step (consent/pending or learn)
      window.location.href = '/learn';
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md glass-card rounded-2xl p-8 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-gradient">CodeAscend</h1>
          <p className="text-sm text-muted-foreground">Create your account</p>
        </div>

        {error && (
          <div
            id="register-error-banner"
            role="alert"
            className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
          >
            {error}
          </div>
        )}

        <form id="register-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="register-name" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Full name
            </label>
            <input
              id="register-name"
              type="text"
              autoComplete="name"
              required
              minLength={2}
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full rounded-lg bg-secondary border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
              placeholder="Alex Sharma"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="register-email" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Email
            </label>
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-lg bg-secondary border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="register-dob" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Date of birth
            </label>
            <input
              id="register-dob"
              type="date"
              required
              max={today}
              value={dob}
              onChange={e => setDob(e.target.value)}
              className="w-full rounded-lg bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
            />
            <p className="text-xs text-muted-foreground">
              Required for DPDP compliance. Not shared publicly.
            </p>
          </div>

          <div className="space-y-1">
            <label htmlFor="register-password" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Password
            </label>
            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-lg bg-secondary border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
              placeholder="Min 8 characters"
            />
          </div>

          <div className="flex items-start gap-2 pt-2">
            <input
              id="register-tracking"
              type="checkbox"
              checked={trackingConsent}
              onChange={e => setTrackingConsent(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <label htmlFor="register-tracking" className="text-xs text-muted-foreground leading-snug">
              I consent to the collection of usage data to improve the product.
              (Optional, governed by DPDP)
            </label>
          </div>

          <button
            id="register-submit"
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary text-primary-foreground font-semibold py-2.5 text-sm hover:opacity-90 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
