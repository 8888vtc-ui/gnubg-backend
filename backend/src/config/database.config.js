"use strict";
/**
 * Configuration base de données - Supabase + Prisma
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseConfig = void 0;
const client_1 = require("@prisma/client");
class DatabaseConfig {
    static instance;
    /**
     * Instance singleton Prisma
     */
    static getInstance() {
        if (!DatabaseConfig.instance) {
            DatabaseConfig.instance = new client_1.PrismaClient({
                log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
                errorFormat: 'pretty'
            });
        }
        return DatabaseConfig.instance;
    }
    /**
     * Validation de la connexion
     */
    static async validateConnection() {
        try {
            const prisma = DatabaseConfig.getInstance();
            await prisma.$queryRaw `SELECT 1`;
            return true;
        }
        catch (error) {
            console.error('Database connection failed:', error);
            return false;
        }
    }
    /**
     * Graceful shutdown
     */
    static async disconnect() {
        if (DatabaseConfig.instance) {
            await DatabaseConfig.instance.$disconnect();
        }
    }
    /**
     * Parse DATABASE_URL
     */
    static parseDatabaseUrl(url) {
        try {
            const dbUrl = new URL(url);
            return {
                host: dbUrl.hostname,
                port: parseInt(dbUrl.port) || 5432,
                database: dbUrl.pathname.substring(1),
                user: dbUrl.username,
                password: dbUrl.password,
                ssl: true
            };
        }
        catch (error) {
            throw new Error(`Invalid DATABASE_URL: ${url}`);
        }
    }
}
exports.DatabaseConfig = DatabaseConfig;
//# sourceMappingURL=database.config.js.map