'use client';

import { Suspense, useState, FormEvent } from 'react';
import { signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const ERROR_MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked:
    'An account with this email already exists using a password. Please sign in with your password.',
  CredentialsSignin: 'Incorrect email or password.',
  RateLimit: 'Too many attempts. Please wait a minute and try again.',
};

function LoginForm() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);

  const errorMessage =
    inlineError ??
    (errorParam ? (ERROR_MESSAGES[errorParam] ?? 'Sign-in failed. Please try again.') : null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setInlineError(null);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setInlineError(ERROR_MESSAGES[result.error] ?? 'Sign-in failed. Please try again.');
    } else {
      // Redirect to learn dashboard after login; middleware will gate further
      window.location.href = '/learn';
    }
  }

  return (
    <>
      {errorMessage && (
        <div
          id="login-error-banner"
          role="alert"
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
        >
          {errorMessage}
        </div>
      )}
      <form id="login-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="login-email" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Email
          </label>
          <input
            id="login-email"
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
          <label htmlFor="login-password" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full rounded-lg bg-secondary border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
            placeholder="••••••••"
          />
        </div>

        <button
          id="login-submit"
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary text-primary-foreground font-semibold py-2.5 text-sm hover:opacity-90 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        <div className="pt-1 text-center">
          <button
            id="login-logout-all"
            type="button"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              try {
                await fetch('/api/v1/auth/logout-all', { method: 'POST' });
              } catch {
                // Ignore network errors on logout
              }
              await signOut({ redirect: false });
              setLoading(false);
              setInlineError('All active sessions have been revoked. Please sign in again.');
            }}
            className="text-xs text-muted-foreground hover:text-foreground underline transition"
          >
            Revoke all sessions (Log out all devices)
          </button>
        </div>
      </form>
    </>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md glass-card rounded-2xl p-8 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-gradient">CodeAscend</h1>
          <p className="text-sm text-muted-foreground">Sign in to your account</p>
        </div>

        <Suspense fallback={<div className="h-4" />}>
          <LoginForm />
        </Suspense>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>
        <button
          id="login-google"
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
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-primary hover:underline font-medium">
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}
