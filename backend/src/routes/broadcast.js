// Broadcast Routes for Unity Integration
import express from 'express';
import broadcastController from '../controllers/broadcastController.js';
import broadcastScheduler from '../services/broadcastScheduler.js';

const router = express.Router();

// Standard API endpoints
router.get('/status', broadcastController.getCurrentStatus);
router.post('/status', broadcastController.updateStatus);
router.get('/schedule', broadcastController.getScheduleStatus);
router.post('/auto-update', broadcastController.autoUpdateStatus);

// Scheduler management endpoints
router.get('/scheduler/status', (req, res) => {
  res.json(broadcastScheduler.getStatus());
});

router.post('/scheduler/start', (req, res) => {
  broadcastScheduler.start();
  res.json({ 
    success: true, 
    message: 'Broadcast scheduler started',
    status: broadcastScheduler.getStatus()
  });
});

router.post('/scheduler/stop', (req, res) => {
  broadcastScheduler.stop();
  res.json({ 
    success: true, 
    message: 'Broadcast scheduler stopped',
    status: broadcastScheduler.getStatus()
  });
});

router.post('/scheduler/force-check', async (req, res) => {
  try {
    const status = await broadcastScheduler.forceCheck();
    res.json({ 
      success: true, 
      message: 'Force check completed',
      status 
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Unity-specific simplified endpoints
router.get('/unity/status', broadcastController.getUnityStatus);
router.post('/unity/status', broadcastController.setUnityStatus);

export default router;