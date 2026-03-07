// routes/analyticsRoutes.js

const express = require('express');
const router = express.Router();
const { getUrlAnalytics } = require('../controllers/analyticsController');
const { optionalAuth } = require('../middleware/auth');

/**
 * @route   GET /api/analytics/:shortCode
 * @desc    Get analytics for a URL
 * @access  Public (returns limited data) / Private (full data for owner)
 * @query   ?days=30 (1-365)
 */
router.get('/:shortCode', optionalAuth, getUrlAnalytics);

module.exports = router;
