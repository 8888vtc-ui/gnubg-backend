"use strict";
/**
 * Request Logger Middleware - Middleware de logging des requêtes
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
const logger_utils_1 = require("../utils/logger.utils");
/**
 * Middleware pour logger les requêtes HTTP
 */
const requestLogger = (req, res, next) => {
    const startTime = Date.now();
    // Logger la requête entrante
    logger_utils_1.Logger.info('Incoming request', {
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        contentType: req.get('Content-Type'),
        action: 'incoming_request'
    });
    // Intercepter la réponse pour logger le temps de traitement
    const originalSend = res.send;
    res.send = function (data) {
        const processingTime = Date.now() - startTime;
        logger_utils_1.Logger.info('Request completed', {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            processingTime: `${processingTime}ms`,
            ip: req.ip,
            action: 'request_completed'
        });
        return originalSend.call(this, data);
    };
    next();
};
exports.requestLogger = requestLogger;
//# sourceMappingURL=request-logger.middleware.js.map