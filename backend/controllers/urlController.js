// controllers/urlController.js
// HTTP handlers for URL shortening operations

const urlService = require('../services/urlService');
const { recordClickEvent } = require('../services/analyticsService');
const logger = require('../utils/logger');

/**
 * POST /api/shorten
 * Shorten a long URL
 */
const shortenUrl = async (req, res, next) => {
  try {
    const { url, customCode, expiresAt, title } = req.body;

    if (!url) {
      return res.status(400).json({ success: false, error: 'URL is required' });
    }

    const shortened = await urlService.createShortUrl(url, {
      customCode,
      expiresAt,
      userId: req.user?.id,
      title,
    });

    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;

    res.status(201).json({
      success: true,
      data: {
        id: shortened.id,
        original_url: shortened.original_url,
        short_code: shortened.short_code,
        short_url: `${baseUrl}/${shortened.short_code}`,
        title: shortened.title,
        expires_at: shortened.expires_at,
        created_at: shortened.created_at,
        click_count: 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /:shortCode
 * Redirect to the original URL
 */
const redirectUrl = async (req, res, next) => {
  try {
    const { shortCode } = req.params;
    const url = await urlService.resolveShortCode(shortCode);

    // Fire analytics recording asynchronously (non-blocking)
    recordClickEvent(url.id, shortCode, req);
    urlService.recordClick(url.id, shortCode);

    // 301 = permanent redirect (cached by browsers)
    // 302 = temporary redirect (not cached — better for analytics accuracy)
    res.redirect(302, url.original_url);
  } catch (err) {
    // Render a friendly 404/410 page rather than JSON for browser requests
    if (err.statusCode === 404 || err.statusCode === 410) {
      return res.status(err.statusCode).json({
        success: false,
        error: err.message,
        statusCode: err.statusCode,
      });
    }
    next(err);
  }
};

/**
 * GET /api/urls
 * Get all URLs for the authenticated user (paginated)
 */
const getUserUrls = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const result = await urlService.getUserUrls(req.user.id, {
      page: parseInt(page),
      limit: Math.min(parseInt(limit), 100), // Max 100 per page
      search,
    });

    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/url/:shortCode
 * Get details for a specific URL
 */
const getUrlDetails = async (req, res, next) => {
  try {
    const { shortCode } = req.params;
    const url = await urlService.resolveShortCode(shortCode);

    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;

    res.json({
      success: true,
      data: {
        ...url.toJSON ? url.toJSON() : url,
        short_url: `${baseUrl}/${url.short_code}`,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/url/:id
 * Delete (soft-delete) a URL
 */
const deleteUrl = async (req, res, next) => {
  try {
    const result = await urlService.deleteUrl(req.params.id, req.user.id);
    res.json({ success: true, message: 'URL deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { shortenUrl, redirectUrl, getUserUrls, getUrlDetails, deleteUrl };
