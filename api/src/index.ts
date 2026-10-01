import * as Sentry from '@sentry/node';
import express from 'express';

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

Sentry.init({
  dsn: process.env.SENTRY_DSN_API,
  environment: process.env.NODE_ENV,
});

import healthRouter from './modules/health/routes.js';
import consentRouter from './modules/consent/routes.js';
import { authenticateSession } from './middleware/authenticateSession.js';
import { requireConsent } from './middleware/requireConsent.js';

app.use('/api/v1', healthRouter);
app.use('/api/v1/consent', consentRouter);

// GET /api/v1/me: returns authenticated user context (gated for minors requiring parental consent)
app.get('/api/v1/me', authenticateSession, requireConsent, (req, res) => {
  res.status(200).json({ ok: true, data: req.user });
});

app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});
