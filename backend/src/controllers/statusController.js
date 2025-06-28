import BroadcastStatus from '../models/BroadcastStatus.js';
import Schedule from '../models/Schedule.js';
import { Op } from 'sequelize';

// Import broadcastManager safely
let broadcastManager = null;
try {
  const module = await import('../services/broadcastManager.js');
  broadcastManager = module.default;
} catch (error) {
  console.warn('Broadcast manager not available:', error.message);
}

export const statusController = {
  // FIXED: Get current broadcast status without problematic associations
  async getCurrentStatus(req, res) {
    try {
      console.log('getCurrentStatus called');
      
      try {
        // FIXED: Remove problematic include association
        const status = await BroadcastStatus.findOne({
          order: [['lastUpdated', 'DESC']]
          // REMOVED: include: [{ association: 'schedule', required: false }]
        });

        // Get active schedules separately to avoid association issues
        let activeSchedules = [];
        try {
          activeSchedules = await Schedule.findActive();
        } catch (scheduleError) {
          console.warn('Error fetching active schedules:', scheduleError.message);
          activeSchedules = [];
        }
        
        // Get upcoming schedules if broadcastManager is available
        let upcomingSchedules = [];
        try {
          if (broadcastManager && typeof broadcastManager.checkUpcomingSchedules === 'function') {
            upcomingSchedules = await broadcastManager.checkUpcomingSchedules();
          }
        } catch (error) {
          console.warn('Broadcast manager not available for upcoming schedules:', error.message);
        }

        if (!status) {
          // Create default status if none exists
          try {
            const defaultStatus = await BroadcastStatus.create({
              isOnAir: false,
              statusMessage: 'Off Air - System Initialized',
              updatedBy: 'system'
            });
            
            return res.json({
              ...defaultStatus.toJSON(),
              activeSchedules: activeSchedules || [],
              upcomingSchedules: upcomingSchedules || [],
              broadcastManager: broadcastManager ? broadcastManager.getStatus() : null,
              hasActiveSchedule: (activeSchedules || []).length > 0,
              hasUpcomingSchedule: (upcomingSchedules || []).length > 0
            });
          } catch (createError) {
            console.error('Error creating default status:', createError);
            return res.json({
              id: 'fallback-1',
              isOnAir: false,
              statusMessage: 'Off Air (Fallback)',
              updatedBy: 'system',
              lastUpdated: new Date(),
              activeSchedules: [],
              upcomingSchedules: [],
              message: 'Using fallback data - database connection issue'
            });
          }
        }

        res.json({
          ...status.toJSON(),
          activeSchedules: activeSchedules || [],
          upcomingSchedules: upcomingSchedules || [],
          broadcastManager: broadcastManager ? broadcastManager.getStatus() : null,
          hasActiveSchedule: (activeSchedules || []).length > 0,
          hasUpcomingSchedule: (upcomingSchedules || []).length > 0
        });
        
      } catch (dbError) {
        console.error('Database error in getCurrentStatus:', dbError);
        res.json({
          id: 'fallback-1',
          isOnAir: false,
          statusMessage: 'Off Air (Fallback)',
          updatedBy: 'system',
          lastUpdated: new Date(),
          activeSchedules: [],
          upcomingSchedules: [],
          message: 'Using fallback data - database connection issue'
        });
      }
    } catch (error) {
      console.error('Error in getCurrentStatus:', error);
      res.json({
        id: 'fallback-1',
        isOnAir: false,
        statusMessage: 'System Error - Off Air',
        updatedBy: 'system',
        lastUpdated: new Date(),
        activeSchedules: [],
        upcomingSchedules: [],
        message: 'Using fallback data - system error'
      });
    }
  },

  // FIXED: Update broadcast status dengan manual override
  async updateStatus(req, res) {
    try {
      const { isOnAir, statusMessage, updatedBy, manualOverride } = req.body;

      if (typeof isOnAir !== 'boolean') {
        return res.status(400).json({ error: 'isOnAir must be a boolean value' });
      }

      try {
        let status;
        
        if (manualOverride && broadcastManager) {
          // Manual override - use broadcast manager
          if (isOnAir) {
            status = await broadcastManager.manualSetOnAir(
              statusMessage || 'Manual override',
              updatedBy || 'admin'
            );
          } else {
            status = await broadcastManager.manualSetOffAir(
              statusMessage || 'Manual override', 
              updatedBy || 'admin'
            );
          }
        } else {
          // Regular update
          status = await BroadcastStatus.updateStatus(
            isOnAir,
            statusMessage,
            updatedBy,
            null
          );
        }

        // Get additional context
        let activeSchedules = [];
        let upcomingSchedules = [];
        
        try {
          activeSchedules = await Schedule.findActive();
        } catch (error) {
          console.warn('Error fetching active schedules:', error.message);
        }
        
        try {
          if (broadcastManager && typeof broadcastManager.checkUpcomingSchedules === 'function') {
            upcomingSchedules = await broadcastManager.checkUpcomingSchedules();
          }
        } catch (error) {
          console.warn('Error fetching upcoming schedules:', error.message);
        }

        res.json({
          ...status.toJSON(),
          activeSchedules,
          upcomingSchedules,
          broadcastManager: broadcastManager ? broadcastManager.getStatus() : null,
          manualOverride: manualOverride || false
        });
      } catch (dbError) {
        console.error('Database error in updateStatus:', dbError);
        res.json({
          id: 'fallback-1',
          isOnAir,
          statusMessage: statusMessage || (isOnAir ? 'On Air' : 'Off Air'),
          updatedBy: updatedBy || 'system',
          lastUpdated: new Date(),
          message: 'Status updated (fallback mode - changes will not persist)'
        });
      }
    } catch (error) {
      console.error('Error in updateStatus:', error);
      res.json({
        id: 'fallback-1',
        isOnAir: false,
        statusMessage: 'System Error - Status Update Failed',
        updatedBy: 'system',
        lastUpdated: new Date(),
        message: 'Using fallback data - system error'
      });
    }
  },

  // Get broadcast manager status dan history
  async getBroadcastManagerStatus(req, res) {
    try {
      if (!broadcastManager) {
        return res.json({
          status: {
            isRunning: false,
            autoModeEnabled: false,
            lastCheck: null,
            historyCount: 0,
            recentHistory: []
          },
          history: [],
          timestamp: new Date(),
          message: 'Broadcast manager not available'
        });
      }

      const status = broadcastManager.getStatus();
      const fullHistory = broadcastManager.getFullHistory();
      
      res.json({
        status,
        history: fullHistory,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error getting broadcast manager status:', error);
      res.status(500).json({
        error: 'Failed to get broadcast manager status',
        details: error.message
      });
    }
  },

  // Toggle auto mode on/off
  async toggleAutoMode(req, res) {
    try {
      if (!broadcastManager) {
        return res.json({
          autoModeEnabled: false,
          message: 'Broadcast manager not available',
          timestamp: new Date()
        });
      }

      const autoModeEnabled = broadcastManager.toggleAutoMode();
      
      res.json({
        autoModeEnabled,
        message: `Auto mode ${autoModeEnabled ? 'enabled' : 'disabled'}`,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error toggling auto mode:', error);
      res.status(500).json({
        error: 'Failed to toggle auto mode',
        details: error.message
      });
    }
  },

  // Get status history (enhanced)
  async getStatusHistory(req, res) {
    try {
      const { limit = 50 } = req.query;
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      try {
        // Get database history without problematic associations
        const dbHistory = await BroadcastStatus.findAll({
          where: {
            lastUpdated: {
              [Op.gte]: oneDayAgo
            }
          },
          order: [['lastUpdated', 'DESC']],
          limit: parseInt(limit)
          // REMOVED: include: [{ association: 'schedule', required: false }]
        });

        // Get broadcast manager history
        let managerHistory = [];
        if (broadcastManager && typeof broadcastManager.getFullHistory === 'function') {
          managerHistory = broadcastManager.getFullHistory();
        }

        // Combine and sort by timestamp
        const combinedHistory = [
          ...dbHistory.map(item => ({
            type: 'database',
            ...item.toJSON()
          })),
          ...managerHistory.map(item => ({
            type: 'manager',
            ...item
          }))
        ].sort((a, b) => {
          const timeA = new Date(a.lastUpdated || a.timestamp);
          const timeB = new Date(b.lastUpdated || b.timestamp);
          return timeB - timeA;
        }).slice(0, parseInt(limit));

        res.json({
          history: combinedHistory,
          totalEntries: combinedHistory.length,
          managerStatus: broadcastManager ? broadcastManager.getStatus() : null
        });
      } catch (dbError) {
        console.error('Database error in getStatusHistory:', dbError);
        // Return only manager history if database fails
        let managerHistory = [];
        if (broadcastManager && typeof broadcastManager.getFullHistory === 'function') {
          managerHistory = broadcastManager.getFullHistory();
        }
        
        res.json({
          history: managerHistory.map(item => ({
            type: 'manager',
            ...item
          })),
          totalEntries: managerHistory.length,
          message: 'Database unavailable - showing manager history only'
        });
      }
    } catch (error) {
      console.error('Error in getStatusHistory:', error);
      res.json({
        history: [],
        totalEntries: 0,
        message: 'Using fallback data - system error'
      });
    }
  },

  // Get upcoming schedule warnings
  async getUpcomingSchedules(req, res) {
    try {
      let upcomingSchedules = [];
      
      if (broadcastManager && typeof broadcastManager.checkUpcomingSchedules === 'function') {
        upcomingSchedules = await broadcastManager.checkUpcomingSchedules();
      }
      
      res.json({
        upcomingSchedules,
        count: upcomingSchedules.length,
        hasUpcoming: upcomingSchedules.length > 0,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error getting upcoming schedules:', error);
      res.status(500).json({
        error: 'Failed to get upcoming schedules',
        details: error.message
      });
    }
  }
};

export default statusController;