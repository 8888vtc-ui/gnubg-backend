/**
 * Configuration JWT - Gestion des tokens
 */
import { JwtPayload, Token, UserId, UserRole } from '../types';
export type { JwtPayload, Token } from '../types';
export interface JwtTokens {
    readonly accessToken: Token;
    readonly refreshToken: Token;
}
export declare class JwtConfig {
    private static readonly ACCESS_TOKEN_EXPIRES_IN;
    private static readonly REFRESH_TOKEN_EXPIRES_IN;
    /**
     * Génération des tokens pour un utilisateur
     */
    static generateTokens(userId: UserId, email: string, role: UserRole): JwtTokens;
    /**
     * Validation d'un token
     */
    static validateToken(token: Token): JwtPayload;
    /**
     * Validation refresh token
     */
    static validateRefreshToken(token: Token): JwtPayload;
    /**
     * Extraction du payload sans validation (pour les logs)
     */
    static decodeToken(token: Token): JwtPayload | null;
    /**
     * Vérification si un token expire bientôt (dans les 5 prochaines minutes)
     */
    static isTokenExpiringSoon(token: Token): boolean;
}
//# sourceMappingURL=jwt.config.d.ts.map