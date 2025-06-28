// src/routes/sync.js - ENHANCED VERSION

import express from 'express';
import syncController from '../controllers/syncController.js';

const router = express.Router();

/**
 * @route POST /api/sync
 * @desc Trigger manual synchronization with Google Sheets
 * @access Public
 */
router.post('/', syncController.syncNow);

/**
 * @route GET /api/sync/status
 * @desc Get synchronization status and information
 * @access Public
 */
router.get('/status', syncController.getSyncStatus);

/**
 * @route GET /api/sync/entries
 * @desc Get all entries with pagination, filters, and unit support
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 10)
 * @query {string} startDate - Filter by start date (YYYY-MM-DD)
 * @query {string} endDate - Filter by end date (YYYY-MM-DD)
 * @query {string} search - Search in nama_lengkap, nip_kode_dosen_nim, and keperluan_peminjaman
 * @query {string} unit - Filter by unit/prodi (NEW)
 * @access Public
 */
router.get('/entries', syncController.getEntries);

/**
 * @route GET /api/sync/entries/today
 * @desc Get today's entries
 * @access Public
 */
router.get('/entries/today', syncController.getTodayEntries);

/**
 * @route GET /api/sync/entries/range
 * @desc Get entries by date range
 * @query {string} startDate - Start date (YYYY-MM-DD)
 * @query {string} endDate - End date (YYYY-MM-DD)
 * @access Public
 */
router.get('/entries/range', syncController.getEntriesByDateRange);

/**
 * @route GET /api/sync/units
 * @desc Get unique units/prodi for filter dropdown (NEW)
 * @access Public
 */
router.get('/units', syncController.getUniqueUnits);

/**
 * @route GET /api/sync/units/stats
 * @desc Get statistics by unit/prodi (NEW)
 * @query {string} timeRange - Time range (7d, 30d, 12m)
 * @access Public
 */
router.get('/units/stats', syncController.getUnitStats);

export default router;