"use strict";
/**
 * Validation Middleware - Middleware de validation avec Zod
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationMiddleware = void 0;
const zod_1 = require("zod");
const logger_utils_1 = require("../utils/logger.utils");
/**
 * Middleware de validation Zod
 */
const validationMiddleware = (schema, target = 'body') => {
    return (req, res, next) => {
        try {
            const data = req[target];
            const validatedData = schema.parse(data);
            // Remplacer les données originales par les données validées
            req[target] = validatedData;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                logger_utils_1.Logger.warn('Validation failed', {
                    path: req.path,
                    method: req.method,
                    issues: error.issues,
                    action: 'validation_failed'
                });
                res.status(400).json({
                    success: false,
                    error: 'Données invalides',
                    details: error.issues
                });
                return;
            }
            logger_utils_1.Logger.error('Validation middleware error', {
                path: req.path,
                method: req.method,
                error: error instanceof Error ? error.message : 'Unknown error',
                action: 'validation_middleware_error'
            });
            res.status(500).json({
                success: false,
                error: 'Erreur serveur lors de la validation'
            });
        }
    };
};
exports.validationMiddleware = validationMiddleware;
//# sourceMappingURL=validation.middleware.js.map