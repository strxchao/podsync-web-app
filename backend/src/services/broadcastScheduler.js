// Automatic Broadcast Scheduler Service
// Handles automatic on-air/off-air based on schedule

import BroadcastStatus from '../models/BroadcastStatus.js';
import Schedule from '../models/Schedule.js';
import { getCurrentWIBTime, formatWIBDisplay } from '../utils/timezone.js';
import { Op } from 'sequelize';

class BroadcastScheduler {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    this.checkInterval = 30000; // Check every 30 seconds
    this.lastScheduleCheck = null;
    this.lastStatusUpdate = null;
  }
  
  // Start automatic scheduler
  start() {
    if (this.isRunning) {
      console.log('🤖 Broadcast scheduler already running');
      return;
    }
    
    console.log('🤖 Starting broadcast scheduler...');
    console.log(`📅 Will check schedule every ${this.checkInterval/1000} seconds`);
    
    this.isRunning = true;
    
    // Initial check
    this.checkScheduleAndUpdate();
    
    // Set up interval
    this.intervalId = setInterval(() => {
      this.checkScheduleAndUpdate();
    }, this.checkInterval);
    
    console.log('✅ Broadcast scheduler started');
  }
  
  // Stop automatic scheduler
  stop() {
    if (!this.isRunning) {
      console.log('🤖 Broadcast scheduler not running');
      return;
    }
    
    console.log('🛑 Stopping broadcast scheduler...');
    
    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    console.log('✅ Broadcast scheduler stopped');
  }
  
  // Main scheduler logic
  async checkScheduleAndUpdate() {
    try {
      const now = getCurrentWIBTime();
      const todayDate = now.toISOString().split('T')[0];
      const currentTime = now.toTimeString().split(' ')[0]; // HH:mm:ss
      
      console.log(`🔍 Scheduler check at ${formatWIBDisplay(now)}`);
      
      // Find current active schedule
      const activeSchedule = await Schedule.findOne({
        where: {
          date: todayDate,
          start_time: { [Op.lte]: currentTime },
          end_time: { [Op.gte]: currentTime },
          status: 'active'
        },
        order: [['start_time', 'ASC']]
      });
      
      // Get current broadcast status
      const currentStatus = await BroadcastStatus.findOne({
        order: [['updated_at', 'DESC']]
      });
      
      const shouldBeOnAir = !!activeSchedule;
      const currentlyOnAir = currentStatus?.is_on_air || false;
      const lastUpdateBy = currentStatus?.updated_by || 'none';
      
      // Store check info
      this.lastScheduleCheck = {
        time: now,
        wib_time: formatWIBDisplay(now),
        active_schedule: activeSchedule ? {
          id: activeSchedule.id,
          title: activeSchedule.title,
          start_time: activeSchedule.start_time,
          end_time: activeSchedule.end_time
        } : null,
        should_be_on_air: shouldBeOnAir,
        currently_on_air: currentlyOnAir,
        needs_update: shouldBeOnAir !== currentlyOnAir
      };
      
      // Only auto-update if:
      // 1. Status doesn't match schedule
      // 2. Last update wasn't manual (respect manual overrides for some time)
      const shouldAutoUpdate = shouldBeOnAir !== currentlyOnAir && 
                               this.shouldRespectManualOverride(currentStatus) === false;
      
      if (shouldAutoUpdate) {
        console.log('📡 Auto-updating broadcast status:', {
          from: currentlyOnAir ? 'ON' : 'OFF',
          to: shouldBeOnAir ? 'ON' : 'OFF',
          schedule: activeSchedule?.title || 'none',
          reason: activeSchedule ? 'Schedule started' : 'Schedule ended'
        });
        
        const newStatus = await BroadcastStatus.create({
          is_on_air: shouldBeOnAir,
          status_message: shouldBeOnAir ? 
            `Auto On-Air: ${activeSchedule.title} (${activeSchedule.peminjam})` : 
            'Auto Off-Air: Schedule ended',
          updated_by: 'auto-scheduler',
          schedule_id: activeSchedule?.id || null,
          updated_at: now
        });
        
        this.lastStatusUpdate = {
          time: now,
          wib_time: formatWIBDisplay(now),
          action: shouldBeOnAir ? 'AUTO_ON' : 'AUTO_OFF',
          schedule_title: activeSchedule?.title || null,
          status_id: newStatus.id
        };
        
        console.log('✅ Auto-update completed:', this.lastStatusUpdate);
        
      } else if (shouldBeOnAir !== currentlyOnAir) {
        console.log('⏸️ Auto-update skipped (respecting manual override):', {
          last_updated_by: lastUpdateBy,
          time_since_update: currentStatus ? 
            Math.round((now - new Date(currentStatus.updated_at)) / (1000 * 60)) : 'unknown',
          will_retry: 'yes'
        });
      } else {
        console.log('✓ Status matches schedule, no update needed');
      }
      
    } catch (error) {
      console.error('❌ Error in broadcast scheduler:', error);
    }
  }
  
  // Enhanced manual override detection with priority system
  shouldRespectManualOverride(currentStatus) {
    if (!currentStatus) return false;
    
    const lastUpdateBy = currentStatus.updated_by;
    const lastUpdateTime = new Date(currentStatus.updated_at);
    const now = getCurrentWIBTime();
    const minutesSinceUpdate = (now - lastUpdateTime) / (1000 * 60);
    
    // Priority system:
    // 1. Manual overrides (admin, web-app-admin, unity-manual) = 15 minutes
    // 2. Auto scheduler updates = no override protection
    // 3. System updates = 5 minutes protection
    
    const manualSources = ['admin', 'web-app-admin', 'unity-manual', 'unity-manual-override'];
    const autoSources = ['auto-scheduler', 'auto-system'];
    const systemSources = ['system', 'unity-digital-signage'];
    
    let overrideWindow = 0;
    let isProtectedUpdate = false;
    
    if (manualSources.some(source => lastUpdateBy?.includes(source))) {
      overrideWindow = 15; // 15 minutes for manual updates
      isProtectedUpdate = true;
    } else if (systemSources.some(source => lastUpdateBy?.includes(source))) {
      overrideWindow = 5; // 5 minutes for system updates  
      isProtectedUpdate = true;
    } else if (autoSources.some(source => lastUpdateBy?.includes(source))) {
      overrideWindow = 0; // No protection for auto updates
      isProtectedUpdate = false;
    }
    
    const withinOverrideWindow = minutesSinceUpdate < overrideWindow;
    const shouldRespect = isProtectedUpdate && withinOverrideWindow;
    
    if (shouldRespect) {
      console.log(`🛡️ Respecting ${lastUpdateBy} override: ${minutesSinceUpdate.toFixed(1)}min ago (${overrideWindow}min window)`);
    }
    
    return shouldRespect;
  }
  
  // Get scheduler status
  getStatus() {
    return {
      running: this.isRunning,
      check_interval_seconds: this.checkInterval / 1000,
      last_check: this.lastScheduleCheck,
      last_update: this.lastStatusUpdate,
      next_check_in_seconds: this.isRunning ? 
        Math.ceil(this.checkInterval / 1000) : null
    };
  }
  
  // Force immediate check
  async forceCheck() {
    console.log('🔄 Force checking schedule...');
    await this.checkScheduleAndUpdate();
    return this.getStatus();
  }
  
  // Update check interval
  setCheckInterval(seconds) {
    const newInterval = seconds * 1000;
    
    if (newInterval < 10000) {
      throw new Error('Check interval cannot be less than 10 seconds');
    }
    
    console.log(`⚙️ Updating check interval: ${this.checkInterval/1000}s → ${seconds}s`);
    
    this.checkInterval = newInterval;
    
    // Restart if running
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }
}

// Export singleton instance
export default new BroadcastScheduler();