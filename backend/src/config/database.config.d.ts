/**
 * Configuration base de données - Supabase + Prisma
 */
import { PrismaClient } from '@prisma/client';
import { DatabaseConnection } from '../types';
export declare class DatabaseConfig {
    private static instance;
    /**
     * Instance singleton Prisma
     */
    static getInstance(): PrismaClient;
    /**
     * Validation de la connexion
     */
    static validateConnection(): Promise<boolean>;
    /**
     * Graceful shutdown
     */
    static disconnect(): Promise<void>;
    /**
     * Parse DATABASE_URL
     */
    static parseDatabaseUrl(url: string): DatabaseConnection;
}
//# sourceMappingURL=database.config.d.ts.map