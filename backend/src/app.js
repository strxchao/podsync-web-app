import './models/index.js';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sequelize } from './config/database.js';
import { TIMEOUTS, withTimeout } from './config/timeouts.js';
import { parseGoogleSheetsTimestamp, formatForMySQL, formatWIBDisplay } from './utils/timezone.js';

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration - Enhanced for development
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

// Handle preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Additional CORS headers middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || 'http://localhost:5173');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toLocaleString()} - ${req.method} ${req.url}`);
  next();
});

// Enhanced health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await sequelize.authenticate();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      features: {
        analytics: 'available',
        broadcastManager: 'demo-mode',
        qrCodeGeneration: 'active',
        unitProdiSupport: 'active'
      },
      message: 'Server running with analytics and unit/prodi support'
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      database: 'disconnected'
    });
  }
});


// ENHANCED SAFE IMPORT FUNCTION - Added unit/prodi methods
async function safeImportController(controllerPath, fallbackResponse) {
  try {
    const controller = await import(controllerPath);
    console.log(`Successfully imported controller: ${controllerPath}`);
    return controller.default || controller;
  } catch (error) {
    console.warn(`Could not import controller ${controllerPath}: ${error.message}`);
    console.log(`Using fallback controller for ${controllerPath}`);
    
    // Return safe fallback controller that never crashes
    return {
      // Content controller methods
      getActiveContent: (req, res) => {
        console.log('Using fallback getActiveContent');
        res.json(fallbackResponse || []);
      },
      getAllContent: (req, res) => {
        console.log('Using fallback getAllContent');
        res.json(fallbackResponse || []);
      },
      createContent: (req, res) => {
        console.log('Using fallback createContent');
        res.json({ 
          id: 'temp-' + Date.now(),
          title: req.body.title || 'New Content',
          description: req.body.description || 'Content created via fallback',
          type: req.body.type || 'announcement',
          isActive: true,
          message: 'Content controller not available - using fallback'
        });
      },
      updateContent: (req, res) => {
        console.log('Using fallback updateContent');
        res.json({ message: 'Content updated via fallback', id: req.params.id });
      },
      deleteContent: (req, res) => {
        console.log('Using fallback deleteContent');
        res.json({ message: 'Content deleted via fallback', id: req.params.id });
      },
      updateDisplayOrder: (req, res) => {
        console.log('Using fallback updateDisplayOrder');
        res.json({ message: 'Display order updated via fallback' });
      },
      getContentByDateRange: (req, res) => {
        console.log('Using fallback getContentByDateRange');
        res.json([]);
      },
      getContentStats: (req, res) => {
        console.log('Using fallback getContentStats');
        res.json({ total: 0, active: 0, inactive: 0 });
      },
      regenerateQRCode: (req, res) => {
        console.log('Using fallback regenerateQRCode');
        res.json({ message: 'QR code regenerated via fallback', id: req.params.id });
      },
      
      // ENHANCED: Schedule controller methods dengan unit support
      getSchedules: (req, res) => {
        console.log('Using fallback getSchedules');
        res.json({ 
          data: [
            {
              id: 'fallback-1',
              title: 'Sample Schedule',
              date: new Date().toISOString().split('T')[0],
              start_time: '09:00:00',
              end_time: '11:00:00',
              status: 'pending',
              peminjam: 'Sample User',
              unit_prodi: 'Teknik Informatika',
              location: 'Lab Audio',
              message: 'Fallback schedule data'
            }
          ], 
          total: 1, 
          pages: 1, 
          currentPage: 1 
        });
      },
      getTodaySchedule: (req, res) => {
        console.log('Using fallback getTodaySchedule');
        res.json([
          {
            id: 'fallback-today-1',
            title: 'Today Schedule',
            date: new Date().toISOString().split('T')[0],
            start_time: '09:00:00',
            end_time: '11:00:00',
            status: 'pending',
            currentStatus: 'upcoming',
            peminjam: 'Sample User',
            unit_prodi: 'Teknik Informatika',
            message: 'Fallback today schedule'
          }
        ]);
      },
      getActiveSchedules: (req, res) => {
        console.log('Using fallback getActiveSchedules');
        res.json([]);
      },
      // NEW: Unit methods for fallback
      getUniqueUnits: (req, res) => {
        console.log('Using fallback getUniqueUnits');
        res.json({
          units: [
            'Teknik Informatika',
            'Sistem Informasi',
            'Multimedia',
            'Teknik Komputer'
          ],
          count: 4,
          message: 'Fallback units data'
        });
      },
      syncNow: (req, res) => {
        console.log('Using fallback syncNow');
        res.json({ success: true, message: 'Sync service not available' });
      },
      getSyncStatus: (req, res) => {
        console.log('Using fallback getSyncStatus');
        res.json({ 
          isRunning: false, 
          isSyncing: false, 
          lastSyncTime: null,
          message: 'Sync service not available'
        });
      },
      updateStatus: (req, res) => {
        console.log('Using fallback updateStatus');
        res.json({ message: 'Status updated via fallback', id: req.params.id });
      },
      
      // Status controller methods  
      getCurrentStatus: (req, res) => {
        console.log('Using fallback getCurrentStatus');
        res.json({ 
          isOnAir: false, 
          statusMessage: 'Off Air (Fallback)',
          updatedBy: 'system',
          lastUpdated: new Date(),
          message: 'Status controller not available'
        });
      },
      getStatusHistory: (req, res) => {
        console.log('Using fallback getStatusHistory');
        res.json([]);
      },
      getBroadcastManagerStatus: (req, res) => {
        console.log('Using fallback getBroadcastManagerStatus');
        res.json({ 
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
      },
      toggleAutoMode: (req, res) => {
        console.log('Using fallback toggleAutoMode');
        res.json({ 
          autoModeEnabled: false,
          message: 'Auto mode toggle not available',
          timestamp: new Date()
        });
      },
      getUpcomingSchedules: (req, res) => {
        console.log('Using fallback getUpcomingSchedules');
        res.json([]);
      },
      
      // ENHANCED: Sync controller methods dengan unit support
      getEntries: (req, res) => {
        console.log('Using fallback getEntries');
        res.json({ 
          data: [
            {
              id: 'fallback-entry-1',
              timestamp: new Date(),
              nama_lengkap: 'Sample User',
              nip_kode_dosen_nim: '123456789',
              unit_prodi: 'Teknik Informatika',
              keperluan_peminjaman: 'Recording Podcast',
              jenis_fasilitas_dipinjam: 'Studio Audio',
              tanggal_mulai_peminjaman: new Date().toISOString().split('T')[0],
              jam_mulai: '09:00:00',
              jam_berakhir: '11:00:00',
              message: 'Fallback entry data'
            }
          ], 
          total: 1, 
          pages: 1, 
          currentPage: 1 
        });
      },
      getTodayEntries: (req, res) => {
        console.log('Using fallback getTodayEntries');
        res.json([]);
      },
      getEntriesByDateRange: (req, res) => {
        console.log('Using fallback getEntriesByDateRange');
        res.json([]);
      },
      // NEW: Unit-specific fallback methods
      getUnitStats: (req, res) => {
        console.log('Using fallback getUnitStats');
        res.json({
          timeRange: req.query.timeRange || '30d',
          stats: [
            { unit: 'Teknik Informatika', totalBookings: 15, totalHours: 45, uniqueUsers: 8 },
            { unit: 'Sistem Informasi', totalBookings: 12, totalHours: 36, uniqueUsers: 6 },
            { unit: 'Multimedia', totalBookings: 8, totalHours: 24, uniqueUsers: 4 }
          ],
          totalUnits: 3,
          message: 'Fallback unit stats data'
        });
      },
      
      // Analytics controller methods
      getDashboardStats: (req, res) => {
        console.log('Using fallback getDashboardStats');
        res.json({
          timeRange: req.query.timeRange || '7d',
          content: { total: 5, active: 3, withMedia: 2, withQR: 2, recentlyCreated: 1 },
          schedule: { total: 8, completed: 5, ongoing: 1, pending: 2, completionRate: 62 },
          broadcast: { totalSessions: 3, totalOnTimeHours: 4.5, averageSessionHours: 1.5, currentlyOnAir: false },
          entries: { total: 15, thisWeek: 3, trend: 'increasing', weeklyGrowth: 20 },
          recentActivity: [],
          note: 'Using fallback analytics data'
        });
      },
      getSystemMetrics: (req, res) => {
        console.log('Using fallback getSystemMetrics');
        const uptime = process.uptime();
        const memory = process.memoryUsage();
        
        res.json({
          system: {
            uptime,
            uptimeFormatted: formatUptime(uptime),
            memory: {
              used: Math.round(memory.heapUsed / 1024 / 1024 * 100) / 100,
              total: Math.round(memory.heapTotal / 1024 / 1024 * 100) / 100,
              percentage: Math.round((memory.heapUsed / memory.heapTotal) * 100)
            },
            nodeVersion: process.version,
            platform: process.platform
          },
          database: {
            status: 'unknown',
            responseTime: -1,
            tables: { signageContent: 0, schedules: 0, broadcastStatuses: 0, googleSheetEntries: 0 }
          },
          note: 'Using fallback system metrics'
        });
      },
      exportAnalytics: (req, res) => {
        console.log('Using fallback exportAnalytics');
        res.json({ message: 'Export not available via fallback' });
      },
      getChartData: (req, res) => {
        console.log('Using fallback getChartData');
        res.json({ message: 'Chart data not available via fallback' });
      }
    };
  }
}

// Enhanced signage-content endpoint (this was working before)
app.get('/api/signage-content', async (req, res) => {
  try {
    console.log('GET /api/signage-content called');
    
    const fallbackContent = [
      {
        id: 1,
        title: 'Welcome to PodSync',
        description: 'Digital Signage System for Multimedia Studio',
        type: 'announcement',
        isActive: true,
        displayOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        title: 'Analytics Dashboard',
        description: 'View comprehensive system analytics',
        type: 'announcement',
        isActive: true,
        displayOrder: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const contentController = await safeImportController('./controllers/contentController.js', fallbackContent);
    await contentController.getActiveContent(req, res);
  } catch (error) {
    console.error('Error in signage-content endpoint:', error);
    res.json([
      {
        id: 'fallback-1',
        title: 'System Fallback',
        description: 'Fallback content - controller error',
        type: 'announcement',
        isActive: true,
        displayOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        error: error.message
      }
    ]);
  }
});

// ENHANCED: Register routes with safe controllers dan unit support
async function registerRoutes() {
  console.log('Starting safe route registration...');
  
  try {
    // TEST ENDPOINT FIRST
    app.get('/api/test', (req, res) => {
      console.log('Test endpoint called');
      res.json({ message: 'Test endpoint working!', timestamp: new Date() });
    });
    console.log('Test route registered');
    
    // Content routes
    const contentController = await safeImportController('./controllers/contentController.js', []);
    app.get('/api/content', contentController.getAllContent);
    app.get('/api/content/active', contentController.getActiveContent);
    app.get('/api/content/stats', contentController.getContentStats);
    app.get('/api/content/by-date', contentController.getContentByDateRange);
    app.get('/api/content/:id', contentController.getContentById);
    app.post('/api/content', contentController.createContent);
    app.put('/api/content/:id', contentController.updateContent);
    app.delete('/api/content/:id', contentController.deleteContent);
    app.patch('/api/content/display-order', contentController.updateDisplayOrder);
    app.post('/api/content/:id/regenerate-qr', contentController.regenerateQRCode);
    console.log('Content routes registered');
    
    // ENHANCED: Schedule routes dengan unit support
    const scheduleController = await safeImportController('./controllers/scheduleController.js', []);
    app.get('/api/schedule', scheduleController.getSchedules);
    app.get('/api/schedule/today', scheduleController.getTodaySchedule);
    app.get('/api/schedule/active', scheduleController.getActiveSchedules);
    app.get('/api/schedule/units', scheduleController.getUniqueUnits); // NEW
    app.post('/api/schedule/sync', scheduleController.syncNow);
    app.get('/api/schedule/sync/status', scheduleController.getSyncStatus);
    app.patch('/api/schedule/:id/status', scheduleController.updateStatus);
    console.log('Schedule routes registered');
    
    // Status routes  
    const statusController = await safeImportController('./controllers/statusController.js', {});
    app.get('/api/status', statusController.getCurrentStatus);
    app.post('/api/status', statusController.updateStatus);
    app.get('/api/status/history', statusController.getStatusHistory);
    app.get('/api/status/manager', statusController.getBroadcastManagerStatus);
    app.post('/api/status/toggle-auto', statusController.toggleAutoMode);
    app.get('/api/status/upcoming', statusController.getUpcomingSchedules);
    console.log('Status routes registered');
    
    // ENHANCED: Sync routes dengan unit support
    const syncController = await safeImportController('./controllers/syncController.js', []);
    app.post('/api/sync', syncController.syncNow);
    app.get('/api/sync/status', syncController.getSyncStatus);
    app.get('/api/sync/entries', syncController.getEntries);
    app.get('/api/sync/entries/today', syncController.getTodayEntries);
    app.get('/api/sync/entries/range', syncController.getEntriesByDateRange);
    // ENHANCED: Unit endpoints
    app.get('/api/sync/units', syncController.getUniqueUnits);
    app.get('/api/sync/units/stats', syncController.getUnitStats);
    console.log('Sync routes registered');
    
    // Analytics routes
    const analyticsController = await safeImportController('./controllers/analyticsController.js', {});
    app.get('/api/analytics/dashboard', analyticsController.getDashboardStats);
    app.get('/api/analytics/system', analyticsController.getSystemMetrics);
    app.get('/api/analytics/export', analyticsController.exportAnalytics);
    
    // Broadcast routes for Unity integration
    try {
      const broadcastRoutes = await import('./routes/broadcast.js');
      app.use('/api/broadcast', broadcastRoutes.default);
      console.log('Broadcast routes registered for Unity integration');
    } catch (error) {
      console.warn('Could not register broadcast routes:', error.message);
    }
    
    // Chart routes
    app.get('/api/analytics/charts', analyticsController.getChartData);
    app.get('/api/analytics/charts/daily', (req, res, next) => {
      req.query.chartType = 'daily';
      analyticsController.getChartData(req, res, next);
    });
    app.get('/api/analytics/charts/weekly', (req, res, next) => {
      req.query.chartType = 'weekly';
      analyticsController.getChartData(req, res, next);
    });
    app.get('/api/analytics/charts/monthly', (req, res, next) => {
      req.query.chartType = 'monthly';
      analyticsController.getChartData(req, res, next);
    });
    app.get('/api/analytics/charts/facilities', (req, res, next) => {
      req.query.chartType = 'facilities';
      analyticsController.getChartData(req, res, next);
    });
    app.get('/api/analytics/charts/units', (req, res, next) => {
      req.query.chartType = 'units';
      analyticsController.getChartData(req, res, next);
    });
    app.get('/api/analytics/charts/peak-hours', (req, res, next) => {
      req.query.chartType = 'peakHours';
      analyticsController.getChartData(req, res, next);
    });
    console.log('Analytics routes registered');
    
    console.log('All routes registered successfully with fallback support!');
    
  } catch (error) {
    console.error('Error during route registration:', error);
    // Even if there's an error, the server should continue running
  }
}

// Helper function to format uptime
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

// Error handling middleware
const notFoundHandler = (req, res, next) => {
  res.status(404).json({ 
    error: 'Not Found', 
    message: `Route ${req.method} ${req.url} not found`,
    timestamp: new Date()
  });
};

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message,
    timestamp: new Date()
  });
};

// Database connection and server start
const PORT = process.env.PORT || 3002;
let server = null;

async function startServer() {
  try {
    console.log('Starting PodSync server with safe fallback support...');
    
    // Test database connection with timeout (but don't fail if it's down)
    try {
      await withTimeout(
        sequelize.authenticate(), 
        TIMEOUTS.DATABASE_CONNECTION, 
        'Database connection timeout'
      );
      console.log('Database connection established successfully.');
    } catch (dbError) {
      console.warn('Database connection failed, but server will continue in fallback mode:', dbError.message);
    }
    
    // Register all routes with safe fallbacks
    await registerRoutes();
    
    // Start broadcast scheduler for automatic on-air/off-air control
    try {
      const broadcastScheduler = await import('./services/broadcastScheduler.js');
      broadcastScheduler.default.start();
      console.log('🤖 Broadcast scheduler started for automatic control');
    } catch (error) {
      console.warn('⚠️ Broadcast scheduler not available:', error.message);
    }
    
    // Error handling middleware - MUST BE AFTER ROUTES
    app.use(notFoundHandler);
    app.use(errorHandler);
    
    // Start the server
    server = app.listen(PORT, '0.0.0.0', () => {
      console.log('='.repeat(70));
      const hostname = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
      console.log(`PODSYNC SERVER RUNNING ON http://${hostname}:${PORT}`);
      console.log('='.repeat(70));
      console.log(`Health check: http://${hostname}:${PORT}/health`);
      console.log(`CORS enabled for all origins in development mode`);
      console.log('');
      console.log('ALL API ENDPOINTS NOW AVAILABLE:');
      console.log('- GET    /health                              - Server health check');
      console.log('- GET    /api/signage-content                 - Get signage content');
      console.log('- GET    /api/content/*                       - Content management');
      console.log('- GET    /api/schedule                        - Get schedules');
      console.log('- GET    /api/schedule/today                  - Get today\'s schedule');
      console.log('- GET    /api/schedule/active                 - Get active schedules');
      console.log('- GET    /api/schedule/units                  - Get available units (NEW)');
      console.log('- POST   /api/schedule/sync                   - Sync schedules');
      console.log('- GET    /api/status                          - Get broadcast status');
      console.log('- POST   /api/status                          - Update broadcast status');
      console.log('- GET    /api/status/manager                  - Broadcast manager status');
      console.log('- POST   /api/sync                            - Trigger data sync');
      console.log('- GET    /api/sync/status                     - Get sync status');
      console.log('- GET    /api/sync/entries                    - Get sync entries');
      console.log('- GET    /api/sync/units                      - Get unique units (NEW)');
      console.log('- GET    /api/sync/units/stats                - Get unit statistics (NEW)');
      console.log('- GET    /api/analytics/*                     - Analytics dashboard');
      console.log('');
      console.log('SAFE FALLBACK MODE:');
      console.log('All routes have safe fallbacks');
      console.log('Server will never crash from missing controllers');
      console.log('Graceful degradation for missing features');
      console.log('Analytics and content endpoints prioritized');
      console.log('Unit/Prodi support enabled');
      console.log('='.repeat(70));
      console.log(`Ready to serve frontend at http://${hostname}:5173`);
      console.log('');
      console.log('ACCESS DASHBOARD: http://localhost:5173');
      console.log('ACCESS ANALYTICS: http://localhost:5173/analytics');
      console.log('ACCESS SCHEDULE: http://localhost:5173/schedule');
      console.log('');
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use.`);
        console.log('Solutions:');
        console.log('1. Kill existing process: taskkill /F /PID <PID>');
        console.log('2. Use different port: PORT=3003 npm run dev');
        console.log('3. Find process: netstat -ano | findstr :3002');
        process.exit(1);
      } else {
        console.error('Server error:', error);
      }
    });

  } catch (error) {
    console.error('Error starting server:', error);
    console.log('');
    console.log('Troubleshooting Guide:');
    console.log('1. Check if all required files exist');
    console.log('2. Verify .env configuration');
    console.log('3. Ensure dependencies are installed: npm install');
    console.log('4. Check file permissions');
    console.log('5. Try: rm -rf node_modules && npm install');
    process.exit(1);
  }
}

// Graceful shutdown
async function shutdown() {
  console.log('\nStarting graceful shutdown...');
  
  if (server) {
    await new Promise((resolve) => {
      server.close(resolve);
    });
    console.log('Server closed.');
  }
  
  try {
    await sequelize.close();
    console.log('Database connection closed.');
  } catch (error) {
    console.warn('Error closing database:', error.message);
  }
  
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  console.error('Stack trace:', error.stack);
  shutdown().catch(() => process.exit(1));
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  shutdown().catch(() => process.exit(1));
});

// Start the server
startServer();