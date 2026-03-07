// controllers/analyticsController.js
// HTTP handlers for analytics data retrieval

const { getAnalytics } = require('../services/analyticsService');

/**
 * GET /api/analytics/:shortCode
 * Get analytics for a URL — owner-only
 * Query params: ?days=30
 */
const getUrlAnalytics = async (req, res, next) => {
  try {
    const { shortCode } = req.params;
    const days = Math.min(parseInt(req.query.days) || 30, 365); // Max 1 year lookback

    const analytics = await getAnalytics(shortCode, req.user?.id, days);

    res.json({ success: true, data: analytics });
  } catch (err) {
    next(err);
  }
};

module.exports = { getUrlAnalytics };
