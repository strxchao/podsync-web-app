import { Op } from 'sequelize';
import Schedule from '../models/Schedule.js';
import GoogleSheetEntry from '../models/GoogleSheetEntry.js';
import schedulerService from '../services/scheduler.js';

export const scheduleController = {
  // ENHANCED: Get all schedules with pagination, filters, and unit/prodi support
  async getSchedules(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        status, 
        startDate, 
        endDate,
        unit, // NEW: Unit/Prodi filter
        search // NEW: Search filter
      } = req.query;

      const offset = (page - 1) * limit;
      const where = {};
      const include = [{
        model: GoogleSheetEntry,
        as: 'googleSheetEntry', // We'll need to define this association
        required: false, // LEFT JOIN
        attributes: [
          'nama_lengkap',
          'nip_kode_dosen_nim', 
          'unit_prodi',
          'no_telepon_mobile',
          'keperluan_peminjaman'
        ]
      }];

      // Add status filter if provided
      if (status) {
        where.status = status;
      }

      // Add date range filter if provided
      if (startDate || endDate) {
        where.date = {};
        if (startDate) {
          where.date[Op.gte] = startDate;
        }
        if (endDate) {
          where.date[Op.lte] = endDate;
        }
      }

      // NEW: Add unit/prodi filter via GoogleSheetEntry
      if (unit) {
        include[0].where = {
          unit_prodi: { [Op.like]: `%${unit}%` }
        };
        include[0].required = true; // INNER JOIN when filtering by unit
      }

      // NEW: Add search filter
      if (search) {
        where[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } },
          { organizer: { [Op.like]: `%${search}%` } },
          { location: { [Op.like]: `%${search}%` } }
        ];
      }

      try {
        const schedules = await Schedule.findAndCountAll({
          where,
          include,
          order: [
            ['date', 'ASC'],
            ['start_time', 'ASC']
          ],
          limit: parseInt(limit),
          offset: parseInt(offset),
          distinct: true // Important when using include
        });

        // ENHANCED: Add unit/prodi info to each schedule
        const enrichedSchedules = schedules.rows.map(schedule => {
          const scheduleData = schedule.toJSON();
          
          // Extract unit/prodi from GoogleSheetEntry
          const unitProdi = scheduleData.googleSheetEntry?.unit_prodi || 'N/A';
          const peminjam = scheduleData.googleSheetEntry?.nama_lengkap || scheduleData.organizer;
          const nip = scheduleData.googleSheetEntry?.nip_kode_dosen_nim || 'N/A';
          
          return {
            ...scheduleData,
            unit_prodi: unitProdi,
            peminjam: peminjam,
            nip_kode_dosen_nim: nip,
            // Keep original organizer as fallback
            organizer: peminjam || scheduleData.organizer
          };
        });

        console.log(`Found ${schedules.count} schedules, ${enrichedSchedules.length} returned`);
        if (unit) {
          console.log(`Filtered by unit: ${unit}`);
        }

        res.json({
          total: schedules.count,
          pages: Math.ceil(schedules.count / limit),
          currentPage: parseInt(page),
          data: enrichedSchedules
        });
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Return fallback data if database query fails
        res.json({
          total: 0,
          pages: 1,
          currentPage: 1,
          data: [],
          message: 'Using fallback data - database connection issue'
        });
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
      res.status(500).json({ 
        error: 'Failed to fetch schedules',
        details: error.message 
      });
    }
  },

  // ENHANCED: Get today's schedule with unit/prodi info
  async getTodaySchedule(req, res) {
    try {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const currentTime = today.toTimeString().split(' ')[0];

      try {
        const schedules = await Schedule.findAll({
          where: {
            date: todayStr
          },
          include: [{
            model: GoogleSheetEntry,
            as: 'googleSheetEntry',
            required: false,
            attributes: [
              'nama_lengkap',
              'nip_kode_dosen_nim',
              'unit_prodi',
              'no_telepon_mobile',
              'keperluan_peminjaman'
            ]
          }],
          order: [['start_time', 'ASC']]
        });

        // Add current status and unit/prodi info to each schedule
        const schedulesWithStatus = schedules.map(schedule => {
          const scheduleData = schedule.toJSON();
          
          // Convert time strings to comparable format (HH:MM:SS)
          const startTime = schedule.start_time;
          const endTime = schedule.end_time;
          
          const isActive = startTime <= currentTime && currentTime <= endTime;
          const isPast = endTime < currentTime;
          
          // Extract unit/prodi info
          const unitProdi = scheduleData.googleSheetEntry?.unit_prodi || 'N/A';
          const peminjam = scheduleData.googleSheetEntry?.nama_lengkap || scheduleData.organizer;
          
          return {
            ...scheduleData,
            currentStatus: isActive ? 'active' : (isPast ? 'completed' : 'upcoming'),
            unit_prodi: unitProdi,
            peminjam: peminjam,
            nip_kode_dosen_nim: scheduleData.googleSheetEntry?.nip_kode_dosen_nim || 'N/A'
          };
        });

        res.json(schedulesWithStatus);
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Return fallback data if database query fails
        res.json([{
          id: 'fallback-1',
          date: todayStr,
          start_time: '09:00',
          end_time: '17:00',
          title: 'No schedules available',
          status: 'pending',
          currentStatus: 'upcoming',
          unit_prodi: 'N/A',
          peminjam: 'N/A',
          message: 'Using fallback data - database connection issue'
        }]);
      }
    } catch (error) {
      console.error('Error fetching today\'s schedule:', error);
      res.status(500).json({ 
        error: 'Failed to fetch today\'s schedule',
        details: error.message 
      });
    }
  },

  // ENHANCED: Get currently active schedules with unit/prodi
  async getActiveSchedules(req, res) {
    try {
      try {
        const activeSchedules = await Schedule.findActive();
        
        // Fetch unit/prodi info for active schedules
        const schedulesWithUnit = await Promise.all(
          activeSchedules.map(async (schedule) => {
            if (schedule.google_sheet_entry_id) {
              const entry = await GoogleSheetEntry.findByPk(schedule.google_sheet_entry_id);
              return {
                ...schedule.toJSON(),
                unit_prodi: entry?.unit_prodi || 'N/A',
                peminjam: entry?.nama_lengkap || schedule.organizer,
                nip_kode_dosen_nim: entry?.nip_kode_dosen_nim || 'N/A'
              };
            }
            return {
              ...schedule.toJSON(),
              unit_prodi: 'N/A',
              peminjam: schedule.organizer,
              nip_kode_dosen_nim: 'N/A'
            };
          })
        );
        
        res.json(schedulesWithUnit);
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Return fallback data if database query fails
        res.json([{
          id: 'fallback-1',
          date: new Date().toISOString().split('T')[0],
          start_time: '09:00',
          end_time: '17:00',
          title: 'No active schedules',
          status: 'pending',
          unit_prodi: 'N/A',
          peminjam: 'N/A',
          message: 'Using fallback data - database connection issue'
        }]);
      }
    } catch (error) {
      console.error('Error fetching active schedules:', error);
      res.status(500).json({ 
        error: 'Failed to fetch active schedules',
        details: error.message 
      });
    }
  },

  // NEW: Get unique units for filter dropdown
  async getUniqueUnits(req, res) {
    try {
      console.log('Getting unique units for schedule filter...');
      
      try {
        // Get units from GoogleSheetEntry that have associated schedules
        const units = await GoogleSheetEntry.findAll({
          attributes: ['unit_prodi'],
          include: [{
            model: Schedule,
            required: true, // Only units that have schedules
            attributes: []
          }],
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
        
        console.log(`Found ${uniqueUnits.length} unique units with schedules:`, uniqueUnits);
        
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

  // Force sync with Google Sheets
  async syncNow(req, res) {
    try {
      console.log('Manual sync requested');
      const result = await schedulerService.manualSync();
      res.json(result);
    } catch (error) {
      console.error('Error during manual sync:', error);
      res.status(500).json({ 
        error: 'Failed to sync schedules',
        details: error.message 
      });
    }
  },

  // Get sync status
  async getSyncStatus(req, res) {
    try {
      const lastSync = await Schedule.findOne({
        order: [['last_synced_at', 'DESC']],
        attributes: ['last_synced_at']
      });

      res.json({
        lastSyncedAt: lastSync ? lastSync.last_synced_at : null,
        isSyncing: schedulerService.isSyncing,
        syncInterval: schedulerService.syncInterval
      });
    } catch (error) {
      console.error('Error fetching sync status:', error);
      res.status(500).json({ 
        error: 'Failed to fetch sync status',
        details: error.message 
      });
    }
  },

  // Update schedule status
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['pending', 'ongoing', 'completed'].includes(status)) {
        return res.status(400).json({ 
          error: 'Invalid status value',
          validValues: ['pending', 'ongoing', 'completed']
        });
      }

      const schedule = await Schedule.findByPk(id);
      
      if (!schedule) {
        return res.status(404).json({ error: 'Schedule not found' });
      }

      await schedule.update({ status });
      res.json(schedule);
    } catch (error) {
      console.error('Error updating schedule status:', error);
      res.status(500).json({ 
        error: 'Failed to update schedule status',
        details: error.message 
      });
    }
  }
};

export default scheduleController;