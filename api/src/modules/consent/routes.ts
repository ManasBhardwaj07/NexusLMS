import { Router } from 'express';
import { authenticateSession } from '../../middleware/authenticateSession.js';
import { rateLimiter } from '../../middleware/rateLimiter.js';
import { consentController } from './controller.js';

const router = Router();

// POST /consent/parental/request: minor students initiate parental verification request
router.post(
  '/parental/request',
  authenticateSession,
  rateLimiter(5, 3600, 'consent-req'),
  consentController.request
);

// POST /consent/parental/verify: public endpoint for parents to verify single-use consent token
router.post(
  '/parental/verify',
  rateLimiter(10, 3600, 'consent-verify'),
  consentController.verify
);

// GET /consent/parental/status: authenticated status query driving pending-consent UI
router.get(
  '/parental/status',
  authenticateSession,
  consentController.status
);

export default router;
