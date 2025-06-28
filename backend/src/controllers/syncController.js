// src/controllers/syncController.js - ENHANCED VERSION

import { Op } from 'sequelize';
import GoogleSheetEntry from '../models/GoogleSheetEntry.js';
import schedulerService from '../services/scheduler.js';

export const syncController = {
  // Trigger manual sync
  async syncNow(req, res) {
    try {
      console.log('Manual sync requested');
      console.log('Current time (WIB):', new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }));
      console.log('Current time (UTC):', new Date().toISOString());
      
      const result = await schedulerService.manualSync();
      res.json(result);
    } catch (error) {
      console.error('Error during manual sync:', error);
      
      // Check if it's a credentials error
      if (error.message.includes('Missing Google Sheets credentials')) {
        res.status(503).json({ 
          error: 'Google Sheets service unavailable',
          details: 'Google Sheets credentials not configured',
          fallback: true,
          message: 'Sync service requires Google Sheets credentials to be configured in environment variables'
        });
      } else {
        res.status(500).json({ 
          error: 'Failed to sync data',
          details: error.message 
        });
      }
    }
  },

  // Get sync status
  async getSyncStatus(req, res) {
    try {
      const status = schedulerService.getSyncStatus();
      res.json(status);
    } catch (error) {
      console.error('Error fetching sync status:', error);
      res.status(500).json({ 
        error: 'Failed to fetch sync status',
        details: error.message 
      });
    }
  },

  // Enhanced: Get all entries with pagination, filters, and unit support
  async getEntries(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10,
        startDate,
        endDate,
        search,
        unit // NEW: Unit/Prodi filter
      } = req.query;

      const offset = (page - 1) * limit;
      const where = {};

      // Add date range filter
      if (startDate || endDate) {
        where.tanggal_mulai_peminjaman = {};
        if (startDate) {
          where.tanggal_mulai_peminjaman[Op.gte] = startDate;
        }
        if (endDate) {
          where.tanggal_mulai_peminjaman[Op.lte] = endDate;
        }
      }

      // Add search filter
      if (search) {
        where[Op.or] = [
          { nama_lengkap: { [Op.like]: `%${search}%` } },
          { nip_kode_dosen_nim: { [Op.like]: `%${search}%` } },
          { keperluan_peminjaman: { [Op.like]: `%${search}%` } }
        ];
      }

      // NEW: Add unit/prodi filter
      if (unit) {
        where.unit_prodi = { [Op.like]: `%${unit}%` };
      }

      try {
        const entries = await GoogleSheetEntry.findAndCountAll({
          where,
          order: [
            ['timestamp', 'DESC']
          ],
          limit: parseInt(limit),
          offset: parseInt(offset)
        });

        console.log(`Entries query result: ${entries.count} total, ${entries.rows.length} returned`);
        if (unit) {
          console.log(`Filtered by unit: ${unit}`);
        }

        res.json({
          total: entries.count,
          pages: Math.ceil(entries.count / limit),
          currentPage: parseInt(page),
          data: entries.rows
        });
      } catch (dbError) {
        console.error('Database error in getEntries:', dbError);
        
        // Return fallback data structure
        res.json({
          total: 0,
          pages: 1,
          currentPage: 1,
          data: [],
          error: 'Database connection issue',
          fallback: true
        });
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
      res.status(500).json({ 
        error: 'Failed to fetch entries',
        details: error.message 
      });
    }
  },

  // Get today's entries
  async getTodayEntries(req, res) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      try {
        const entries = await GoogleSheetEntry.findAll({
          where: {
            tanggal_mulai_peminjaman: {
              [Op.gte]: today,
              [Op.lt]: tomorrow
            }
          },
          order: [['jam_mulai', 'ASC']]
        });

        res.json(entries);
      } catch (dbError) {
        console.error('Database error in getTodayEntries:', dbError);
        res.json([]);
      }
    } catch (error) {
      console.error('Error fetching today\'s entries:', error);
      res.status(500).json({ 
        error: 'Failed to fetch today\'s entries',
        details: error.message 
      });
    }
  },

  // Get entries by date range
  async getEntriesByDateRange(req, res) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          error: 'Missing parameters',
          message: 'Both startDate and endDate are required'
        });
      }

      try {
        const entries = await GoogleSheetEntry.findAll({
          where: {
            tanggal_mulai_peminjaman: {
              [Op.between]: [startDate, endDate]
            }
          },
          order: [
            ['tanggal_mulai_peminjaman', 'ASC'],
            ['jam_mulai', 'ASC']
          ]
        });

        res.json(entries);
      } catch (dbError) {
        console.error('Database error in getEntriesByDateRange:', dbError);
        res.json([]);
      }
    } catch (error) {
      console.error('Error fetching entries by date range:', error);
      res.status(500).json({ 
        error: 'Failed to fetch entries',
        details: error.message 
      });
    }
  },

  // NEW: Get unique units/prodi for filter dropdown
  async getUniqueUnits(req, res) {
    try {
      console.log('Getting unique units/prodi...');
      
      try {
        const units = await GoogleSheetEntry.findAll({
          attributes: ['unit_prodi'],
          where: {
            unit_prodi: {
              [Op.ne]: null,
              [Op.ne]: ''
            }
          },
          group: ['unit_prodi'],
          order: [['unit_prodi', 'ASC']]
        });

        const uniqueUnits = units.map(entry => entry.unit_prodi).filter(Boolean);
        
        console.log(`Found ${uniqueUnits.length} unique units:`, uniqueUnits);
        
        res.json({
          units: uniqueUnits,
          count: uniqueUnits.length
        });
      } catch (dbError) {
        console.error('Database error in getUniqueUnits:', dbError);
        res.json({
          units: [],
          count: 0,
          error: 'Database connection issue'
        });
      }
    } catch (error) {
      console.error('Error fetching unique units:', error);
      res.status(500).json({ 
        error: 'Failed to fetch units',
        details: error.message 
      });
    }
  },

  // NEW: Get statistics by unit/prodi
  async getUnitStats(req, res) {
    try {
      const { timeRange = '30d' } = req.query;
      
      const endDate = new Date();
      let startDate = new Date();
      
      switch (timeRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '12m':
          startDate.setMonth(endDate.getMonth() - 12);
          break;
        default:
          startDate.setDate(endDate.getDate() - 30);
      }

      try {
        const unitStats = await GoogleSheetEntry.findAll({
          attributes: [
            'unit_prodi',
            [GoogleSheetEntry.sequelize.fn('COUNT', GoogleSheetEntry.sequelize.col('id')), 'total_bookings'],
            [GoogleSheetEntry.sequelize.fn('SUM', GoogleSheetEntry.sequelize.col('jumlah_jam')), 'total_hours'],
            [GoogleSheetEntry.sequelize.fn('COUNT', GoogleSheetEntry.sequelize.fn('DISTINCT', GoogleSheetEntry.sequelize.col('nip_kode_dosen_nim'))), 'unique_users']
          ],
          where: {
            tanggal_mulai_peminjaman: {
              [Op.between]: [startDate, endDate]
            },
            unit_prodi: {
              [Op.ne]: null,
              [Op.ne]: ''
            }
          },
          group: ['unit_prodi'],
          order: [[GoogleSheetEntry.sequelize.fn('COUNT', GoogleSheetEntry.sequelize.col('id')), 'DESC']]
        });

        const formattedStats = unitStats.map(stat => ({
          unit: stat.unit_prodi,
          totalBookings: parseInt(stat.dataValues.total_bookings),
          totalHours: parseFloat(stat.dataValues.total_hours) || 0,
          uniqueUsers: parseInt(stat.dataValues.unique_users)
        }));

        console.log(`Unit statistics for ${timeRange}:`, formattedStats);

        res.json({
          timeRange,
          startDate,
          endDate,
          stats: formattedStats,
          totalUnits: formattedStats.length
        });
      } catch (dbError) {
        console.error('Database error in getUnitStats:', dbError);
        res.json({
          timeRange,
          startDate,
          endDate,
          stats: [],
          totalUnits: 0,
          error: 'Database connection issue'
        });
      }
    } catch (error) {
      console.error('Error fetching unit statistics:', error);
      res.status(500).json({ 
        error: 'Failed to fetch unit statistics',
        details: error.message 
      });
    }
  }
};

export default syncController;