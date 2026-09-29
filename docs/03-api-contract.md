# 03 — API Contract v2.0 FINAL

Conventions: REST/JSON under `/api/v1` · envelope `{ ok, data | error: { code, message } }` ·
Auth: `Authorization: Bearer <NextAuth JWT>` · ◆ = accepts `Idempotency-Key` · lists paginated (`?page=&pageSize=`, max 100) ·
**Consent gating (v2.0):** PENDING-consent sessions get 403 `CONSENT_REQUIRED` on /learn/*, /payments/*, /live/*.
Minor-flagged sessions are never counted in analytics (client-side `track()` enforces; server does not emit measurement payloads).

## Auth (5/min/IP)
| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | /auth/register | — | email+password+**dateOfBirth (required)**+consent checkbox → sets consentState; minor-consent timestamps recorded on ParentalConsent.verifiedAt; adult consent timestamp (consentAt on User) lands with the Week 2 auth build via migration; sends verification email; minors → consentState PENDING |
| POST | /auth/verify-email | — | token |
| POST | /auth/forgot-password | — | always 200; 3/hour/IP |
| POST | /auth/reset-password | — | single-use token; bumps tokenVersion + invalidates Redis tv key |
| GET | /auth/session | session | { uid, name, email, role, isMinor, consentState, trackingConsent } |

## Parental consent (v2.0) — DPDP §9
| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | /consent/parental/request ◆ | session (minor, PENDING) | { method: EMAIL\|PHONE, parentEmail?, parentPhone? } → creates ParentalConsent (single-use token, 48h) → sends parent verification link |
| GET | /consent/parental/status | session | { consentState, verifiedAt?, method? } — drives the pending-consent UI |
| POST | /consent/parental/verify | — (token) | parent opens link → token validated (single-use, unexpired) → verifiedAt + ip + userAgent stored → consentState VERIFIED |
| POST | /me/data-export | session | DPDP data subject export (JSON bundle; parent-verifiable for minors) |
| DELETE | /me/account | session | deletion request; for minors requires fresh parental verification |

## Catalog (public, cached)
| GET | /courses | — | filters: search/category/level/priceMin/priceMax/sort; PUBLISHED only |
| GET | /courses/:slug | — | syllabus tree; previews flagged |
| GET | /courses/:slug/preview | — | signed URL for isPreview lecture (no auth) |

## Enrollment & access (student)
| GET | /me/enrollments | student (consent VERIFIED if minor) | courses + computed progress% |
| GET | /me/enrollments/:courseId/resume | ↑ | { lectureId, watchedSec } |
| POST | /me/lectures/:lectureId/progress ◆ | ↑ enrolled | { watchedSec, completed? } ~30s batched |
| GET | /me/lectures/:lectureId/play | ↑ | 403→redirect: preview OR active enrollment; { signedUrl, expiresAt, watermarkText } |
| GET | /me/orders | ↑ | history + refund status |

## Payments (20/min/user) — TRD §5 normative
| POST | /payments/order ◆ | student | { courseId, couponCode? } → server-validated price → Razorpay order → { razorpayOrderId, amount, keyId } |
| POST | /payments/verify ◆ | student | HMAC verify → txn(order PAID, payment upsert, enrollment upsert) → enqueue invoice |
| POST | /payments/webhook | — (sig-verified) | webhook_events dedup → enqueue; fast 200 |
| POST | /payments/links/ingest ◆ | admin | manual Payment-Link purchase → same verified txn path (Wk3–4) |
| POST | /payments/parent-confirm | PENDING-DECISION | reserved seam for Wk2 purchaser-of-record decision; 404 until enabled |

## Live sessions (v1 YouTube scope)
| GET | /me/courses/:courseId/live | enrolled | upcoming |
| POST | /admin/live-sessions | admin/mentor | schedule + reminder job |
| POST | /admin/live-sessions/:id/start · /complete · /link-recording | admin/mentor | lifecycle + manual ingest attach |

## Admin (ADMIN role; every mutation writes AdminAction in-txn)
courses/modules/lectures CRUD · publish-toggle · coupons · GET /admin/stats · POST /admin/orders/:id/refund ·
POST /admin/orders/:id/reconcile · GET /admin/audit-log · GET /admin/reconciliation — as v1.0 contract.

## System
GET /health · GET /sitemap.xml — unchanged.

## Error codes (v1.0 set) + v2.0: `CONSENT_REQUIRED` 403 · `CONSENT_TOKEN_INVALID` 400 · `MINOR_CHECKOUT_BLOCKED` 403
