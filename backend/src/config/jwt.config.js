"use strict";
/**
 * Configuration JWT - Gestion des tokens
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtConfig = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_config_1 = require("./env.config");
class JwtConfig {
    static ACCESS_TOKEN_EXPIRES_IN = '15m';
    static REFRESH_TOKEN_EXPIRES_IN = '7d';
    /**
     * Génération des tokens pour un utilisateur
     */
    static generateTokens(userId, email, role) {
        const payload = {
            userId,
            email,
            role
        };
        const accessToken = jsonwebtoken_1.default.sign(payload, env_config_1.EnvConfig.get().JWT_SECRET, {
            expiresIn: JwtConfig.ACCESS_TOKEN_EXPIRES_IN,
            issuer: 'gammonguru',
            audience: 'gammonguru-users'
        });
        const refreshToken = jsonwebtoken_1.default.sign(payload, env_config_1.EnvConfig.get().JWT_SECRET, {
            expiresIn: JwtConfig.REFRESH_TOKEN_EXPIRES_IN,
            issuer: 'gammonguru',
            audience: 'gammonguru-refresh'
        });
        return {
            accessToken: accessToken,
            refreshToken: refreshToken
        };
    }
    /**
     * Validation d'un token
     */
    static validateToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, env_config_1.EnvConfig.get().JWT_SECRET, {
                issuer: 'gammonguru',
                audience: 'gammonguru-users'
            });
            return decoded;
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                throw new Error('Token expired');
            }
            else if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                throw new Error('Invalid token');
            }
            else {
                throw new Error('Token validation failed');
            }
        }
    }
    /**
     * Validation refresh token
     */
    static validateRefreshToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, env_config_1.EnvConfig.get().JWT_SECRET, {
                issuer: 'gammonguru',
                audience: 'gammonguru-refresh'
            });
            return decoded;
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                throw new Error('Refresh token expired');
            }
            else if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                throw new Error('Invalid refresh token');
            }
            else {
                throw new Error('Refresh token validation failed');
            }
        }
    }
    /**
     * Extraction du payload sans validation (pour les logs)
     */
    static decodeToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.decode(token);
            return decoded;
        }
        catch {
            return null;
        }
    }
    /**
     * Vérification si un token expire bientôt (dans les 5 prochaines minutes)
     */
    static isTokenExpiringSoon(token) {
        const decoded = JwtConfig.decodeToken(token);
        if (!decoded || !decoded.exp) {
            return true;
        }
        const now = Math.floor(Date.now() / 1000);
        const fiveMinutes = 5 * 60;
        return decoded.exp - now < fiveMinutes;
    }
}
exports.JwtConfig = JwtConfig;
//# sourceMappingURL=jwt.config.js.map