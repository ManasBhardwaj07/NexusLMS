'use client';

import { useState, FormEvent } from 'react';

const today = new Date().toISOString().split('T')[0];

export default function CompleteProfilePage() {
  const [dob, setDob] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const isoDob = new Date(dob).toISOString();
      const res = await fetch('/api/v1/auth/dob', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateOfBirth: isoDob }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message ?? 'Failed to save date of birth. Please try again.');
        setLoading(false);
        return;
      }

      setDone(true);
      // Small pause then redirect — middleware will now let them through or route to consent
      setTimeout(() => {
        window.location.href = '/learn';
      }, 1500);
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  if (done) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md glass-card rounded-2xl p-8 text-center space-y-4">
          <div className="text-4xl">✓</div>
          <h1 className="text-xl font-bold text-foreground">Profile updated</h1>
          <p className="text-sm text-muted-foreground">Redirecting you now…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md glass-card rounded-2xl p-8 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-gradient">One more step</h1>
          <p className="text-sm text-muted-foreground">
            We need your date of birth to comply with India&apos;s Digital Personal Data Protection Act.
          </p>
        </div>

        {error && (
          <div
            id="complete-profile-error"
            role="alert"
            className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
          >
            {error}
          </div>
        )}

        <form id="complete-profile-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="profile-dob" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Date of birth
            </label>
            <input
              id="profile-dob"
              type="date"
              required
              max={today}
              value={dob}
              onChange={e => setDob(e.target.value)}
              className="w-full rounded-lg bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
            />
            <p className="text-xs text-muted-foreground">
              This is stored securely and never shared publicly.
            </p>
          </div>

          <button
            id="complete-profile-submit"
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary text-primary-foreground font-semibold py-2.5 text-sm hover:opacity-90 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving…' : 'Save and continue'}
          </button>
        </form>

        <p className="text-xs text-center text-muted-foreground">
          By continuing you acknowledge this data is collected under DPDP Act 2023.
        </p>
      </div>
    </main>
  );
}
