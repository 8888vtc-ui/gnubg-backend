/**
 * AuthService - Gestion utilisateurs robuste et sécurisée
 */
import { UserRole } from '../types';
interface SimpleUser {
    id: string;
    email: string;
    username: string;
    passwordHash: string;
    role: UserRole;
    subscription: 'free' | 'premium';
    level: number;
    elo: number;
    isActive: boolean;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}
interface SimpleRegisterRequest {
    email: string;
    password: string;
    username: string;
}
interface SimpleLoginRequest {
    email: string;
    password: string;
}
interface SimpleUpdateProfileRequest {
    username?: string;
    currentPassword?: string;
    newPassword?: string;
}
interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}
export declare class AuthService {
    /**
     * Inscription d'un nouvel utilisateur
     */
    static register(userData: SimpleRegisterRequest): Promise<{
        user: Omit<SimpleUser, 'passwordHash'>;
        tokens: AuthTokens;
    }>;
    /**
     * Connexion d'un utilisateur
     */
    static login(loginData: SimpleLoginRequest): Promise<{
        user: Omit<SimpleUser, 'passwordHash'>;
        tokens: AuthTokens;
    }>;
    /**
     * Rafraîchir les tokens JWT
     */
    static refreshTokens(refreshToken: string): Promise<AuthTokens>;
    /**
     * Obtenir le profil utilisateur
     */
    static getProfile(userId: string): Promise<Omit<SimpleUser, 'passwordHash'> | null>;
    /**
     * Mettre à jour le ELO de l'utilisateur
     */
    static updateElo(userId: string, gameResult: 'win' | 'loss' | 'draw', opponentElo: number): Promise<void>;
    /**
     * Mettre à jour le profil utilisateur
     */
    static updateProfile(userId: string, profileData: SimpleUpdateProfileRequest): Promise<Omit<SimpleUser, 'passwordHash'>>;
    /**
     * Désactiver un compte utilisateur
     */
    static deactivateAccount(userId: string): Promise<void>;
    /**
     * Calculer le nouveau ELO selon la formule standard
     */
    private static calculateElo;
}
export {};
//# sourceMappingURL=auth.service.robust.d.ts.map