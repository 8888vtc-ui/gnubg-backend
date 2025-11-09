/**
 * Utilitaires de sécurité - Sanitization et protections
 */
export declare class SecurityUtils {
    /**
     * Hash sécurisé des mots de passe
     */
    static hashPassword(password: string): Promise<string>;
    /**
     * Vérification du mot de passe
     */
    static verifyPassword(password: string, hashedPassword: string): Promise<boolean>;
    /**
     * Génération de token sécurisé
     */
    static generateSecureToken(length?: number): string;
    /**
     * Sanitization des entrées utilisateur
     */
    static sanitizeInput(input: string): string;
    /**
     * Validation d'email avec vérification DNS optionnelle
     */
    static isValidEmail(email: string): boolean;
    /**
     * Validation de force de mot de passe
     */
    static validatePasswordStrength(password: string): {
        isValid: boolean;
        errors: string[];
        score: number;
    };
    /**
     * Génération d'ID sécurisé
     */
    static generateSecureId(): string;
    /**
     * Vérification de timeout pour les opérations
     */
    static createTimeoutPromise<T>(promise: Promise<T>, timeoutMs: number): Promise<T>;
    /**
     * Validation des noms de fichiers
     */
    static isValidFileName(fileName: string): boolean;
    /**
     * Rate limiting par utilisateur (en mémoire)
     */
    private static userRateLimits;
    static checkUserRateLimit(userId: string, maxRequests: number, windowMs: number): boolean;
}
//# sourceMappingURL=security.utils.d.ts.map