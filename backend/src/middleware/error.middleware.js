"use strict";
/**
 * Error Middleware - Middleware de gestion des erreurs
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const logger_utils_1 = require("../utils/logger.utils");
/**
 * Middleware de gestion des erreurs global
 */
const errorHandler = (error, req, res, next) => {
    logger_utils_1.Logger.error('Unhandled error', {
        error: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        action: 'unhandled_error'
    });
    // Ne pas exposer les détails de l'erreur en production
    const isDevelopment = process.env.NODE_ENV === 'development';
    res.status(500).json({
        success: false,
        error: 'Erreur serveur interne',
        ...(isDevelopment && {
            details: {
                message: error.message,
                stack: error.stack
            }
        })
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=error.middleware.js.map