/**
 * AuthService - Gestion des utilisateurs et authentification
 */
import { User, RegisterRequest, LoginRequest, UpdateProfileRequest } from '../types';
export declare class AuthService {
    /**
     * Inscription d'un nouvel utilisateur
     */
    static register(userData: RegisterRequest): Promise<{
        user: Omit<User, 'passwordHash'>;
        tokens: import('../config').JwtTokens;
    }>;
    /**
     * Connexion d'un utilisateur
     */
    static login(loginData: LoginRequest): Promise<{
        user: Omit<User, 'passwordHash'>;
        tokens: import('../config').JwtTokens;
    }>;
    /**
     * Rafraîchir les tokens JWT
     */
    static refreshTokens(refreshToken: string): Promise<import('../config').JwtTokens>;
    /**
     * Mettre à jour le profil utilisateur
     */
    static updateProfile(userId: string, profileData: UpdateProfileRequest): Promise<Omit<User, 'passwordHash'>>;
    /**
     * Obtenir le profil utilisateur
     */
    static getProfile(userId: string): Promise<Omit<User, 'passwordHash'> | null>;
    /**
     * Mettre à jour le ELO de l'utilisateur
     */
    static updateElo(userId: string, gameResult: 'win' | 'loss' | 'draw', opponentElo: number): Promise<void>;
    /**
     * Désactiver un compte utilisateur
     */
    static deactivateAccount(userId: string): Promise<void>;
    private static findUserByEmail;
    private static findUserByUsername;
    private static findUserById;
    private static saveUser;
    private static updateUser;
    /**
     * Calculer le nouveau ELO selon la formule standard
     */
    private static calculateElo;
}
//# sourceMappingURL=auth.service.d.ts.map