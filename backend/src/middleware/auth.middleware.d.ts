/**
 * Middleware d'authentification - Sécurité renforcée
 */
import { Request, Response, NextFunction } from 'express';
export interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        email: string;
        role: string;
    };
}
export declare const authMiddleware: (req: Request, res: Response, next: NextFunction) => void;
export declare class AuthMiddleware {
    /**
     * Vérification du token JWT
     */
    static authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void;
    /**
     * Vérification du rôle utilisateur
     */
    static requireRole(requiredRole: string): (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
    /**
     * Vérification que l'utilisateur accède à ses propres ressources
     */
    static requireOwnership(paramUserId?: string): (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
    /**
     * Rate limiting par utilisateur pour les actions sensibles
     */
    static userRateLimit(maxRequests: number, windowMs: number): (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
    /**
     * Validation du token refresh
     */
    static validateRefreshToken(req: Request, res: Response, next: NextFunction): void;
    /**
     * Optionnel: Authentification (ne bloque pas si pas de token)
     */
    static optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): void;
}
//# sourceMappingURL=auth.middleware.d.ts.map