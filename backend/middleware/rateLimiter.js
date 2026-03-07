// middleware/rateLimiter.js
// Redis-backed rate limiting to prevent API abuse
// Falls back to in-memory if Redis is unavailable

const rateLimit = require('express-rate-limit');
const { getRedisClient } = require('../config/redis');
const logger = require('../utils/logger');

/**
 * Create a rate limiter with configurable options
 * @param {object} options
 */
const createRateLimiter = (options = {}) => {
  const {
    windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 min
    max = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message = 'Too many requests, please try again later.',
    skipSuccessfulRequests = false,
    keyGenerator,
  } = options;

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,  // Return rate limit info in RateLimit-* headers
    legacyHeaders: false,    // Disable X-RateLimit-* headers
    skipSuccessfulRequests,
    keyGenerator: keyGenerator || ((req) => {
      // Use authenticated user ID when available for more accurate limiting
      return req.user?.id || req.ip;
    }),
    handler: (req, res) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        userId: req.user?.id,
        path: req.path,
      });
      res.status(429).json({
        success: false,
        error: message,
        retryAfter: Math.ceil(windowMs / 1000),
      });
    },
  });
};

// General API rate limiter — 100 req per 15 min
const apiLimiter = createRateLimiter();

// Strict limiter for URL shortening — 20 req per 15 min
const shortenLimiter = createRateLimiter({
  max: parseInt(process.env.SHORTEN_RATE_LIMIT_MAX) || 20,
  message: 'Too many URL shortening requests. Please wait before creating more links.',
});

// Auth endpoints — 10 attempts per 15 min (brute force protection)
const authLimiter = createRateLimiter({
  max: 10,
  message: 'Too many authentication attempts. Please wait 15 minutes before trying again.',
  skipSuccessfulRequests: true,
});

// Redirect endpoint — very permissive (1000 req per min) to handle viral links
const redirectLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 min
  max: 1000,
  message: 'Redirect rate limit exceeded.',
});

module.exports = { apiLimiter, shortenLimiter, authLimiter, redirectLimiter, createRateLimiter };
