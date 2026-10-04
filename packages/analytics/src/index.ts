/**
 * @codeascend/analytics
 *
 * Thin wrapper around PostHog (or any future provider). All calls are GATED:
 *   - minors (isMinor === true) receive ZERO analytics events — DPDP compliance.
 *   - users whose consentState is not 'NOT_REQUIRED' are also silenced until they
 *     have given/obtained consent, because tracking a user who hasn't consented
 *     is the same violation as tracking a minor.
 *
 * The gate is enforced here, not at each call-site, so it cannot be accidentally
 * bypassed by future contributors who forget to check.
 */

export type TrackingUser = {
  uid: string;
  isMinor: boolean;
  consentState: 'NOT_REQUIRED' | 'PENDING' | 'VERIFIED';
};

export type TrackingEvent =
  | 'user_registered'
  | 'user_logged_in'
  | 'consent_viewed'
  | 'profile_completed'
  | 'page_viewed';

export type TrackingProperties = Record<string, string | number | boolean | null>;

/**
 * Fire an analytics event.
 * Returns `'fired'` when the event was dispatched, `'gated'` when suppressed
 * (minor or non-consented user), `'noop'` in non-production environments.
 */
export function track(
  user: TrackingUser,
  event: TrackingEvent,
  properties?: TrackingProperties,
): 'fired' | 'gated' | 'noop' {
  // ── GATE ──────────────────────────────────────────────────────────────────
  // DPDP: minors and non-consented users must receive ZERO analytics events.
  if (user.isMinor || user.consentState === 'PENDING') {
    return 'gated';
  }

  // ── NOOP in development / test ────────────────────────────────────────────
  if (process.env.NODE_ENV !== 'production') {
    // Log to console so developers can see events without sending to PostHog.
    console.info(`[analytics:noop] ${event}`, { uid: user.uid, ...properties });
    return 'noop';
  }

  // ── FIRE (production only) ────────────────────────────────────────────────
  // Wrapped in try/catch so analytics errors never crash the calling page.
  try {
    // PostHog capture via fetch — avoids importing the heavy Node.js SDK in
    // the Next.js edge/RSC boundary. Swap for posthog-js in client components
    // when the client-side bundle is wired up in Phase 2.
    const POSTHOG_KEY = process.env.POSTHOG_API_KEY;
    const POSTHOG_HOST = process.env.POSTHOG_HOST ?? 'https://app.posthog.com';

    if (POSTHOG_KEY) {
      fetch(`${POSTHOG_HOST}/capture/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: POSTHOG_KEY,
          event,
          distinct_id: user.uid,
          properties: { ...properties, $lib: 'codeascend-analytics/1.0' },
        }),
      }).catch(() => {
        // Fire-and-forget; ignore network errors silently in production.
      });
    }
  } catch {
    // Never crash on analytics failure.
  }

  return 'fired';
}
