---
name: product-readiness-audit
version: 1.0
purpose: Audit platform readiness before major releases.
when_to_invoke: "before launch / major release / handoff"
invoking_gate: Phase-7
owner: manas
---

# Product Ready — Final Product-Readiness Audit Skill

## Purpose

Perform a **last-mile, production-readiness audit** of a web product before launch, handoff, public release, or a major production rollout.

The audit must:

1. Scan the product end-to-end.
2. Check every requirement in this skill; do not silently skip items.
3. Verify implementation with evidence instead of assuming something exists.
4. Report what is **PASS, PARTIAL, FAIL, NOT APPLICABLE, or NOT VERIFIABLE**.
5. Identify missing, broken, risky, or weak implementations.
6. Generate a **phase-wise remediation plan** ordered by launch impact.
7. Re-test repaired items and update the status.
8. Finish with a clear **Launch Gate**: Ready, Conditionally Ready, or Not Ready.

This is an audit skill, not a generic advice checklist. It should inspect the actual product, repository, configuration, routes, APIs, database, and production behavior whenever access is available.

---

# 1. Operating Rules

## 1.1 Never assume

Do not mark an item complete because:

- a file with the expected name exists;
- a package is installed;
- a component appears to exist in source code;
- the developer says it is done;
- a URL happens to work once;
- a configuration exists but is not actually wired into production.

Mark an item **PASS** only when implementation and behavior are verified.

Use:

- **PASS** — implemented and verified.
- **PARTIAL** — exists but incomplete, inconsistent, fragile, or only works in some cases.
- **FAIL** — missing, broken, or materially incorrect.
- **N/A** — genuinely irrelevant to this product, with a reason.
- **NOT VERIFIABLE** — evidence/access is insufficient; state exactly what is needed.

## 1.2 Every finding needs evidence

For each non-trivial finding, record at least one of:

- URL / route
- source file + line/section
- config file
- API endpoint
- database schema/migration/query
- browser/devtools observation
- Lighthouse/Core Web Vitals result
- automated test result
- production log/monitor result

Do not invent evidence.

## 1.3 Check the real production path

Prefer production/staging behavior over static code inspection.

Check:

- desktop
- mobile
- slow network
- empty data
- invalid input
- failed API requests
- API timeout
- duplicate submission
- duplicate payment
- large datasets
- concurrent users/requests
- authenticated and unauthenticated states
- fresh/incognito browser session

## 1.4 Search the entire product

Inspect, where available:

- all public routes
- all authenticated routes
- all important components
- all forms
- all images/media
- navigation/header/footer
- API routes
- server actions
- background jobs
- database schema and indexes
- storage/upload configuration
- caching
- CDN
- analytics
- SEO files/configuration
- payment flows
- CI/CD
- deployment configuration
- logging/monitoring
- backup/restore configuration

Do not stop after checking only the homepage.

---

# 2. Audit Status Model

Create a master matrix with these columns:

| ID | Area | Check | Status | Severity | Evidence | What's Missing/Broken | Fix | Re-test |
|---|---|---|---|---|---|---|---|---|

Severity:

- **P0 — Launch blocker:** security, broken critical flow, data loss, payment duplication, production outage risk, severe indexing/configuration failure.
- **P1 — Must fix before public launch:** important UX, SEO, accessibility, reliability, or performance gaps.
- **P2 — Should fix soon:** measurable optimization or maintainability issue.
- **P3 — Nice to have:** polish or future scaling enhancement.

---

# 3. A. SEO, Discoverability & Website Hygiene

Check every public indexable page unless intentionally excluded.

### A1. Custom 404 page
Verify:
- unknown route returns a real 404 status;
- custom page is branded and useful;
- navigation/recovery CTA exists;
- it does not incorrectly return HTTP 200 for missing pages.

### A2. Meta title per page
Verify:
- every important page has a unique title;
- title accurately describes page intent;
- no default/generic title leakage.

### A3. Meta description per page
Verify:
- every important indexable page has a useful description;
- descriptions are unique where appropriate;
- no placeholder/default content.

