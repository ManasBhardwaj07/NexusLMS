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
 * PII Denylist: keys that must never reach analytics logs or providers.
 * Case-insensitive comparison is performed at the boundary.
 */
const PII_KEYS = new Set([
  'uid',
  'userid',
  'user_id',
  'id',
  'email',
  'name',
  'firstname',
  'lastname',
  'first_name',
  'last_name',
  'phone',
  'phonenumber',
  'phone_number',
  'dob',
  'dateofbirth',
  'date_of_birth',
  'parentemail',
  'parent_email',
  'token',
]);

function sanitizeProperties(properties?: TrackingProperties): TrackingProperties {
  if (!properties) return {};
  const clean: TrackingProperties = {};
  for (const [key, val] of Object.entries(properties)) {
    if (!PII_KEYS.has(key.toLowerCase())) {
      clean[key] = val;
    }
  }
  return clean;
}

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

  // ── BOUNDARY SANITIZATION ────────────────────────────────────────────────
  // DPDP: strip identifying keys before logging or dispatching.
  const safeProperties = sanitizeProperties(properties);

  // ── NOOP in development / test ────────────────────────────────────────────
  if (process.env.NODE_ENV !== 'production') {
    console.info(`[analytics:noop] ${event}`, safeProperties);
    return 'noop';
  }

  // ── FIRE (production only) ────────────────────────────────────────────────
  // Wrapped in try/catch so analytics errors never crash the calling page.
  try {
    // PostHog capture via fetch — REST capture (no npm dep).
    // Configured via POSTHOG_KEY. Default host is EU cloud.
    const POSTHOG_KEY = process.env.POSTHOG_KEY;
    const POSTHOG_HOST = process.env.POSTHOG_HOST ?? 'https://eu.i.posthog.com';

    if (POSTHOG_KEY) {
      // DPDP: Payload is strictly anonymous. distinct_id is fixed to 'anonymous',
      // and properties contain zero PII (no email, uid, or user-identifying data).
      fetch(`${POSTHOG_HOST}/capture/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: POSTHOG_KEY,
          event,
          distinct_id: 'anonymous',
          properties: { ...safeProperties, $lib: 'codeascend-analytics/1.0' },
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


