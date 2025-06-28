import cron from 'node-cron';
import googleSheetsService from './googleSheets.js';

class SchedulerService {
  constructor() {
    // Run sync every 5 minutes by default
    this.syncInterval = process.env.SYNC_INTERVAL || '*/5 * * * *';
    this.syncJob = null;
    this.isSyncing = false;
    this.lastSyncTime = null;
    this.lastSyncStats = null;
  }

  async syncData() {
    // Prevent multiple syncs from running simultaneously
    if (this.isSyncing) {
      console.log('Sync already in progress, skipping...');
      return;
    }

    this.isSyncing = true;
    console.log('Starting Google Forms data sync...');

    try {
      // Perform the sync
      this.lastSyncStats = await googleSheetsService.fetchAndSyncData();
      this.lastSyncTime = new Date();

      console.log('Sync completed successfully:', {
        timestamp: this.lastSyncTime,
        stats: this.lastSyncStats
      });
    } catch (error) {
      console.error('Error during sync:', error);
      this.lastSyncStats = {
        error: error.message,
        timestamp: new Date()
      };
    } finally {
      this.isSyncing = false;
    }
  }

  startSync() {
    if (this.syncJob) {
      this.syncJob.stop();
    }

    // Validate cron expression
    if (!cron.validate(this.syncInterval)) {
      console.error('Invalid cron expression:', this.syncInterval);
      this.syncInterval = '*/5 * * * *'; // Reset to default if invalid
    }

    this.syncJob = cron.schedule(this.syncInterval, () => {
      this.syncData().catch(error => {
        console.error('Scheduled sync failed:', error);
      });
    });

    console.log(`Sync scheduler started with interval: ${this.syncInterval}`);
    
    // Run initial sync
    this.syncData().catch(error => {
      console.error('Initial sync failed:', error);
    });
  }

  stopSync() {
    if (this.syncJob) {
      this.syncJob.stop();
      this.syncJob = null;
      console.log('Sync scheduler stopped');
    }
  }

  setSyncInterval(cronExpression) {
    if (!cron.validate(cronExpression)) {
      throw new Error('Invalid cron expression');
    }

    this.syncInterval = cronExpression;
    console.log(`Sync interval updated to: ${cronExpression}`);
    
    if (this.syncJob) {
      this.stopSync();
      this.startSync();
    }
  }

  // Manual sync method for API endpoint
  async manualSync() {
    console.log('Manual sync requested');
    await this.syncData();
    return {
      success: true,
      timestamp: this.lastSyncTime,
      stats: this.lastSyncStats
    };
  }

  // Get sync status
  getSyncStatus() {
    return {
      isRunning: this.syncJob !== null,
      isSyncing: this.isSyncing,
      lastSyncTime: this.lastSyncTime,
      lastSyncStats: this.lastSyncStats,
      syncInterval: this.syncInterval
    };
  }
}

// Create and export a singleton instance
const schedulerService = new SchedulerService();
export default schedulerService;
