'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { track } from '@codeascend/analytics';

const MIN_AGE_YEARS = 6;
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const MONTHS = [
  { value: 1, name: 'Jan' },
  { value: 2, name: 'Feb' },
  { value: 3, name: 'Mar' },
  { value: 4, name: 'Apr' },
  { value: 5, name: 'May' },
  { value: 6, name: 'Jun' },
  { value: 7, name: 'Jul' },
  { value: 8, name: 'Aug' },
  { value: 9, name: 'Sep' },
  { value: 10, name: 'Oct' },
  { value: 11, name: 'Nov' },
  { value: 12, name: 'Dec' },
];

function calculateAge(birthDate: Date): number {
  const now = new Date();
  let age = now.getFullYear() - birthDate.getUTCFullYear();
  const m = now.getMonth() - birthDate.getUTCMonth();
  if (m < 0 || (m === 0 && now.getDate() < birthDate.getUTCDate())) age--;
  return age;
}

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dobDay, setDobDay] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobYear, setDobYear] = useState('');
  const [trackingConsent, setTrackingConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!dobDay || !dobMonth || !dobYear) {
      setError('Please select day, month, and year for your date of birth.');
      return;
    }

    const y = Number(dobYear);
    const m = Number(dobMonth) - 1;
    const d = Number(dobDay);
    const birthDate = new Date(Date.UTC(y, m, d));

    // Calendar validity check (e.g. Feb 31 or Feb 29 on non-leap year)
    if (birthDate.getUTCFullYear() !== y || birthDate.getUTCMonth() !== m || birthDate.getUTCDate() !== d) {
      setError('Please enter a valid calendar date.');
      return;
    }

    const now = new Date();
    if (birthDate > now) {
      setError('Date of birth cannot be in the future.');
      return;
    }

    // Client-side age floor (server validates authoritatively too)
    const age = calculateAge(birthDate);
    if (age < MIN_AGE_YEARS) {
      setError('You must be at least 6 years old to register.');
      return;
    }

    setLoading(true);

    try {
      const isoDob = birthDate.toISOString();
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
            <label htmlFor="register-dob-day" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Date of birth
            </label>
            <div className="grid grid-cols-3 gap-2">
              <select
                id="register-dob-day"
                name="bday-day"
                autoComplete="bday-day"
                required
                value={dobDay}
                onChange={e => setDobDay(e.target.value)}
                disabled={loading}
                className="w-full rounded-lg bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition disabled:opacity-50"
              >
                <option value="" disabled>Day</option>
                {DAYS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              <select
                id="register-dob-month"
                name="bday-month"
                autoComplete="bday-month"
                required
                value={dobMonth}
                onChange={e => setDobMonth(e.target.value)}
                disabled={loading}
                className="w-full rounded-lg bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition disabled:opacity-50"
              >
                <option value="" disabled>Month</option>
                {MONTHS.map(m => (
                  <option key={m.value} value={m.value}>{m.name}</option>
                ))}
              </select>

              <select
                id="register-dob-year"
                name="bday-year"
                autoComplete="bday-year"
                required
                value={dobYear}
                onChange={e => setDobYear(e.target.value)}
                disabled={loading}
                className="w-full rounded-lg bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition disabled:opacity-50"
              >
                <option value="" disabled>Year</option>
                {YEARS.map(yr => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>
            </div>
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

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>
        <button
          id="register-google"
          type="button"
          onClick={() => signIn('google', { callbackUrl: '/learn' })}
          className="w-full flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary py-2.5 text-sm font-medium text-foreground hover:bg-secondary/70 transition"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

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
