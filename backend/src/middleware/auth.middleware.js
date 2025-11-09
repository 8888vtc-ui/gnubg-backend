"use strict";
/**
 * Middleware d'authentification - Sécurité renforcée
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = exports.authMiddleware = void 0;
const config_1 = require("../config");
const utils_1 = require("../utils");
const utils_2 = require("../utils");
// Export fonctionnel pour compatibilité
const authMiddleware = (req, res, next) => {
    AuthMiddleware.authenticate(req, res, next);
};
exports.authMiddleware = authMiddleware;
class AuthMiddleware {
    /**
     * Vérification du token JWT
     */
    static authenticate(req, res, next) {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                res.status(401).json({
                    success: false,
                    error: 'Authorization token required'
                });
                return;
            }
            const token = authHeader.substring(7); // Remove 'Bearer '
            if (!token) {
                res.status(401).json({
                    success: false,
                    error: 'Token missing'
                });
                return;
            }
            // Validation du token
            const payload = config_1.JwtConfig.validateToken(token);
            // Ajout des infos utilisateur à la requête
            req.user = {
                userId: payload.userId,
                email: payload.email,
                role: payload.role
            };
            // Log de sécurité
            utils_2.Logger.info('User authenticated', {
                requestId: req.headers['x-request-id'],
                userId: payload.userId,
                action: 'auth_success',
                endpoint: req.path
            });
            next();
        }
        catch (error) {
            utils_2.Logger.warn('Authentication failed', {
                requestId: req.headers['x-request-id'],
                action: 'auth_failed',
                endpoint: req.path,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            res.status(401).json({
                success: false,
                error: 'Invalid or expired token'
            });
        }
    }
    /**
     * Vérification du rôle utilisateur
     */
    static requireRole(requiredRole) {
        return (req, res, next) => {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
                return;
            }
            if (req.user.role !== requiredRole && req.user.role !== 'ADMIN') {
                utils_2.Logger.warn('Access denied - insufficient role', {
                    requestId: req.headers['x-request-id'],
                    userId: req.user.userId,
                    userRole: req.user.role,
                    requiredRole,
                    endpoint: req.path
                });
                res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions'
                });
                return;
            }
            next();
        };
    }
    /**
     * Vérification que l'utilisateur accède à ses propres ressources
     */
    static requireOwnership(paramUserId = 'userId') {
        return (req, res, next) => {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
                return;
            }
            const targetUserId = req.params[paramUserId];
            // Admin peut accéder à tout
            if (req.user.role === 'ADMIN') {
                next();
                return;
            }
            // Vérification que l'utilisateur accède à ses propres données
            if (req.user.userId !== targetUserId) {
                utils_2.Logger.warn('Access denied - ownership violation', {
                    requestId: req.headers['x-request-id'],
                    userId: req.user.userId,
                    targetUserId,
                    endpoint: req.path
                });
                res.status(403).json({
                    success: false,
                    error: 'Access denied: You can only access your own resources'
                });
                return;
            }
            next();
        };
    }
    /**
     * Rate limiting par utilisateur pour les actions sensibles
     */
    static userRateLimit(maxRequests, windowMs) {
        return (req, res, next) => {
            if (!req.user) {
                next(); // Pas de rate limiting si non authentifié (géré par autre middleware)
                return;
            }
            if (!utils_1.SecurityUtils.checkUserRateLimit(req.user.userId, maxRequests, windowMs)) {
                utils_2.Logger.warn('User rate limit exceeded', {
                    requestId: req.headers['x-request-id'],
                    userId: req.user.userId,
                    endpoint: req.path
                });
                res.status(429).json({
                    success: false,
                    error: 'Too many requests. Please try again later.'
                });
                return;
            }
            next();
        };
    }
    /**
     * Validation du token refresh
     */
    static validateRefreshToken(req, res, next) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                res.status(400).json({
                    success: false,
                    error: 'Refresh token required'
                });
                return;
            }
            const payload = config_1.JwtConfig.validateRefreshToken(refreshToken);
            // Ajout du payload à la requête pour le prochain middleware
            req.refreshPayload = payload;
            next();
        }
        catch (error) {
            utils_2.Logger.warn('Refresh token validation failed', {
                requestId: req.headers['x-request-id'],
                action: 'refresh_token_failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            res.status(401).json({
                success: false,
                error: 'Invalid or expired refresh token'
            });
        }
    }
    /**
     * Optionnel: Authentification (ne bloque pas si pas de token)
     */
    static optionalAuth(req, _res, next) {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                next(); // Pas de token, continue sans auth
                return;
            }
            const token = authHeader.substring(7);
            if (token) {
                const payload = config_1.JwtConfig.validateToken(token);
                req.user = {
                    userId: payload.userId,
                    email: payload.email,
                    role: payload.role
                };
            }
            next();
        }
        catch (error) {
            // En optionel, on continue même si le token est invalide
            utils_2.Logger.debug('Optional auth failed', {
                requestId: req.headers['x-request-id'],
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            next();
        }
    }
}
exports.AuthMiddleware = AuthMiddleware;
//# sourceMappingURL=auth.middleware.js.map