import express from 'express';
import {
  getActiveContent,
  getAllContent,
  getContentById,
  createContent,
  updateContent,
  deleteContent,
  updateDisplayOrder,
  getContentByDateRange,
  getContentStats,
  regenerateQRCode
} from '../controllers/contentController.js';

const router = express.Router();

/**
 * @route GET /api/content/active
 * @desc Get all active content for signage display
 * @access Public
 */
router.get('/active', getActiveContent);

/**
 * @route GET /api/content/stats
 * @desc Get content statistics (total, active, by type)
 * @access Public
 */
router.get('/stats', getContentStats);

/**
 * @route GET /api/content/by-date
 * @desc Get content by creation date range
 * @query {string} startDate - Start date (YYYY-MM-DD)
 * @query {string} endDate - End date (YYYY-MM-DD)
 * @access Public
 */
router.get('/by-date', getContentByDateRange);

/**
 * @route GET /api/content
 * @desc Get all content (including inactive)
 * @access Public
 */
router.get('/', getAllContent);

/**
 * @route GET /api/content/:id
 * @desc Get content by ID
 * @param {string} id - Content ID
 * @access Public
 */
router.get('/:id', getContentById);

/**
 * @route POST /api/content
 * @desc Create new content (QR code auto-generated if mediaUrl provided)
 * @body {string} title - Content title
 * @body {string} description - Content description
 * @body {string} type - Content type (announcement/promotion/schedule/other)
 * @body {string} mediaUrl - Media URL (optional, will generate QR code)
 * @body {number} displayOrder - Display order (optional)
 * @body {string} startDate - Start date (optional)
 * @body {string} endDate - End date (optional)
 * @access Public
 */
router.post('/', createContent);

/**
 * @route PUT /api/content/:id
 * @desc Update content by ID (QR code regenerated if mediaUrl changes)
 * @param {string} id - Content ID
 * @body {string} title - Content title (optional)
 * @body {string} description - Content description (optional)
 * @body {string} type - Content type (optional)
 * @body {string} mediaUrl - Media URL (optional, will regenerate QR code)
 * @body {number} displayOrder - Display order (optional)
 * @body {boolean} isActive - Active status (optional)
 * @access Public
 */
router.put('/:id', updateContent);

/**
 * @route DELETE /api/content/:id
 * @desc Delete content by ID
 * @param {string} id - Content ID
 * @access Public
 */
router.delete('/:id', deleteContent);

/**
 * @route PATCH /api/content/display-order
 * @desc Update display order for multiple content items
 * @body {Array} orders - Array of {id, displayOrder} objects
 * @access Public
 */
router.patch('/display-order', updateDisplayOrder);

/**
 * @route POST /api/content/:id/regenerate-qr
 * @desc Regenerate QR code for specific content
 * @param {string} id - Content ID
 * @access Public
 */
router.post('/:id/regenerate-qr', regenerateQRCode);

export default router;