import { Op } from 'sequelize';
import BroadcastStatus from '../models/BroadcastStatus.js';
import Schedule from '../models/Schedule.js';
import cron from 'node-cron';

class BroadcastManager {
  constructor() {
    this.checkInterval = null;
    this.cronJob = null;
    this.isRunning = false;
    this.lastCheck = null;
    this.autoModeEnabled = true;
    this.statusHistory = [];
  }

  start() {
    if (this.isRunning) {
      console.log('Broadcast manager already running');
      return;
    }

    this.isRunning = true;
    
    // Check setiap menit untuk auto-update status berdasarkan schedule
    this.cronJob = cron.schedule('* * * * *', async () => {
      if (this.autoModeEnabled) {
        await this.autoUpdateBroadcastStatus();
      }
    });

    // Initial check
    setTimeout(() => this.autoUpdateBroadcastStatus(), 2000);
    
    console.log('Broadcast manager started - auto-checking every minute');
  }

  async autoUpdateBroadcastStatus() {
    try {
      this.lastCheck = new Date();
      
      // Get active schedules
      const activeSchedules = await Schedule.findActive();
      const currentStatus = await BroadcastStatus.getCurrentStatus();
      
      console.log(`Auto-check: Found ${activeSchedules.length} active schedules`);
      
      if (activeSchedules.length > 0) {
        // Ada schedule aktif, set on air jika belum
        const activeSchedule = activeSchedules[0];
        
        if (!currentStatus?.isOnAir) {
          const newStatus = await BroadcastStatus.updateStatus(
            true,
            `On Air - ${activeSchedule.title}`,
            'auto-system',
            activeSchedule.id
          );
          
          console.log('Auto-set broadcast ON AIR:', activeSchedule.title);
          
          // Log history
          this.addToHistory({
            action: 'auto_on',
            schedule: activeSchedule.title,
            timestamp: new Date(),
            reason: 'Active schedule detected'
          });
          
          // Update schedule status to ongoing
          await activeSchedule.update({ status: 'ongoing' });
        } else {
          console.log('Already ON AIR - no change needed');
        }
      } else {
        // Tidak ada schedule aktif, set off air jika sedang on air
        if (currentStatus?.isOnAir) {
          await BroadcastStatus.updateStatus(
            false,
            'Off Air - No active schedule',
            'auto-system',
            null
          );
          
          console.log('Auto-set broadcast OFF AIR');
          
          // Log history
          this.addToHistory({
            action: 'auto_off',
            timestamp: new Date(),
            reason: 'No active schedules'
          });
          
          // Update completed schedules
          await this.markCompletedSchedules();
        } else {
          console.log('Already OFF AIR - no change needed');
        }
      }
    } catch (error) {
      console.error('Error in auto broadcast status:', error);
      this.addToHistory({
        action: 'error',
        timestamp: new Date(),
        error: error.message
      });
    }
  }

  async markCompletedSchedules() {
    try {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const currentTime = now.toTimeString().split(' ')[0];

      // Find schedules that should be completed
      const schedulesToComplete = await Schedule.findAll({
        where: {
          date: today,
          end_time: { [Schedule.sequelize.Op.lt]: currentTime },
          status: 'ongoing'
        }
      });

      for (const schedule of schedulesToComplete) {
        await schedule.update({ status: 'completed' });
        console.log(`Marked schedule as completed: ${schedule.title}`);
      }
    } catch (error) {
      console.error('Error marking completed schedules:', error);
    }
  }

  addToHistory(entry) {
    this.statusHistory.unshift(entry);
    // Keep only last 50 entries
    if (this.statusHistory.length > 50) {
      this.statusHistory = this.statusHistory.slice(0, 50);
    }
  }

  // Manual override methods
  async manualSetOnAir(reason = 'Manual override', updatedBy = 'admin') {
    try {
      const status = await BroadcastStatus.updateStatus(
        true,
        `On Air - ${reason}`,
        updatedBy,
        null
      );
      
      this.addToHistory({
        action: 'manual_on',
        timestamp: new Date(),
        reason,
        updatedBy
      });
      
      console.log('Manual override: Set ON AIR');
      return status;
    } catch (error) {
      console.error('Error in manual set on air:', error);
      throw error;
    }
  }

  async manualSetOffAir(reason = 'Manual override', updatedBy = 'admin') {
    try {
      const status = await BroadcastStatus.updateStatus(
        false,
        `Off Air - ${reason}`,
        updatedBy,
        null
      );
      
      this.addToHistory({
        action: 'manual_off',
        timestamp: new Date(),
        reason,
        updatedBy
      });
      
      console.log('Manual override: Set OFF AIR');
      return status;
    } catch (error) {
      console.error('Error in manual set off air:', error);
      throw error;
    }
  }

  toggleAutoMode() {
    this.autoModeEnabled = !this.autoModeEnabled;
    console.log(`Auto mode ${this.autoModeEnabled ? 'ENABLED' : 'DISABLED'}`);
    
    this.addToHistory({
      action: 'auto_mode_toggle',
      timestamp: new Date(),
      enabled: this.autoModeEnabled
    });
    
    return this.autoModeEnabled;
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      autoModeEnabled: this.autoModeEnabled,
      lastCheck: this.lastCheck,
      historyCount: this.statusHistory.length,
      recentHistory: this.statusHistory.slice(0, 10)
    };
  }

  getFullHistory() {
    return this.statusHistory;
  }

  stop() {
    if (this.cronJob) {
      this.cronJob.destroy();
      this.cronJob = null;
    }
    
    this.isRunning = false;
    console.log('Broadcast manager stopped');
  }

  // Check for upcoming schedules (5 minutes warning)
  async checkUpcomingSchedules() {
    try {
        const now = new Date();
        const fiveMinutesLater = new Date(now.getTime() + 5 * 60000);
        const today = now.toISOString().split('T')[0];
        const currentTime = now.toTimeString().split(' ')[0];
        const warningTime = fiveMinutesLater.toTimeString().split(' ')[0];

        const upcomingSchedules = await Schedule.findAll({
        where: {
            date: today,
            start_time: {
            [Op.between]: [currentTime, warningTime] // FIXED: Now Op is properly imported
            },
            status: 'pending'
        },
        order: [['start_time', 'ASC']]
        });

        return upcomingSchedules;
    } catch (error) {
        console.error('Error checking upcoming schedules:', error);
        return [];
    }
  }
}

// Create singleton instance
const broadcastManager = new BroadcastManager();

export default broadcastManager;