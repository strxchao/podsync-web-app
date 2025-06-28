import express from 'express';
import scheduleController from '../controllers/scheduleController.js';

const router = express.Router();

/**
 * @route GET /api/schedule
 * @desc Get all schedules with pagination and filters
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 10)
 * @query {string} status - Filter by status (optional)
 * @query {string} startDate - Filter by start date (YYYY-MM-DD)
 * @query {string} endDate - Filter by end date (YYYY-MM-DD)
 * @query {string} unit - Filter by unit/prodi (optional) - NEW
 * @query {string} search - Search in title, description, organizer (optional) - NEW
 */
router.get('/', scheduleController.getSchedules);

/**
 * @route GET /api/schedule/today
 * @desc Get today's schedule with current status and unit/prodi info
 */
router.get('/today', scheduleController.getTodaySchedule);

/**
 * @route GET /api/schedule/active
 * @desc Get currently active schedules with unit/prodi info
 */
router.get('/active', scheduleController.getActiveSchedules);

/**
 * @route GET /api/schedule/units
 * @desc Get unique units/prodi for filter dropdown - NEW
 */
router.get('/units', scheduleController.getUniqueUnits);

/**
 * @route POST /api/schedule/sync
 * @desc Force sync with Google Sheets
 */
router.post('/sync', scheduleController.syncNow);

/**
 * @route GET /api/schedule/sync/status
 * @desc Get sync status and information
 */
router.get('/sync/status', scheduleController.getSyncStatus);

/**
 * @route PATCH /api/schedule/:id/status
 * @desc Update schedule status
 * @param {string} id - Schedule ID
 * @body {string} status - New status (pending/ongoing/completed)
 */
router.patch('/:id/status', scheduleController.updateStatus);

export default router;