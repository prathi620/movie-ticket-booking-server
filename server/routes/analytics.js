const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    getBookingStats,
    getRevenueAnalytics,
    getTheaterOccupancy,
    getUserActivityMetrics,
    getBookingTrends
} = require('../controllers/analyticsController');

// All analytics routes require admin access
router.use(protect);
router.use(admin);

// @route   GET /api/analytics/stats
// @desc    Get booking statistics
// @access  Admin
router.get('/stats', getBookingStats);

// @route   GET /api/analytics/revenue
// @desc    Get revenue analytics
// @access  Admin
router.get('/revenue', getRevenueAnalytics);

// @route   GET /api/analytics/occupancy
// @desc    Get theater occupancy metrics
// @access  Admin
router.get('/occupancy', getTheaterOccupancy);

// @route   GET /api/analytics/users
// @desc    Get user activity metrics
// @access  Admin
router.get('/users', getUserActivityMetrics);

// @route   GET /api/analytics/trends
// @desc    Get booking trends
// @access  Admin
router.get('/trends', getBookingTrends);

module.exports = router;
