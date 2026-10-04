import Link from 'next/link';

export const metadata = {
  title: 'Parental Consent Pending — CodeAscend',
  description: 'Your account is pending parental consent approval.',
};

/**
 * consent/pending — Server Component (no client state needed).
 *
 * Shown when middleware detects consentState === 'PENDING' for a minor.
 * No analytics events are fired here — this page is only ever seen by users
 * whose track() gate would return 'gated' anyway.
 */
export default function ConsentPendingPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-lg glass-card rounded-2xl p-10 space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-3xl">
          📩
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Waiting for parental consent</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Under India&apos;s{' '}
            <strong className="text-foreground">
              Digital Personal Data Protection Act (DPDP) 2023
            </strong>
            , users under 18 require verified parental consent before accessing the platform.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-secondary/50 p-4 text-left space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            What happens next
          </p>
          <ul className="space-y-2 text-sm text-foreground">
            <li className="flex gap-2">
              <span className="shrink-0 text-primary">1.</span>
              A consent request has been sent to the parent or guardian email you provided.
            </li>
            <li className="flex gap-2">
              <span className="shrink-0 text-primary">2.</span>
              They&apos;ll receive a link to review and approve or decline.
            </li>
            <li className="flex gap-2">
              <span className="shrink-0 text-primary">3.</span>
              Once approved, you&apos;ll automatically get full access.
            </li>
          </ul>
        </div>

        <p className="text-xs text-muted-foreground">
          No consent email received?{' '}
          <Link
            href="mailto:support@codeascend.in"
            className="text-primary hover:underline font-medium"
          >
            Contact support
          </Link>
        </p>
      </div>
    </main>
  );
}
