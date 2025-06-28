// Broadcast Controller for Unity Integration
// Handles sync between PodSync Web App and Unity Digital Signage

import BroadcastStatus from '../models/BroadcastStatus.js';
import Schedule from '../models/Schedule.js';
import { getCurrentWIBTime, isToday, formatWIBDisplay } from '../utils/timezone.js';
import { TIMEOUTS, withTimeout } from '../config/timeouts.js';
import { Op } from 'sequelize';

class BroadcastController {
  
  // Get current broadcast status (for Unity to poll)
  async getCurrentStatus(req, res) {
    try {
      console.log('🎙️ Broadcasting status requested');
      
      const currentStatus = await BroadcastStatus.findOne({
        order: [['lastUpdated', 'DESC']],
        include: [{
          model: Schedule,
          as: 'schedule',
          required: false
        }]
      });
      
      const now = getCurrentWIBTime();
      
      const response = {
        timestamp: now.toISOString(),
        wib_time: formatWIBDisplay(now),
        status: {
          is_on_air: currentStatus?.isOnAir || false,
          message: currentStatus?.statusMessage || 'Off Air',
          updated_by: currentStatus?.updatedBy || 'system',
          last_updated: currentStatus?.lastUpdated,
          last_updated_wib: currentStatus?.lastUpdated ? 
            formatWIBDisplay(currentStatus.lastUpdated) : null
        },
        current_schedule: currentStatus?.schedule ? {
          id: currentStatus.schedule.id,
          title: currentStatus.schedule.title,
          peminjam: currentStatus.schedule.peminjam,
          start_time: currentStatus.schedule.start_time,
          end_time: currentStatus.schedule.end_time,
          location: currentStatus.schedule.location
        } : null,
        auto_mode_enabled: process.env.BROADCAST_AUTO_MODE !== 'false'
      };
      
      res.json(response);
      
    } catch (error) {
      console.error('Error getting broadcast status:', error);
      res.status(500).json({
        error: 'Failed to get broadcast status',
        details: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  // Update broadcast status (from Unity or Web App)
  async updateStatus(req, res) {
    try {
      const { is_on_air, message, updated_by = 'manual', schedule_id } = req.body;
      
      console.log('🎙️ Broadcasting status update:', {
        is_on_air,
        message,
        updated_by,
        schedule_id
      });
      
      // Validate input
      if (typeof is_on_air !== 'boolean') {
        return res.status(400).json({
          error: 'Invalid input',
          details: 'is_on_air must be boolean'
        });
      }
      
      // Create new broadcast status record
      const newStatus = await BroadcastStatus.create({
        isOnAir: is_on_air,
        statusMessage: message || (is_on_air ? 'On Air' : 'Off Air'),
        updatedBy: updated_by,
        schedule_id: schedule_id || null,
        lastUpdated: getCurrentWIBTime()
      });
      
      // Get the created status with schedule info
      const statusWithSchedule = await BroadcastStatus.findByPk(newStatus.id, {
        include: [{
          model: Schedule,
          as: 'schedule',
          required: false
        }]
      });
      
      const response = {
        success: true,
        message: 'Broadcast status updated successfully',
        timestamp: getCurrentWIBTime().toISOString(),
        status: {
          id: statusWithSchedule.id,
          is_on_air: statusWithSchedule.isOnAir,
          message: statusWithSchedule.statusMessage,
          updated_by: statusWithSchedule.updatedBy,
          updated_at: statusWithSchedule.lastUpdated,
          updated_at_wib: formatWIBDisplay(statusWithSchedule.lastUpdated)
        },
        schedule: statusWithSchedule.schedule ? {
          id: statusWithSchedule.schedule.id,
          title: statusWithSchedule.schedule.title,
          peminjam: statusWithSchedule.schedule.peminjam,
          start_time: statusWithSchedule.schedule.start_time,
          end_time: statusWithSchedule.schedule.end_time
        } : null
      };
      
      console.log('✅ Broadcast status updated:', response.status);
      res.json(response);
      
    } catch (error) {
      console.error('Error updating broadcast status:', error);
      res.status(500).json({
        error: 'Failed to update broadcast status',
        details: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  // Get current and upcoming schedules (for auto mode)
  async getScheduleStatus(req, res) {
    try {
      const now = getCurrentWIBTime();
      const todayDate = now.toISOString().split('T')[0];
      const currentTime = now.toTimeString().split(' ')[0]; // HH:mm:ss
      
      console.log('📅 Schedule status requested for:', {
        date: todayDate,
        time: currentTime,
        wib: formatWIBDisplay(now)
      });
      
      // Find current active schedule
      const currentSchedule = await Schedule.findOne({
        where: {
          date: todayDate,
          start_time: { [Op.lte]: currentTime },
          end_time: { [Op.gte]: currentTime },
          status: 'active'
        },
        order: [['start_time', 'ASC']]
      });
      
      // Find next schedule today
      const nextSchedule = await Schedule.findOne({
        where: {
          date: todayDate,
          start_time: { [Op.gt]: currentTime },
          status: 'active'
        },
        order: [['start_time', 'ASC']]
      });
      
      // Find all today's schedules for context
      const todaySchedules = await Schedule.findAll({
        where: {
          date: todayDate,
          status: 'active'
        },
        order: [['start_time', 'ASC']]
      });
      
      const response = {
        timestamp: now.toISOString(),
        wib_time: formatWIBDisplay(now),
        current_time: currentTime,
        current_schedule: currentSchedule ? {
          id: currentSchedule.id,
          title: currentSchedule.title,
          peminjam: currentSchedule.peminjam,
          unit_prodi: currentSchedule.unit_prodi,
          start_time: currentSchedule.start_time,
          end_time: currentSchedule.end_time,
          location: currentSchedule.location,
          should_be_on_air: true
        } : null,
        next_schedule: nextSchedule ? {
          id: nextSchedule.id,
          title: nextSchedule.title,
          peminjam: nextSchedule.peminjam,
          unit_prodi: nextSchedule.unit_prodi,
          start_time: nextSchedule.start_time,
          end_time: nextSchedule.end_time,
          location: nextSchedule.location,
          starts_in_minutes: this.calculateMinutesUntil(nextSchedule.start_time, currentTime)
        } : null,
        total_schedules_today: todaySchedules.length,
        auto_recommendation: {
          should_be_on_air: !!currentSchedule,
          reason: currentSchedule ? 
            `Active schedule: ${currentSchedule.title}` : 
            'No active schedule at this time'
        }
      };
      
      res.json(response);
      
    } catch (error) {
      console.error('Error getting schedule status:', error);
      res.status(500).json({
        error: 'Failed to get schedule status',
        details: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  // Auto mode: Check and update status based on schedule
  async autoUpdateStatus(req, res) {
    try {
      const now = getCurrentWIBTime();
      const todayDate = now.toISOString().split('T')[0];
      const currentTime = now.toTimeString().split(' ')[0];
      
      console.log('🤖 Auto status update check:', {
        date: todayDate,
        time: currentTime,
        wib: formatWIBDisplay(now)
      });
      
      // Check if there's an active schedule right now
      const activeSchedule = await Schedule.findOne({
        where: {
          date: todayDate,
          start_time: { [Op.lte]: currentTime },
          end_time: { [Op.gte]: currentTime },
          status: 'active'
        }
      });
      
      // Get current broadcast status
      const currentStatus = await BroadcastStatus.findOne({
        order: [['updated_at', 'DESC']]
      });
      
      const shouldBeOnAir = !!activeSchedule;
      const currentlyOnAir = currentStatus?.is_on_air || false;
      
      let updateMade = false;
      let newStatus = null;
      
      // Auto update if status doesn't match schedule
      if (shouldBeOnAir !== currentlyOnAir) {
        console.log('📡 Auto updating broadcast status:', {
          was: currentlyOnAir,
          should_be: shouldBeOnAir,
          schedule: activeSchedule?.title
        });
        
        newStatus = await BroadcastStatus.create({
          is_on_air: shouldBeOnAir,
          status_message: shouldBeOnAir ? 
            `Auto On-Air: ${activeSchedule.title}` : 
            'Auto Off-Air: No active schedule',
          updated_by: 'auto-system',
          schedule_id: activeSchedule?.id || null,
          updated_at: now
        });
        
        updateMade = true;
      }
      
      const response = {
        timestamp: now.toISOString(),
        wib_time: formatWIBDisplay(now),
        auto_update_made: updateMade,
        current_status: {
          is_on_air: newStatus?.is_on_air || currentlyOnAir,
          message: newStatus?.status_message || currentStatus?.status_message,
          updated_by: newStatus?.updated_by || currentStatus?.updated_by
        },
        active_schedule: activeSchedule ? {
          id: activeSchedule.id,
          title: activeSchedule.title,
          peminjam: activeSchedule.peminjam,
          start_time: activeSchedule.start_time,
          end_time: activeSchedule.end_time
        } : null,
        recommendation: {
          should_be_on_air: shouldBeOnAir,
          matches_current: shouldBeOnAir === (newStatus?.is_on_air || currentlyOnAir)
        }
      };
      
      res.json(response);
      
    } catch (error) {
      console.error('Error in auto status update:', error);
      res.status(500).json({
        error: 'Failed to auto update status',
        details: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  // Unity Integration: Simple status endpoint
  async getUnityStatus(req, res) {
    try {
      console.log('🔍 Getting Unity status...');
      
      const currentStatus = await BroadcastStatus.findOne({
        order: [['last_updated', 'DESC']]
      });
      
      console.log('📊 Current status from DB:', {
        id: currentStatus?.id,
        isOnAir: currentStatus?.isOnAir,
        statusMessage: currentStatus?.statusMessage,
        updatedBy: currentStatus?.updatedBy,
        lastUpdated: currentStatus?.lastUpdated
      });
      
      // Simple response for Unity
      const response = {
        onAir: currentStatus?.isOnAir || false,
        message: currentStatus?.statusMessage || 'Off Air',
        lastUpdate: currentStatus?.lastUpdated || new Date(),
        wibTime: formatWIBDisplay(getCurrentWIBTime())
      };
      
      console.log('📤 Unity status response:', response);
      res.json(response);
      
    } catch (error) {
      console.error('❌ Unity status error:', error);
      res.status(500).json({
        onAir: false,
        message: 'Error getting status',
        lastUpdate: new Date(),
        error: true
      });
    }
  }
  
  // Unity Integration: Simple status update with cross-sync
  async setUnityStatus(req, res) {
    try {
      const { onAir, source = 'unity' } = req.body;
      
      if (typeof onAir !== 'boolean') {
        return res.status(400).json({
          success: false,
          error: 'onAir must be boolean'
        });
      }
      
      console.log('🔄 Unity status update:', { onAir, source });
      
      // Create broadcast status record
      const newStatus = await BroadcastStatus.create({
        isOnAir: onAir,
        statusMessage: onAir ? `On Air (${source})` : `Off Air (${source})`,
        updatedBy: source,
        lastUpdated: getCurrentWIBTime()
      });
      
      console.log('✅ Unity status updated in database:', {
        id: newStatus.id,
        onAir: newStatus.isOnAir,
        source: newStatus.updatedBy
      });
      
      res.json({
        success: true,
        onAir: onAir,
        message: newStatus.statusMessage,
        source: source,
        timestamp: newStatus.lastUpdated,
        wibTime: formatWIBDisplay(getCurrentWIBTime())
      });
      
    } catch (error) {
      console.error('❌ Unity status update error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: getCurrentWIBTime()
      });
    }
  }
  
  // Helper method
  calculateMinutesUntil(targetTime, currentTime) {
    const [targetHour, targetMin] = targetTime.split(':').map(Number);
    const [currentHour, currentMin] = currentTime.split(':').map(Number);
    
    const targetMinutes = targetHour * 60 + targetMin;
    const currentMinutes = currentHour * 60 + currentMin;
    
    return Math.max(0, targetMinutes - currentMinutes);
  }
}

export default new BroadcastController();