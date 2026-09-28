import * as Sentry from '@sentry/node';
import express from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const port = process.env.PORT || 3001;

// Use unpooled url for now, or the pooled one depending on env setup.
// Using pooled for runtime as per rules.
const prisma = new PrismaClient();

Sentry.init({
  dsn: process.env.SENTRY_DSN_API,
  environment: process.env.NODE_ENV,
});

app.get('/api/v1/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ ok: true, db: 'up' });
  } catch (error) {
    console.error('Database connection failed during health check:', error);
    res.status(503).json({ ok: false, db: 'down' });
  }
});

app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});