### A4. Noindex directives
Verify:
- intentional private/admin/staging/utility pages are noindexed;
- important public pages are not accidentally noindexed;
- no conflicting `robots` directives exist.

### A5. Canonical tags
Verify:
- canonical exists where appropriate;
- canonical resolves to the preferred URL;
- no accidental self/cross-canonical mistakes;
- HTTP/HTTPS, trailing slash, query-string and duplicate variants are handled consistently.

### A6. CTA above the fold
Verify:
- primary conversion/action CTA is visible without unnecessary scrolling on common viewport sizes;
- CTA has a clear purpose;
- CTA works.

### A7. Favicon set
Verify:
- favicon exists;
- appropriate sizes/formats are provided;
- browser/tab/app icon metadata is correct;
- no missing-icon console/network errors.

### A8. robots.txt
Verify:
- `/robots.txt` exists;
- valid syntax;
- does not block critical pages/assets;
- references sitemap where appropriate.

### A9. sitemap.xml
Verify:
- `/sitemap.xml` exists and parses;
- important canonical/indexable URLs are included;
- excluded/private/duplicate URLs are not included;
- URLs resolve successfully.

### A10. Open Graph image
Verify:
- `og:image` is present where appropriate;
- image URL resolves;
- image is usable when links are shared;
- social metadata is not stale or unrelated.

Also check relevant:
- `og:title`
- `og:description`
- canonical URL
- Twitter/X card metadata where applicable.

### A11. Alt text on every image
Audit:
- meaningful images have useful alt text;
- decorative images are correctly treated as decorative;
- filenames/placeholders are not used as meaningful alt text;
- dynamically rendered images are covered.

### A12. Header hierarchy
Verify:
- heading hierarchy is logical;
- headings describe content;
- no visual text is incorrectly used as a heading;
- sections do not jump around unnecessarily.

### A13. Exactly one H1 per important page
Verify:
- each relevant page has one primary H1;
- no zero-H1 or accidental multi-H1 pages;
- H1 matches page purpose.

### A14. Clean URL slugs
Verify:
- readable, stable slugs;
- no unnecessary IDs/query clutter where avoidable;
- casing is consistent;
- old URLs redirect correctly when changed.

### A15. Internal links
Verify:
- important pages are reachable through internal navigation/links;
- anchor text is meaningful;
- orphan pages are identified;
- links point to canonical URLs where practical.

### A16. Broken links
Crawl and test:
- internal links;
- important external links;
- assets;
- redirects;
- 4xx/5xx responses;
- broken anchors where relevant.

### A17. HTTPS enforcement
Verify:
- HTTP redirects to HTTPS;
- canonical URLs use HTTPS;
- no mixed-content errors;
- secure cookies are used where applicable;
- production traffic is not intentionally served over HTTP.

### A18. Schema markup
Verify:
- relevant structured data is present;
- syntax validates;
- schema matches actual page content;
- no misleading, duplicated, or obsolete markup.

### A19. Search Console verification
Verify:
- production domain/property is verified in Google Search Console;
- sitemap submitted where applicable;
- indexing/coverage issues have been checked;
- important pages are indexable.

---

# 4. B. UX, Responsive Design & Product States

### B1. Mobile responsiveness
Test at common mobile widths and orientations.

Check:
- layout overflow;
- horizontal scrolling;
- nav behavior;
- typography;
- tables;
- cards;
- modals;
- dialogs;
- forms;
- touch targets;
- fixed/sticky elements;
- keyboard behavior.

### B2. Sticky mobile CTA
Where the product has a key conversion action:
- verify the mobile CTA is sticky when appropriate;
- it does not cover content;
- it does not block browser controls;
- it remains usable on small screens.

### B3. Loading states
Check:
- initial page loading;
- route transitions;
- API requests;
- mutation actions;
- uploads;
- long-running operations.

Use suitable spinners/skeletons/progress feedback instead of unexplained frozen UI.

