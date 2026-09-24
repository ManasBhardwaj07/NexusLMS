# 05 — UI/UX Specification v2.0 FINAL

## 1. Principles — v1.0 unchanged (mobile-web-first, SSR catalog, explicit states, accessibility)
## 2. Tokens — v1.0 unchanged; palette decision pending Wk1 (semantic slots make it a 1-file swap)
## 3. v2.0 additions (minors / DPDP)
| Screen | States & rules |
|---|---|
| Signup | **DOB picker (required)** + tracking-consent checkbox (adults) + ToS/privacy links; DOB <18 → post-signup consent-pending screen instead of dashboard |
| Consent pending | Clear screen: "Your parent/guardian needs to verify" → resend parent link; user can still browse catalog |
| Parent verification (public page, from email link) | Parent name + confirm action; states: verified → success screen; expired/used token → clear re-request flow; stores ip/UA (evidence, disclosed in copy) |
| App shell (minor logged in) | Banner-free; analytics silently off; "tracking disabled for your account" noted in Settings (honesty, not a bug) |
| Checkout | If purchaser-of-record decision (Wk2) = parent: parent name + relationship + confirmation checkbox step |
| Settings | Consent status view, data export button, account deletion (with parental re-verification for minors) |

All other pages/components as v1.0: 16-page inventory, 16 components (add `ConsentBanner`, `DOBPicker`,
`ParentVerifyCard`), state matrix enforced, responsive + 3G rules, a11y AA, GA4 events via the single
`track()` wrapper — which returns no-op for minors (enforcement lives in code, not convention).

## 4. Analytics events — v1.0 list, fired only via `track()` (trackingConsent && !isMinor)
