import * as Sentry from '@sentry/node';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3001;

Sentry.init({
  dsn: process.env.SENTRY_DSN_API,
  environment: process.env.NODE_ENV,
});

// req.ip correctness for rate-limiter keying and DPDP ipAddress evidence behind reverse proxy
app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:3000'],
    credentials: true,
  })
);
app.use(express.json({ limit: '100kb' }));

import healthRouter from './modules/health/routes.js';
import consentRouter from './modules/consent/routes.js';
import { authRouter, meRouter } from './modules/auth/routes.js';
import { authenticateSession } from './middleware/authenticateSession.js';
import { requireConsent } from './middleware/requireConsent.js';

app.use('/api/v1', healthRouter);
app.use('/api/v1/consent', consentRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/me', meRouter);

// GET /api/v1/me: returns authenticated user context (gated for minors requiring parental consent)
app.get('/api/v1/me', authenticateSession, requireConsent, (req, res) => {
  res.status(200).json({ ok: true, data: req.user });
});

Sentry.setupExpressErrorHandler(app);

app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});
