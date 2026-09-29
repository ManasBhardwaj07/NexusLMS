import { Request, Response } from 'express';
import { healthService } from './service.js';

export const healthController = {
  async getHealth(req: Request, res: Response): Promise<void> {
    const isDbUp = await healthService.checkDatabase();
    
    if (isDbUp) {
      res.status(200).json({ ok: true, db: 'up' });
    } else {
      res.status(503).json({ ok: false, db: 'down' });
    }
  }
};
