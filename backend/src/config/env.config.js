"use strict";
/**
 * Configuration environnement - Validation et typage strict
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvConfig = void 0;
class EnvConfig {
    static env;
    /**
     * Validation et chargement des variables d'environnement
     */
    static load() {
        if (EnvConfig.env) {
            return EnvConfig.env;
        }
        const requiredVars = [
            'DATABASE_URL',
            'SUPABASE_URL',
            'SUPABASE_ANON_KEY',
            'SUPABASE_SERVICE_KEY',
            'JWT_SECRET',
            'GNUBG_SERVICE_URL',
            'GNUBG_API_KEY'
        ];
        const missing = requiredVars.filter(varName => !process.env[varName]);
        if (missing.length > 0) {
            throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
        }
        EnvConfig.env = {
            NODE_ENV: process.env.NODE_ENV || 'development',
            DATABASE_URL: process.env.DATABASE_URL,
            SUPABASE_URL: process.env.SUPABASE_URL,
            SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
            SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
            JWT_SECRET: process.env.JWT_SECRET,
            GNUBG_SERVICE_URL: process.env.GNUBG_SERVICE_URL,
            GNUBG_API_KEY: process.env.GNUBG_API_KEY,
            PORT: process.env.PORT ? parseInt(process.env.PORT) : undefined
        };
        // Validation supplémentaire
        EnvConfig.validate();
        return EnvConfig.env;
    }
    /**
     * Validation des valeurs
     */
    static validate() {
        const env = EnvConfig.env;
        // Validation URL
        try {
            new URL(env.DATABASE_URL);
            new URL(env.SUPABASE_URL);
            new URL(env.GNUBG_SERVICE_URL);
        }
        catch (error) {
            throw new Error(`Invalid URL format in environment variables: ${error}`);
        }
        // Validation JWT secret (minimum 32 caractères)
        if (env.JWT_SECRET.length < 32) {
            throw new Error('JWT_SECRET must be at least 32 characters long');
        }
        // Validation port
        if (env.PORT && (env.PORT < 1 || env.PORT > 65535)) {
            throw new Error('PORT must be between 1 and 65535');
        }
    }
    /**
     * Getters typés
     */
    static get() {
        return EnvConfig.load();
    }
    static isDevelopment() {
        return EnvConfig.get().NODE_ENV === 'development';
    }
    static isProduction() {
        return EnvConfig.get().NODE_ENV === 'production';
    }
    static isTest() {
        return EnvConfig.get().NODE_ENV === 'test';
    }
}
exports.EnvConfig = EnvConfig;
//# sourceMappingURL=env.config.js.map