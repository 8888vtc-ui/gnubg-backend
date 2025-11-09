/**
 * Middleware de sécurité - Rate limiting et protections
 */
import { Request, Response, NextFunction } from 'express';
export declare const securityMiddleware: (req: Request, res: Response, next: NextFunction) => void;
interface RateLimitConfig {
    windowMs: number;
    maxRequests: number;
    message: string;
}
export declare class SecurityMiddleware {
    /**
     * Appliquer les headers de sécurité
     */
    static applySecurityHeaders(req: Request, res: Response, next: NextFunction): void;
    /**
     * Rate limiting basique
     */
    static rateLimit(config: RateLimitConfig): (req: Request, res: Response, next: NextFunction) => void;
    /**
     * Protection contre les attaques par force brute sur login
     */
    static loginRateLimit: (req: Request, res: Response, next: NextFunction) => void;
    /**
     * Rate limiting général pour les APIs
     */
    static apiRateLimit: (req: Request, res: Response, next: NextFunction) => void;
    /**
     * Headers de sécurité
     */
    static securityHeaders(_req: Request, res: Response, next: NextFunction): void;
    /**
     * Validation de la taille des requêtes
     */
    static requestSizeLimit(maxSize: number): (req: Request, res: Response, next: NextFunction) => void;
    /**
     * Nettoyage périodique du store de rate limiting
     */
    static cleanupRateLimitStore(): void;
}
export {};
//# sourceMappingURL=security.middleware.d.ts.map