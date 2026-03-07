// routes/urlRoutes.js
// URL management routes

const express = require('express');
const router = express.Router();
const { shortenUrl, getUserUrls, getUrlDetails, deleteUrl } = require('../controllers/urlController');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { shortenLimiter } = require('../middleware/rateLimiter');

/**
 * @route   POST /api/shorten
 * @desc    Shorten a URL (works for guests and authenticated users)
 * @access  Public (optionally authenticated for custom codes)
 */
router.post('/shorten', shortenLimiter, optionalAuth, shortenUrl);

/**
 * @route   GET /api/urls
 * @desc    Get all URLs for the authenticated user
 * @access  Private
 */
router.get('/urls', requireAuth, getUserUrls);

/**
 * @route   GET /api/url/:shortCode
 * @desc    Get details for a specific short URL
 * @access  Public
 */
router.get('/url/:shortCode', getUrlDetails);

/**
 * @route   DELETE /api/url/:id
 * @desc    Delete a URL (soft delete)
 * @access  Private
 */
router.delete('/url/:id', requireAuth, deleteUrl);

module.exports = router;
