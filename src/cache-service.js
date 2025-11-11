// Redis Caching Service for Performance Optimization
const Redis = require('ioredis');

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || '',
  db: process.env.REDIS_DB || 0,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keyPrefix: 'gammon_guru:'
};

// Create Redis client (only if Redis is available)
let redisClient = null;

try {
  if (process.env.REDIS_HOST || process.env.REDIS_URL) {
    redisClient = new Redis(process.env.REDIS_URL || redisConfig);
    console.log('🔴 Redis caching enabled');

    redisClient.on('error', (err) => {
      console.warn('⚠️  Redis connection error:', err.message);
      redisClient = null; // Disable caching if Redis fails
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });
  } else {
    console.log('ℹ️  Redis not configured, using memory cache');
  }
} catch (error) {
  console.warn('⚠️  Redis initialization failed:', error.message);
}

// Cache TTL configurations (in seconds)
const CACHE_TTL = {
  user: 300,        // 5 minutes
  game: 60,         // 1 minute
  analysis: 600,    // 10 minutes
  leaderboard: 300, // 5 minutes
  stats: 180,       // 3 minutes
  image: 3600       // 1 hour
};

// Cache keys
const CACHE_KEYS = {
  user: (userId) => `user:${userId}`,
  game: (gameId) => `game:${gameId}`,
  analysis: (gameId, userId) => `analysis:${gameId}:${userId}`,
  leaderboard: (type) => `leaderboard:${type}`,
  stats: (userId) => `stats:${userId}`,
  image: (type, params) => `image:${type}:${JSON.stringify(params)}`
};

// Cache service
class CacheService {
  constructor() {
    this.memoryCache = new Map(); // Fallback in-memory cache
  }

  // Get from cache
  async get(key) {
    try {
      if (redisClient) {
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
      } else {
        // Fallback to memory cache
        const item = this.memoryCache.get(key);
        if (item && item.expires > Date.now()) {
          return item.data;
        } else if (item) {
          this.memoryCache.delete(key); // Remove expired item
        }
        return null;
      }
    } catch (error) {
      console.warn('Cache get error:', error.message);
      return null;
    }
  }

  // Set to cache
  async set(key, data, ttl = 300) {
    try {
      if (redisClient) {
        await redisClient.setex(key, ttl, JSON.stringify(data));
      } else {
        // Fallback to memory cache
        this.memoryCache.set(key, {
          data,
          expires: Date.now() + (ttl * 1000)
        });
      }
    } catch (error) {
      console.warn('Cache set error:', error.message);
    }
  }

  // Delete from cache
  async del(key) {
    try {
      if (redisClient) {
        await redisClient.del(key);
      } else {
        this.memoryCache.delete(key);
      }
    } catch (error) {
      console.warn('Cache delete error:', error.message);
    }
  }

  // Clear all cache
  async clear() {
    try {
      if (redisClient) {
        await redisClient.flushdb();
      } else {
        this.memoryCache.clear();
      }
    } catch (error) {
      console.warn('Cache clear error:', error.message);
    }
  }

  // Get cache statistics
  async stats() {
    try {
      if (redisClient) {
        const info = await redisClient.info();
        const keys = await redisClient.dbsize();
        return {
          type: 'redis',
          keys,
          connected: redisClient.status === 'ready',
          info: info.split('\r\n').filter(line => line.includes(':'))
        };
      } else {
        return {
          type: 'memory',
          keys: this.memoryCache.size,
          connected: true
        };
      }
    } catch (error) {
      console.warn('Cache stats error:', error.message);
      return { type: 'error', connected: false };
    }
  }
}

// Export singleton instance
const cacheService = new CacheService();

module.exports = {
  cacheService,
  CACHE_KEYS,
  CACHE_TTL
};
