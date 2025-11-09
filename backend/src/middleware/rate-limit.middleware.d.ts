/**
 * Rate Limit Middleware - Middleware de limitation de requêtes
 */
interface RateLimitOptions {
    windowMs: number;
    max: number;
    message?: string;
}
/**
 * Middleware de rate limiting personnalisé
 */
export declare const rateLimitMiddleware: (options: RateLimitOptions) => import("express-rate-limit").RateLimitRequestHandler;
export {};
//# sourceMappingURL=rate-limit.middleware.d.ts.map