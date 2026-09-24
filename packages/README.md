# /packages — shared code
Rules (docs/06): `auth` exports the ONLY session-verification path; `analytics` exports the ONLY
track() wrapper. Nothing in /web or /api verifies tokens or fires events directly — lint rules
will enforce this in Week 1.
