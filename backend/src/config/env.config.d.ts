/**
 * Configuration environnement - Validation et typage strict
 */
import { Environment } from '../types';
export declare class EnvConfig {
    private static env;
    /**
     * Validation et chargement des variables d'environnement
     */
    static load(): Environment;
    /**
     * Validation des valeurs
     */
    static validate(): void;
    /**
     * Getters typés
     */
    static get(): Environment;
    static isDevelopment(): boolean;
    static isProduction(): boolean;
    static isTest(): boolean;
}
//# sourceMappingURL=env.config.d.ts.map