### B4. Empty states
Check:
- no results;
- first-use state;
- empty dashboard;
- deleted/expired data;
- filtered-out results.

Every important empty state should explain what happened and what the user can do next.

### B5. Form error states
Verify:
- client validation;
- server validation;
- field-level errors;
- summary errors where useful;
- errors remain visible long enough to act;
- invalid fields are identifiable;
- successful submissions are not incorrectly shown as errors.

### B6. Thank-you / success page
For lead/contact/signup/submission flows:
- verify successful completion state;
- clear next action;
- analytics/conversion event where appropriate;
- refresh/back behavior is sensible.

### B7. Failed-request handling
Verify:
- API failures have user-safe messages;
- retry path exists when appropriate;
- failures do not leave UI in a broken/loading state;
- partial failures are handled explicitly.

### B8. API timeout handling
Verify:
- requests have sensible timeout behavior;
- UI does not hang indefinitely;
- retry/cancel behavior is appropriate;
- timeout errors are observable.

### B9. Duplicate submissions
Verify:
- repeated clicks are prevented/debounced/locked;
- server-side idempotency exists for critical operations;
- refresh/replay cannot unintentionally create duplicates.

### B10. Duplicate payments
For paid flows:
- payment requests are idempotent;
- webhook processing is idempotent;
- retries cannot create double charges/order creation;
- client UI cannot accidentally submit payment twice.

---

# 5. C. Legal, Trust & Conversion Readiness

### C1. Privacy policy page
Verify:
- accessible from relevant entry points;
- content matches actual data collection/analytics;
- production URL works.

### C2. Terms and conditions
Verify:
- accessible;
- production URL works;
- terms match the product's actual service where applicable.

### C3. Cookie banner
Where required by jurisdiction/use of non-essential cookies:
- consent UI appears appropriately;
- categories/purposes are understandable;
- non-essential cookies/scripts do not run before required consent;
- preference changes are respected.

### C4. Real contact address
Verify the product exposes a legitimate business/contact address or appropriate contact information when required or expected for the product.

Do not require a public residential address merely to satisfy this check.

### C5. Analytics installed
Verify:
- analytics is actually firing in production;
- page views/events work;
- important conversion events work;
- no duplicate event firing;
- privacy/consent behavior is correct where applicable.

---

# 6. D. Images & Static Assets

### D1. Compress all images
Check all major image assets:
- size;
- format;
- dimensions;
- responsive variants;
- modern formats where appropriate;
- compression quality.

### D2. Image lazy loading
Verify below-the-fold/non-critical images load lazily when appropriate.

Do not lazy-load important above-the-fold/LCP content when that would harm performance.

### D3. Static file compression
Verify production compression/brotli/gzip behavior for:
- JS
- CSS
- HTML
- JSON/API payloads when appropriate
- other text assets

---

# 7. E. Performance & Core Web Vitals

Run a Lighthouse audit and supplement it with browser/network evidence.

### E1. Improve Core Web Vitals
Inspect:
- LCP
- INP
- CLS

Also examine:
- TTFB
- FCP
- long tasks
- render-blocking resources
- font loading
- image loading
- JavaScript execution.

### E2. Minify JS and CSS
Verify production assets are minified and appropriately bundled.

### E3. Split code into chunks
Verify route/component-level code splitting where useful.

Avoid both under-splitting and excessive micro-chunks.

### E4. Defer non-critical scripts
Third-party and non-critical scripts should not unnecessarily block first render.

### E5. Unnecessary re-renders
Inspect React/component rendering where applicable:
- unstable props;
- avoidable state updates;
- excessive context updates;
- expensive renders;
- repeated fetches.

### E6. Debounce input handlers
For search/filter/autocomplete/high-frequency input:
- debounce or throttle appropriately;
- avoid request storms and excessive computation.

### E7. CDN
Verify static assets and suitable cacheable content are delivered through a CDN when justified.

### E8. Server-side caching
Check suitable server-rendered/repeated requests for cacheability.

### E9. API response caching
Cache safe, repeated API responses where useful.

