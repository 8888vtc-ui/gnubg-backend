"use strict";
/**
 * Cache Redis - Optimisation des performances
 */
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const logger_utils_1 = require("../utils/logger.utils");
class RedisCache {
    static client;
    static isConnected = false;
    static async connect() {
        if (this.isConnected)
            return;
        this.client = (0, redis_1.createClient)({
            url: process.env.REDIS_URL || 'redis://localhost:6379'
        });
        this.client.on('error', (err) => {
            logger_utils_1.Logger.error('Redis error', {
                error: err.message,
                action: 'redis_error'
            });
        });
        await this.client.connect();
        this.isConnected = true;
        logger_utils_1.Logger.info('Redis connected successfully', {
            action: 'redis_connected'
        });
    }
    static async get(key) {
        await this.ensureConnection();
        return this.client.get(key);
    }
    static async set(key, value, ttlSeconds = 300) {
        await this.ensureConnection();
        await this.client.setEx(key, ttlSeconds, value);
    }
    static async del(key) {
        await this.ensureConnection();
        await this.client.del(key);
    }
    static async keys(pattern) {
        await this.ensureConnection();
        return this.client.keys(pattern);
    }
    static async ensureConnection() {
        if (!this.isConnected) {
            await this.connect();
        }
    }
    static async disconnect() {
        if (this.isConnected) {
            await this.client.quit();
            this.isConnected = false;
            logger_utils_1.Logger.info('Redis disconnected', {
                action: 'redis_disconnected'
            });
        }
    }
}
exports.default = RedisCache;
//# sourceMappingURL=redis.js.map