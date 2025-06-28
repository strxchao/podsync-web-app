import cron from 'node-cron';
import { manualSync } from '../scripts/manualSync.js';

class SyncScheduler {
  constructor() {
    // Schedule sync every 5 minutes
    this.syncJob = cron.schedule('*/5 * * * *', async () => {
      console.log('\n[Scheduled Sync] Starting automatic sync...');
      try {
        await manualSync();
        console.log('[Scheduled Sync] Completed successfully');
      } catch (error) {
        console.error('[Scheduled Sync] Failed:', error);
      }
    });
  }

  start() {
    this.syncJob.start();
    console.log('Sync scheduler started - will sync every 5 minutes');
  }

  stop() {
    this.syncJob.stop();
    console.log('Sync scheduler stopped');
  }
}

export default new SyncScheduler();
