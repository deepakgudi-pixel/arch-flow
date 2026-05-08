import { createClient } from 'redis';
import { Redis as UpstashRedis } from '@upstash/redis';
import { logger } from './logger.js';

let redisClient = null;
let upstashClient = null;
let isReady = false;

// 1. Check for Production Upstash REST (Best for Vercel)
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    upstashClient = new UpstashRedis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    isReady = true;
    logger.info('Production Redis (Upstash REST) initialized');
  } catch (err) {
    logger.error('Upstash Initialization Failed', { error: err.message });
  }
} 
// 2. Fallback to Local Native Redis
else if (process.env.REDIS_URL || process.env.NODE_ENV !== 'production') {
  const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
  redisClient = createClient({ url: REDIS_URL });

  redisClient.on('error', (err) => {
    logger.error('Local Redis Error', { error: err.message });
    isReady = false;
  });

  redisClient.on('ready', () => {
    isReady = true;
    logger.info('Local Redis Ready');
  });

  redisClient.connect().catch(err => {
    logger.error('Local Redis Connection Failed', { error: err.message });
  });
} else {
  logger.warn('No Redis configuration found. Running without cache.');
}

export const redis = {
  async get(key) {
    if (!isReady) return null;
    try {
      if (upstashClient) return await upstashClient.get(key);
      return await redisClient.get(key);
    } catch (err) {
      logger.error('Redis GET failed', { error: err.message, key });
      return null;
    }
  },

  async set(key, value, ttlSeconds = 3600) {
    if (!isReady) return false;
    try {
      if (upstashClient) {
        await upstashClient.set(key, value, { ex: ttlSeconds });
      } else {
        await redisClient.set(key, value, { EX: ttlSeconds });
      }
      return true;
    } catch (err) {
      logger.error('Redis SET failed', { error: err.message, key });
      return false;
    }
  },

  async del(key) {
    if (!isReady) return false;
    try {
      if (upstashClient) return await upstashClient.del(key);
      return await redisClient.del(key);
    } catch (err) {
      return false;
    }
  },

  isAvailable() {
    return isReady;
  },
  
  getClient() {
    return redisClient; // Note: rate-limit-redis will need the native client if using native
  }
};
