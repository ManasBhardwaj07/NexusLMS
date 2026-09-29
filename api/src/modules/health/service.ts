import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const healthService = {
  async checkDatabase(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database connection failed during health check:', error);
      return false;
    }
  }
};
