// services/urlService.js
// Core business logic for URL shortening and retrieval
// All database + cache interactions go through this layer

const crypto = require('crypto');
const { Url, Analytics } = require('../models');
const { getRedisClient } = require('../config/redis');
const { generateRandom, encodeId } = require('../utils/base62');
const { validateUrl, validateCustomCode, normalizeUrl } = require('../utils/urlValidator');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

const CACHE_TTL = parseInt(process.env.REDIS_CACHE_TTL) || 3600; // 1 hour
const CACHE_PREFIX = 'url:';
const SHORT_CODE_LENGTH = parseInt(process.env.SHORT_CODE_LENGTH) || 7;

/**
 * Build cache key for a short code
 */
const cacheKey = (shortCode) => `${CACHE_PREFIX}${shortCode}`;

/**
 * Shorten a URL
 * @param {string} originalUrl - The long URL to shorten
 * @param {object} options - { customCode, expiresAt, userId, title }
 * @returns {Promise<Url>}
 */
const createShortUrl = async (originalUrl, options = {}) => {
  const { customCode, expiresAt, userId, title } = options;

  // Normalize and validate
  const normalizedUrl = normalizeUrl(originalUrl);
  const validation = validateUrl(normalizedUrl);
  if (!validation.valid) {
    const error = new Error(validation.error);
    error.statusCode = 400;
    throw error;
  }

  let shortCode;
  let isCustom = false;

  if (customCode) {
    // Validate custom code
    const codeValidation = validateCustomCode(customCode);
    if (!codeValidation.valid) {
      const error = new Error(codeValidation.error);
      error.statusCode = 400;
      throw error;
    }

    // Check if custom code is already taken
    const existing = await Url.findOne({ where: { short_code: customCode } });
    if (existing) {
      const error = new Error(`Short code "${customCode}" is already in use`);
      error.statusCode = 409;
      throw error;
    }

    shortCode = customCode;
    isCustom = true;
  } else {
    // Generate unique random code with collision detection
    shortCode = await generateUniqueCode();
  }

  // Calculate expiry
  let expiresAtDate = null;
  if (expiresAt) {
    expiresAtDate = new Date(expiresAt);
    if (isNaN(expiresAtDate.getTime()) || expiresAtDate <= new Date()) {
      const error = new Error('Expiry date must be a valid future date');
      error.statusCode = 400;
      throw error;
    }
  } else if (process.env.DEFAULT_URL_EXPIRY_DAYS) {
    const days = parseInt(process.env.DEFAULT_URL_EXPIRY_DAYS);
    expiresAtDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }

  const url = await Url.create({
    original_url: normalizedUrl,
    short_code: shortCode,
    user_id: userId || null,
    is_custom: isCustom,
    expires_at: expiresAtDate,
    title: title || null,
  });

  // Cache immediately after creation
  await cacheUrl(url);

  logger.info('URL shortened', { shortCode, userId, isCustom });

  return url;
};

/**
 * Generate a unique Base62 short code with collision retry
 * Uses random generation with DB check — fast in practice given 62^7 space
 */
const generateUniqueCode = async (maxRetries = 5) => {
  for (let i = 0; i < maxRetries; i++) {
    const code = generateRandom(SHORT_CODE_LENGTH);
    const existing = await Url.findOne({
      where: { short_code: code },
      attributes: ['id'],
    });
    if (!existing) return code;
    logger.warn(`Short code collision detected: ${code}, retrying...`);
  }
  throw new Error('Failed to generate unique short code after maximum retries');
};

/**
 * Resolve a short code to original URL
 * Cache-first strategy: Redis → PostgreSQL
 * @param {string} shortCode
 * @returns {Promise<Url>}
 */