Do not cache user-specific or security-sensitive data incorrectly.

### E10. Cache expensive queries
Identify repeated expensive calculations/queries and cache them when safe.

### E11. Compress API payloads
Verify response payloads are not unnecessarily large and are compressed where appropriate.

---

# 8. F. Database & Backend Performance

### F1. Optimize DB queries
Find:
- slow queries;
- full-table scans;
- unnecessary columns;
- repeated queries;
- inefficient joins;
- over-fetching.

### F2. Add database indexes
Verify indexes exist for:
- common filters;
- joins;
- sort keys;
- lookup keys;
- uniqueness constraints.

Do not add indexes blindly; consider write cost and actual query patterns.

### F3. N+1 database queries
Detect loops that execute one DB query per record.

Replace with:
- joins;
- eager loading;
- batching;
- set-based queries;
- appropriate data loaders.

### F4. Paginate large lists
Verify pagination/infinite loading for large datasets.

Check:
- stable ordering;
- bounded response size;
- sensible page limits;
- no accidental unbounded queries.

### F5. Database connection pooling
Verify production connection pooling is configured correctly for deployment topology/serverless/containerized environments.

### F6. Database backups
Verify:
- backups actually run;
- retention exists;
- restore procedure is documented/testable.

### F7. Backup restore test
Perform or verify a real restore drill rather than assuming backups are valid.

---

# 9. G. Security, Abuse Protection & Cost Controls

### G1. Rate limiting
Verify rate limits exist on abuse-prone endpoints:
- auth;
- password/reset;
- OTP;
- public APIs;
- expensive operations;
- uploads;
- payment initiation.

### G2. API limits
Define sensible:
- request limits;
- pagination limits;
- payload limits;
- concurrency limits;
- expensive-operation limits.

### G3. Upload size limits
Verify:
- maximum file size;
- maximum number of files;
- allowed MIME/type policy;
- server-side enforcement, not just client-side.

### G4. Spending caps
Where third-party APIs/cloud services can create variable cost:
- define service quotas/spending alerts/caps where available;
- protect expensive endpoints;
- monitor runaway usage.

### G5. Error handling
Verify:
- no raw stack traces to users;
- sensitive data is not leaked;
- expected errors are structured;
- logs contain enough context to debug.

### G6. Secrets/configuration
Additional mandatory production check:
- no API keys/secrets committed to source;
- production secrets come from appropriate secret/config management;
- client bundles do not expose server secrets.

---

# 10. H. Reliability, Observability & Operations

### H1. Uptime monitoring
Verify:
- production endpoint monitoring;
- health checks;
- alerting;
- useful thresholds.

### H2. Error logging
Verify:
- server-side errors are captured;
- client errors are captured where relevant;
- stack traces/context are available to operators;
- sensitive data is not unnecessarily logged.

### H3. Failed-request monitoring
Track meaningful API failure rates and critical flow failures.

### H4. Concurrent/simultaneous-user testing
Test critical flows under concurrent usage.

At minimum consider:
- parallel reads;
- parallel writes;
- duplicate actions;
- race conditions;
- inventory/seat/quota conflicts;
- payment/webhook concurrency.

### H5. Load balancer
Assess whether the deployment requires a load balancer based on:
- traffic;
- multiple instances;
- high availability needs;
- deployment architecture.

Mark N/A when a single-instance architecture is intentionally sufficient, but record the rationale.

### H6. Health/readiness checks
Additional mandatory production check:
- app/process health endpoint;
- readiness/liveness behavior where infrastructure supports it;
- dependency failure behavior.

---

# 11. I. Forms, Payments, Integrations & Critical Flows

For every critical business flow, test:

1. Happy path
2. Invalid input
3. Empty input
4. Slow response
5. API failure
6. Timeout
7. Retry
8. Double click
9. Refresh
10. Back button
11. Expired/auth-invalid state
12. Concurrent request

For payments specifically also verify:
- idempotency;
- webhook retry handling;
- signature verification;
- pending/failed/success state transitions;
- reconciliation behavior.

