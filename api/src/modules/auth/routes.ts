import { Router } from 'express';
import { authController } from './controller.js';
import { rateLimiter } from '../../middleware/rateLimiter.js';
import { authenticateSession } from '../../middleware/authenticateSession.js';

export const authRouter = Router();
export const meRouter = Router();

authRouter.post('/register', rateLimiter(5, 60, 'auth-register'), authController.register);

meRouter.post('/dob', authenticateSession, authController.updateDob);