const resolveShortCode = async (shortCode) => {
  const redis = getRedisClient();

  // 1. Try Redis cache first (sub-millisecond)
  if (redis) {
    try {
      const cached = await redis.get(cacheKey(shortCode));
      if (cached) {
        logger.debug('Cache hit', { shortCode });
        return JSON.parse(cached);
      }
    } catch (err) {
      logger.error('Redis get error', { error: err.message });
    }
  }

  // 2. Fall back to database
  logger.debug('Cache miss, querying database', { shortCode });
  const url = await Url.findOne({
    where: { short_code: shortCode, is_active: true },
  });

  if (!url) {
    const error = new Error('Short URL not found');
    error.statusCode = 404;
    throw error;
  }

  // 3. Check expiry
  if (url.isExpired()) {
    const error = new Error('This short URL has expired');
    error.statusCode = 410; // HTTP 410 Gone
    throw error;
  }

  // 4. Populate cache for future requests
  await cacheUrl(url);

  return url;
};

/**
 * Cache a URL object in Redis
 */
const cacheUrl = async (url) => {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    // Calculate TTL based on expiry (don't cache past expiry date)
    let ttl = CACHE_TTL;
    if (url.expires_at) {
      const secondsUntilExpiry = Math.floor((new Date(url.expires_at) - Date.now()) / 1000);
      ttl = Math.min(ttl, secondsUntilExpiry);
    }

    if (ttl > 0) {
      await redis.setex(cacheKey(url.short_code), ttl, JSON.stringify(url));
    }
  } catch (err) {
    logger.error('Redis set error', { error: err.message });
  }
};

/**
 * Invalidate cache for a short code
 */
const invalidateCache = async (shortCode) => {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    await redis.del(cacheKey(shortCode));
    logger.debug('Cache invalidated', { shortCode });
  } catch (err) {
    logger.error('Redis del error', { error: err.message });
  }
};

/**
 * Increment click count (async, non-blocking)
 * Uses Redis atomic increment for speed, syncs to DB periodically
 */
const recordClick = async (urlId, shortCode) => {
  const redis = getRedisClient();
  const clickKey = `clicks:${shortCode}`;

  // Async fire-and-forget — don't block the redirect
  setImmediate(async () => {
    try {
      if (redis) {
        // Atomic increment in Redis
        await redis.incr(clickKey);
        // Set expiry so we don't accumulate keys forever
        await redis.expire(clickKey, 86400); // 24h
      }

      // Update DB click count (can be batched in production)
      await Url.increment('click_count', { where: { id: urlId } });
      await Url.update({ last_accessed_at: new Date() }, { where: { id: urlId } });
    } catch (err) {
      logger.error('Failed to record click', { urlId, error: err.message });
    }
  });
};

/**
 * Get all URLs for a user (paginated)
 */
const getUserUrls = async (userId, { page = 1, limit = 20, search } = {}) => {
  const offset = (page - 1) * limit;
  const where = { user_id: userId, is_active: true };

  if (search) {
    where[Op.or] = [
      { short_code: { [Op.iLike]: `%${search}%` } },
      { original_url: { [Op.iLike]: `%${search}%` } },
      { title: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const { count, rows } = await Url.findAndCountAll({
    where,
    order: [['created_at', 'DESC']],
    limit,
    offset,
    attributes: { exclude: ['password_hash'] },
  });

  return {
    urls: rows,
    pagination: {
      total: count,
      page,
      limit,
      pages: Math.ceil(count / limit),
    },
  };
};

/**
 * Delete (soft-delete) a URL
 */
const deleteUrl = async (urlId, userId) => {
  const url = await Url.findOne({ where: { id: urlId, user_id: userId } });

  if (!url) {
    const error = new Error('URL not found or you do not have permission to delete it');
    error.statusCode = 404;
    throw error;
  }

  await url.update({ is_active: false });
  await invalidateCache(url.short_code);

  logger.info('URL deleted', { urlId, userId });
  return { success: true };
};

module.exports = {
  createShortUrl,
  resolveShortCode,
  recordClick,
  getUserUrls,
  deleteUrl,
  invalidateCache,
};