---

# 12. J. Route, Accessibility & Browser Sanity Checks

Minimum checks:

- keyboard navigation for important flows;
- visible focus states;
- form labels;
- interactive elements are accessible;
- buttons/links have understandable names;
- modals can be closed and navigated correctly;
- no severe console errors;
- no obvious hydration mismatch;
- no broken assets;
- no unexpected redirects.

---

# 13. Required Scan Sequence

Execute the audit in this order:

## Phase A — Inventory

Create a product inventory:

- routes/pages
- API endpoints
- forms
- critical user journeys
- images/assets
- third-party integrations
- database entities
- deployment/runtime architecture

## Phase B — Crawl & Static Audit

Scan:

- titles
- descriptions
- noindex
- canonicals
- H1/headings
- alt text
- URLs/slugs
- links
- robots.txt
- sitemap.xml
- OG metadata
- schema
- favicon
- legal pages

## Phase C — Runtime UX Audit

Test:

- desktop/mobile
- loading
- empty
- errors
- failed requests
- timeouts
- forms
- success/thank-you
- sticky mobile CTA
- critical user journeys

## Phase D — Performance Audit

Run:

- Lighthouse
- network waterfall
- image-size audit
- JS/CSS bundle audit
- Core Web Vitals review
- caching review
- API payload review
- render/re-render review

## Phase E — Backend & Database Audit

Inspect:

- slow queries
- missing indexes
- N+1
- pagination
- caching
- connection pooling
- payloads
- rate limits
- upload limits
- idempotency
- concurrency

## Phase F — Reliability & Recovery

Verify:

- error logging
- uptime monitoring
- health checks
- backups
- restore test
- failed-request handling
- timeout behavior
- concurrent tests

## Phase G — Final Re-test

Re-run failed checks after remediation and update the master matrix.

---

# 14. Phase-Wise Remediation Plan

Generate a remediation roadmap using these phases unless the actual findings justify a different order.

## Phase 0 — Launch Blockers / Production Safety

Fix first:

- broken critical routes/flows
- accidental noindex on public pages
- broken payment/idempotency behavior
- data-loss risks
- severe security issues
- HTTPS problems
- missing critical error handling
- API abuse/cost exposure
- backup failures
- broken production deployment/health checks

Deliverable:
**Product can operate safely without obvious launch-blocking failures.**

## Phase 1 — Product & SEO Launch Readiness

Fix:

- custom 404
- meta title/description
- robots.txt
- sitemap.xml
- canonical tags
- OG image
- favicon
- alt text
- heading hierarchy
- one H1
- URL slugs
- internal links
- broken links
- schema
- Search Console verification
- CTA above fold
- mobile responsiveness
- sticky mobile CTA
- loading states
- empty states
- form errors
- thank-you page
- privacy
- terms
- cookie consent where applicable
- analytics
- contact information

Deliverable:
**Public-facing product is complete, trustworthy, crawlable, and usable.**

## Phase 2 — Performance

Fix:

- image compression
- lazy loading
- Core Web Vitals
- JS/CSS minification
- code splitting
- CDN
- server-side caching
- API response caching
- expensive-query caching
- API payload compression
- deferred scripts
- unnecessary re-renders
- debounced input handlers
- static file compression

Deliverable:
**Fast, efficient experience on realistic devices/networks.**

## Phase 3 — Backend & Database Scalability

Fix:

- slow DB queries
- missing indexes
- N+1 queries
- unbounded queries
- pagination
- connection pooling
- caching strategy
- API limits
- rate limiting
- upload limits
- concurrency/race conditions

Use actual query/load evidence before introducing infrastructure complexity.

Deliverable:
**Backend remains stable and predictable as usage grows.**

## Phase 4 — Reliability, Observability & Disaster Recovery

Fix:

- uptime monitoring
- error logging
- failed-request monitoring
- alerting
- health/readiness checks
- load balancing when justified
- backup verification
- backup restore drills
- failure/retry behavior
- concurrency tests

