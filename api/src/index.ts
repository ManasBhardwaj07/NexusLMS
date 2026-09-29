import * as Sentry from '@sentry/node';
import express from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const port = process.env.PORT || 3001;

Sentry.init({
  dsn: process.env.SENTRY_DSN_API,
  environment: process.env.NODE_ENV,
});

import healthRouter from './modules/health/routes.js';

app.use('/api/v1', healthRouter);

app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});
