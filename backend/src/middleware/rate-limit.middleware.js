"use strict";
/**
 * Rate Limit Middleware - Middleware de limitation de requêtes
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimitMiddleware = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const logger_utils_1 = require("../utils/logger.utils");
/**
 * Middleware de rate limiting personnalisé
 */
const rateLimitMiddleware = (options) => {
    return (0, express_rate_limit_1.default)({
        windowMs: options.windowMs,
        max: options.max,
        message: {
            success: false,
            error: options.message || 'Trop de requêtes, veuillez réessayer plus tard'
        },
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            logger_utils_1.Logger.warn('Rate limit exceeded', {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                path: req.path,
                action: 'rate_limit_exceeded'
            });
            res.status(429).json({
                success: false,
                error: options.message || 'Trop de requêtes, veuillez réessayer plus tard',
                retryAfter: Math.ceil(options.windowMs / 1000)
            });
        }
    });
};
exports.rateLimitMiddleware = rateLimitMiddleware;
//# sourceMappingURL=rate-limit.middleware.js.map