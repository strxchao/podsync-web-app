import express from 'express';
import statusController from '../controllers/statusController.js';

const router = express.Router();

// GET /api/status - Get current broadcast status dengan enhanced info
router.get('/', statusController.getCurrentStatus);

// POST /api/status - Update broadcast status dengan manual override support
router.post('/', statusController.updateStatus);

// GET /api/status/history - Get status history dengan broadcast manager history
router.get('/history', statusController.getStatusHistory);

// NEW ROUTES untuk Broadcast Manager:

// GET /api/status/manager - Get broadcast manager status dan history
router.get('/manager', statusController.getBroadcastManagerStatus);

// POST /api/status/toggle-auto - Toggle auto mode on/off
router.post('/toggle-auto', statusController.toggleAutoMode);

// GET /api/status/upcoming - Get upcoming schedule warnings
router.get('/upcoming', statusController.getUpcomingSchedules);

export default router;