import cron from 'node-cron';
import { cleanupExpiredTokens } from '../utils/token';

export const startTokenCleanupJob = (): void => {
  cron.schedule('0 * * * *', async () => {
    try {
      await cleanupExpiredTokens();
    } catch (error) {
      console.error('Token cleanup job failed:', error);
    }
  });
};