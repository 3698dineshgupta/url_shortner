// services/analyticsService.js
// Analytics recording and aggregation queries

const crypto = require('crypto');
const { Analytics, Url } = require('../models');
const { sequelize } = require('../config/database');
const { Op, fn, col, literal } = require('sequelize');
const logger = require('../utils/logger');

/**
 * Parse device type from user agent string
 */
const parseDeviceType = (userAgent = '') => {
  const ua = userAgent.toLowerCase();
  if (/bot|crawler|spider|scraper/i.test(ua)) return 'bot';
  if (/mobile|android|iphone|ipod|blackberry|windows phone/i.test(ua)) return 'mobile';
  if (/ipad|tablet/i.test(ua)) return 'tablet';
  if (ua) return 'desktop';
  return 'unknown';
};

/**
 * Parse browser name from user agent
 */
const parseBrowser = (userAgent = '') => {
  if (/edg\//i.test(userAgent)) return 'Edge';
  if (/chrome|crios/i.test(userAgent)) return 'Chrome';
  if (/firefox|fxios/i.test(userAgent)) return 'Firefox';
  if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) return 'Safari';
  if (/opera|opr/i.test(userAgent)) return 'Opera';
  if (/msie|trident/i.test(userAgent)) return 'Internet Explorer';
  return 'Other';
};

/**
 * Parse OS from user agent
 */
const parseOS = (userAgent = '') => {
  if (/windows/i.test(userAgent)) return 'Windows';
  if (/mac os x/i.test(userAgent)) return 'macOS';
  if (/android/i.test(userAgent)) return 'Android';
  if (/ios|iphone|ipad/i.test(userAgent)) return 'iOS';
  if (/linux/i.test(userAgent)) return 'Linux';
  return 'Other';
};

/**
 * Hash IP address for privacy-safe unique visitor counting
 */
const hashIp = (ip) => {
  return crypto.createHash('sha256').update(ip + process.env.JWT_SECRET).digest('hex').slice(0, 16);
};

/**
 * Record a click event asynchronously
 */
const recordClickEvent = async (urlId, shortCode, req) => {
  // Fire and forget — don't block the redirect
  setImmediate(async () => {
    try {
      const ip = req.ip || req.connection?.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || '';
      const referer = req.headers['referer'] || req.headers['referrer'] || null;

      await Analytics.create({
        url_id: urlId,
        short_code: shortCode,
        ip_address: ip === 'unknown' ? null : ip,
        ip_hash: ip !== 'unknown' ? hashIp(ip) : null,
        user_agent: userAgent,
        referer: referer,
        device_type: parseDeviceType(userAgent),
        browser: parseBrowser(userAgent),
        os: parseOS(userAgent),
        clicked_at: new Date(),
      });
    } catch (err) {
      logger.error('Failed to record analytics event', { urlId, error: err.message });
    }
  });
};

/**
 * Get comprehensive analytics for a short code
 */
const getAnalytics = async (shortCode, userId, days = 30) => {
  // Find the URL and verify ownership
  const url = await Url.findOne({
    where: { short_code: shortCode },
    attributes: ['id', 'user_id', 'original_url', 'short_code', 'click_count', 'created_at', 'expires_at', 'is_active'],
  });

  if (!url) {
    const error = new Error('URL not found');
    error.statusCode = 404;
    throw error;
  }

  // Only owner can see analytics (or admin)
  if (userId && url.user_id && url.user_id !== userId) {
    const error = new Error('You do not have permission to view these analytics');
    error.statusCode = 403;
    throw error;
  }

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const whereClause = {
    url_id: url.id,
    clicked_at: { [Op.gte]: since },
  };

  // Run all aggregation queries in parallel
  const [
    totalClicks,
    clicksByDay,
    clicksByDevice,
    clicksByBrowser,
    clicksByOS,
    topReferers,
    recentClicks,
  ] = await Promise.all([
    // Total clicks in period
    Analytics.count({ where: whereClause }),

    // Clicks per day (time series)
    Analytics.findAll({
      where: whereClause,
      attributes: [
        [fn('DATE', col('clicked_at')), 'date'],
        [fn('COUNT', col('id')), 'clicks'],
      ],
      group: [fn('DATE', col('clicked_at'))],
      order: [[fn('DATE', col('clicked_at')), 'ASC']],
      raw: true,
    }),

    // Device breakdown
    Analytics.findAll({
      where: whereClause,
      attributes: ['device_type', [fn('COUNT', col('id')), 'count']],
      group: ['device_type'],
      order: [[fn('COUNT', col('id')), 'DESC']],
      raw: true,
    }),

    // Browser breakdown
    Analytics.findAll({
      where: whereClause,
      attributes: ['browser', [fn('COUNT', col('id')), 'count']],
      group: ['browser'],
      order: [[fn('COUNT', col('id')), 'DESC']],
      limit: 10,
      raw: true,
    }),

    // OS breakdown
    Analytics.findAll({
      where: whereClause,
      attributes: ['os', [fn('COUNT', col('id')), 'count']],
      group: ['os'],
      order: [[fn('COUNT', col('id')), 'DESC']],
      raw: true,
    }),

    // Top referers
    Analytics.findAll({
      where: { ...whereClause, referer: { [Op.ne]: null } },
      attributes: ['referer', [fn('COUNT', col('id')), 'count']],
      group: ['referer'],
      order: [[fn('COUNT', col('id')), 'DESC']],
      limit: 10,
      raw: true,
    }),

    // Most recent 10 clicks
    Analytics.findAll({
      where: { url_id: url.id },
      order: [['clicked_at', 'DESC']],
      limit: 10,
      attributes: ['clicked_at', 'device_type', 'browser', 'os', 'referer', 'country'],
    }),
  ]);

  return {
    url: {
      short_code: url.short_code,
      original_url: url.original_url,
      created_at: url.created_at,
      expires_at: url.expires_at,
      is_active: url.is_active,
      total_clicks: url.click_count,
    },
    period: { days, since },
    summary: {
      clicks_in_period: totalClicks,
    },
    time_series: clicksByDay,
    breakdown: {
      devices: clicksByDevice,
      browsers: clicksByBrowser,
      operating_systems: clicksByOS,
    },
    top_referers: topReferers,
    recent_clicks: recentClicks,
  };
};

module.exports = { recordClickEvent, getAnalytics };
