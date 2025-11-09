/**
 * Index des types - Export centralisé
 */
export * from './game.types';
export type { AnalyzeRequest, GnubgResponse, MoveSuggestion, GnubgConfig, GnubgError } from './gnubg.types';
export { AnalysisType, GamePhase } from './gnubg.types';
export * from './service.types';
export type { User, RegisterRequest, LoginRequest, AuthResponse, JwtPayload, RefreshTokenRequest, UpdateProfileRequest, PublicProfile } from './auth.types';
export { UserRole, SubscriptionType } from './auth.types';
export interface DatabaseConnection {
    readonly host: string;
    readonly port: number;
    readonly database: string;
    readonly user: string;
    readonly password: string;
    readonly ssl: boolean;
}
export interface Environment {
    readonly NODE_ENV: 'development' | 'production' | 'test';
    readonly DATABASE_URL: string;
    readonly SUPABASE_URL: string;
    readonly SUPABASE_ANON_KEY: string;
    readonly SUPABASE_SERVICE_KEY: string;
    readonly JWT_SECRET: string;
    readonly GNUBG_SERVICE_URL: string;
    readonly GNUBG_API_KEY: string;
    readonly PORT?: string;
}
export interface LogContext {
    readonly [key: string]: unknown;
    readonly timestamp?: string;
    readonly level?: string;
    readonly message?: string;
    readonly error?: string;
    readonly userId?: string;
    readonly gameId?: string;
    readonly action?: string;
    readonly ip?: string;
    readonly endpoint?: string;
    readonly size?: number;
    readonly userRole?: string;
    readonly targetUserId?: string;
    readonly maxSize?: number;
    readonly requiredRole?: string;
}
export interface GameLogContext extends LogContext {
    dice?: {
        die1: number;
        die2: number;
    };
    move?: {
        from: number;
        to: number;
        diceValue: number;
    };
}
//# sourceMappingURL=index.d.ts.map