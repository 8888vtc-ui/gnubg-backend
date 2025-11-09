/**
 * Types pour l'authentification et la gestion utilisateur
 */
export type UserId = string;
export type Email = string;
export type Token = string;
export declare enum UserRole {
    PLAYER = "PLAYER",
    ADMIN = "ADMIN",
    MODERATOR = "MODERATOR"
}
export declare enum SubscriptionType {
    FREE = "FREE",
    PREMIUM = "PREMIUM",
    PRO = "PRO"
}
export interface User {
    readonly id: UserId;
    readonly email: Email;
    readonly username: string;
    readonly passwordHash: string;
    readonly level: number;
    readonly elo: number;
    readonly role: UserRole;
    readonly subscription: SubscriptionType;
    readonly isActive: boolean;
    readonly isVerified: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly lastLoginAt?: Date;
}
export interface RegisterRequest {
    readonly email: Email;
    readonly password: string;
    readonly username: string;
}
export interface LoginRequest {
    readonly email: Email;
    readonly password: string;
}
export interface AuthResponse {
    readonly user: Omit<User, 'passwordHash'>;
    readonly token: Token;
    readonly refreshToken: Token;
    readonly expiresIn: number;
}
export interface JwtPayload {
    readonly userId: UserId;
    readonly email: Email;
    readonly role: UserRole;
    readonly iat: number;
    readonly exp: number;
}
export interface RefreshTokenRequest {
    readonly refreshToken: Token;
}
export interface UpdateProfileRequest {
    readonly username?: string;
    readonly currentPassword?: string;
    readonly newPassword?: string;
}
export interface PublicProfile {
    readonly id: UserId;
    readonly username: string;
    readonly level: number;
    readonly elo: number;
    readonly subscription: SubscriptionType;
    readonly gamesPlayed: number;
    readonly winRate: number;
    readonly createdAt: Date;
}
//# sourceMappingURL=auth.types.d.ts.map