Deliverable:
**The team can detect, diagnose, recover from, and learn from production failures.**

## Phase 5 — Final Release Certification

Run final checks:

- production smoke test
- mobile smoke test
- critical-flow test
- payment test if applicable
- broken-link crawl
- Lighthouse
- Core Web Vitals
- SEO metadata crawl
- sitemap/robots validation
- schema validation
- Search Console inspection
- backup/restore verification
- monitoring/alert verification
- error-log verification
- concurrency sanity test

Then issue a final gate:

### READY
No P0/P1 blockers; critical flows verified.

### CONDITIONALLY READY
No P0 blockers, but documented P1/P2 items remain with accepted risk and owners.

### NOT READY
One or more P0 blockers remain, or critical functionality cannot be verified.

---

# 15. Required Final Report

Return the report in exactly this structure:

# PRODUCT READINESS AUDIT

## Executive Summary
- Overall status:
- Critical blockers:
- High-priority missing items:
- Main performance risks:
- Main reliability/scalability risks:
- Launch recommendation based on objective criteria only:

## Scorecard
Do NOT invent a vanity score unless requested. Prefer counts:

- PASS:
- PARTIAL:
- FAIL:
- N/A:
- NOT VERIFIABLE:

## Critical Findings
For every P0/P1 finding:
- ID
- Finding
- Evidence
- User/business impact
- Recommended fix
- Owner role
- Estimated complexity: S / M / L
- Dependency
- Re-test method

## Complete Audit Matrix
Include every check from this skill. Never omit a row.

## What's Missing
Group by:
- SEO
- UX
- Legal/Trust
- Performance
- Backend
- Database
- Security/abuse
- Reliability
- Observability
- Disaster recovery

## What's Broken
List actual broken behavior separately from missing features.

## What's Risky
List implementations that technically work but are likely to fail under scale, retries, concurrency, mobile conditions, SEO crawling, or production traffic.

## Phase-Wise Improvement Plan
For each phase:
- Goal
- Exact tasks
- Why it matters
- Priority
- Dependencies
- Re-test criteria
- Definition of Done

## Final Launch Gate
State one:
- READY
- CONDITIONALLY READY
- NOT READY

Then provide:
- blockers remaining
- accepted risks
- recommended order of work
- exact final verification steps

---

# 16. Important Audit Behavior

Do not merely repeat the checklist.

The value of this skill is in discovering:

- hidden omissions;
- inconsistent page metadata;
- accidental noindex;
- broken links;
- incorrect 404 status codes;
- poor mobile behavior;
- missing loading/empty/error states;
- duplicate API calls;
- N+1 queries;
- missing indexes;
- unbounded queries;
- missing pagination;
- missing idempotency;
- API timeout hangs;
- duplicate payments;
- unprotected uploads;
- absent rate limits;
- runaway third-party/cloud costs;
- oversized images;
- render-blocking scripts;
- excessive JavaScript;
- cache misses;
- unnecessary re-renders;
- missing production monitoring;
- untested backups;
- weak recovery paths.

Always prioritize findings by **actual launch impact**, not by the order in which they appear in the checklist.

---

# 17. Compact Master Instruction

When invoked, behave as a senior:

**Product Manager + QA Lead + Frontend Engineer + Backend Engineer + Database Engineer + DevOps/SRE + SEO Technical Auditor.**

Audit the product end-to-end.

**Do not skip any checklist item.**

For every item, determine:
1. Is it implemented?
2. Is it correctly implemented?
3. Is it working in production/staging?
4. Is it resilient to realistic failure cases?
5. Is it scalable enough for current usage?
6. What evidence proves the status?
7. What exactly is missing or wrong?
8. How should it be fixed?
9. How should it be re-tested?

Then generate a prioritized remediation roadmap and final launch gate.

Never claim something is verified without evidence.
Never mark something PASS merely because code exists.
Never hide NOT VERIFIABLE items.
Never stop at visual QA; inspect SEO, performance, backend, database, reliability, monitoring, cost controls, and recovery.
