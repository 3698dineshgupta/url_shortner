// config/redis.js
// Redis client configuration with ioredis — handles caching and rate limiting

const Redis = require('ioredis');
const logger = require('../utils/logger');

let redisClient = null;

/**
 * Create Redis client with retry strategy and event listeners
 */
const createRedisClient = () => {
  const options = {
    retryStrategy(times) {
      // Exponential backoff: max 3s delay
      const delay = Math.min(times * 50, 3000);
      logger.warn(`⚠️  Redis retry attempt ${times}, delay: ${delay}ms`);
      return delay;
    },
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    enableReadyCheck: true,
    enableOfflineQueue: false,
  };

  const client = process.env.REDIS_URL
    ? new Redis(process.env.REDIS_URL, options)
    : new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      ...options,
    });

  client.on('connect', () => logger.info('✅ Redis connected'));
  client.on('ready', () => logger.info('✅ Redis ready'));
  client.on('error', (err) => logger.error('❌ Redis error:', err.message));
  client.on('close', () => logger.warn('⚠️  Redis connection closed'));
  client.on('reconnecting', () => logger.info('🔄 Redis reconnecting...'));

  return client;
};

/**
 * Connect to Redis
 */
const connectRedis = async () => {
  try {
    redisClient = createRedisClient();
    await redisClient.connect();
    logger.info('✅ Redis initialized');
  } catch (error) {
    logger.error('❌ Redis connection failed:', error.message);
    // App continues without cache (graceful degradation)
  }
};

/**
 * Get the Redis client (with null safety)
 */
const getRedisClient = () => redisClient;

module.exports = { connectRedis, getRedisClient };
