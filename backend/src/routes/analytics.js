import express from 'express';
import analyticsController from '../controllers/analyticsController.js';

const router = express.Router();

/**
 * @route GET /api/analytics/dashboard
 * @desc Get comprehensive dashboard analytics with chart data
 * @query {string} timeRange - Time range (24h, 7d, 30d)
 * @access Public
 */
router.get('/dashboard', analyticsController.getDashboardStats);

/**
 * @route GET /api/analytics/charts
 * @desc Get chart data for podcast usage analytics
 * @query {string} timeRange - Time range (7d, 30d, 12m)
 * @query {string} chartType - Chart type (daily, weekly, monthly, facilities, units, peakHours, all)
 * @access Public
 */
router.get('/charts', analyticsController.getChartData);

/**
 * @route GET /api/analytics/charts/daily
 * @desc Get daily usage chart data
 * @query {string} timeRange - Time range (7d, 30d)
 * @access Public
 */
router.get('/charts/daily', (req, res, next) => {
  req.query.chartType = 'daily';
  analyticsController.getChartData(req, res, next);
});

/**
 * @route GET /api/analytics/charts/weekly  
 * @desc Get weekly usage chart data
 * @query {string} timeRange - Time range (30d, 12m)
 * @access Public
 */
router.get('/charts/weekly', (req, res, next) => {
  req.query.chartType = 'weekly';
  analyticsController.getChartData(req, res, next);
});

/**
 * @route GET /api/analytics/charts/monthly
 * @desc Get monthly usage chart data
 * @query {string} timeRange - Time range (12m)
 * @access Public
 */
router.get('/charts/monthly', (req, res, next) => {
  req.query.chartType = 'monthly';
  analyticsController.getChartData(req, res, next);
});

/**
 * @route GET /api/analytics/charts/facilities
 * @desc Get facility usage breakdown chart data
 * @query {string} timeRange - Time range (7d, 30d, 12m)
 * @access Public
 */
router.get('/charts/facilities', (req, res, next) => {
  req.query.chartType = 'facilities';
  analyticsController.getChartData(req, res, next);
});

/**
 * @route GET /api/analytics/charts/units
 * @desc Get unit/prodi usage breakdown chart data
 * @query {string} timeRange - Time range (7d, 30d, 12m)
 * @access Public
 */
router.get('/charts/units', (req, res, next) => {
  req.query.chartType = 'units';
  analyticsController.getChartData(req, res, next);
});

/**
 * @route GET /api/analytics/charts/peak-hours
 * @desc Get peak hours usage chart data
 * @query {string} timeRange - Time range (7d, 30d, 12m)
 * @access Public
 */
router.get('/charts/peak-hours', (req, res, next) => {
  req.query.chartType = 'peakHours';
  analyticsController.getChartData(req, res, next);
});

/**
 * @route GET /api/analytics/system
 * @desc Get system performance metrics
 * @access Public
 */
router.get('/system', analyticsController.getSystemMetrics);

/**
 * @route GET /api/analytics/export
 * @desc Export analytics data
 * @query {string} format - Export format (json, csv)
 * @query {string} timeRange - Time range (24h, 7d, 30d)
 * @access Public
 */
router.get('/export', analyticsController.exportAnalytics);

export default router;