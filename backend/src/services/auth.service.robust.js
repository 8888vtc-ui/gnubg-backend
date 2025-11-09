"use strict";
/**
 * AuthService - Gestion utilisateurs robuste et sécurisée
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const logger_utils_1 = require("../utils/logger.utils");
const security_utils_1 = require("../utils/security.utils");
const jwt_config_1 = require("../config/jwt.config");
const types_1 = require("../types");
const zod_1 = require("zod");
// Schémas de validation Zod robustes
const RegisterSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email invalide'),
    password: zod_1.z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'),
    username: zod_1.z.string().min(3, 'Le username doit contenir au moins 3 caractères')
        .max(20, 'Le username ne peut pas dépasser 20 caractères')
        .regex(/^[a-zA-Z0-9_]+$/, 'Le username ne peut contenir que des lettres, chiffres et underscore')
});
const LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email invalide'),
    password: zod_1.z.string().min(1, 'Le mot de passe est requis')
});
const UpdateProfileSchema = zod_1.z.object({
    username: zod_1.z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/).optional(),
    currentPassword: zod_1.z.string().min(1).optional(),
    newPassword: zod_1.z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).optional()
});
// Base de données simulée (en production: PostgreSQL/Supabase)
class UserDatabase {
    static users = new Map();
    static emailIndex = new Map();
    static usernameIndex = new Map();
    static async findByEmail(email) {
        const userId = this.emailIndex.get(email);
        return userId ? this.users.get(userId) || null : null;
    }
    static async findByUsername(username) {
        const userId = this.usernameIndex.get(username);
        return userId ? this.users.get(userId) || null : null;
    }
    static async findById(id) {
        return this.users.get(id) || null;
    }
    static async create(user) {
        const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newUser = {
            ...user,
            id,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.users.set(id, newUser);
        this.emailIndex.set(user.email, id);
        this.usernameIndex.set(user.username, id);
        return newUser;
    }
    static async update(id, updates) {
        const user = this.users.get(id);
        if (!user)
            return null;
        const updatedUser = { ...user, ...updates, updatedAt: new Date() };
        this.users.set(id, updatedUser);
        // Mettre à jour les index si email/username changent
        if (updates.email) {
            this.emailIndex.delete(user.email);
            this.emailIndex.set(updates.email, id);
        }
        if (updates.username) {
            this.usernameIndex.delete(user.username);
            this.usernameIndex.set(updates.username, id);
        }
        return updatedUser;
    }
}
class AuthService {
    /**
     * Inscription d'un nouvel utilisateur
     */
    static async register(userData) {
        try {
            // Validation robuste avec Zod
            const validatedData = RegisterSchema.parse(userData);
            // Vérifier si l'email existe déjà
            const existingUser = await UserDatabase.findByEmail(validatedData.email);
            if (existingUser) {
                throw new Error('Cet email est déjà enregistré');
            }
            // Vérifier si le username existe déjà
            const existingUsername = await UserDatabase.findByUsername(validatedData.username);
            if (existingUsername) {
                throw new Error('Ce username est déjà pris');
            }
            // Hasher le mot de passe
            const passwordHash = await security_utils_1.SecurityUtils.hashPassword(validatedData.password);
            // Créer l'utilisateur
            const newUser = await UserDatabase.create({
                email: validatedData.email,
                username: validatedData.username,
                passwordHash,
                role: types_1.UserRole.PLAYER,
                subscription: 'free',
                level: 1,
                elo: 1200,
                isActive: true,
                isVerified: false
            });
            // Générer les tokens JWT
            const jwtTokens = jwt_config_1.JwtConfig.generateTokens(newUser.id, newUser.email, newUser.role);
            const tokens = {
                accessToken: jwtTokens.accessToken.toString(),
                refreshToken: jwtTokens.refreshToken.toString()
            };
            const userResponse = {
                id: newUser.id,
                email: newUser.email,
                username: newUser.username,
                role: newUser.role,
                subscription: newUser.subscription,
                level: newUser.level,
                elo: newUser.elo,
                isActive: newUser.isActive,
                isVerified: newUser.isVerified,
                createdAt: newUser.createdAt,
                updatedAt: newUser.updatedAt
            };
            logger_utils_1.Logger.info('User registered successfully', {
                userId: newUser.id,
                email: newUser.email,
                action: 'user_registered'
            });
            return { user: userResponse, tokens };
        }
        catch (error) {
            logger_utils_1.Logger.error('Registration failed', {
                email: userData.email,
                action: 'registration_failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            throw error;
        }
    }
    /**
     * Connexion d'un utilisateur
     */
    static async login(loginData) {
        try {
            // Validation robuste avec Zod
            const validatedData = LoginSchema.parse(loginData);
            // Trouver l'utilisateur par email
            const user = await UserDatabase.findByEmail(validatedData.email);
            if (!user) {
                throw new Error('Email ou mot de passe incorrect');
            }
            // Vérifier si le compte est actif
            if (!user.isActive) {
                throw new Error('Ce compte a été désactivé');
            }
            // Vérifier le mot de passe
            const isPasswordValid = await security_utils_1.SecurityUtils.verifyPassword(validatedData.password, user.passwordHash);
            if (!isPasswordValid) {
                throw new Error('Email ou mot de passe incorrect');
            }
            // Générer les tokens JWT
            const jwtTokens = jwt_config_1.JwtConfig.generateTokens(user.id, user.email, user.role);
            const tokens = {
                accessToken: jwtTokens.accessToken.toString(),
                refreshToken: jwtTokens.refreshToken.toString()
            };
            const userResponse = {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
                subscription: user.subscription,
                level: user.level,
                elo: user.elo,
                isActive: user.isActive,
                isVerified: user.isVerified,
                createdAt: user.createdAt,
                updatedAt: new Date()
            };
            logger_utils_1.Logger.info('User logged in successfully', {
                userId: user.id,
                email: user.email,
                action: 'user_login'
            });
            return { user: userResponse, tokens };
        }
        catch (error) {
            logger_utils_1.Logger.error('Login failed', {
                email: loginData.email,
                action: 'login_failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            throw error;
        }
    }
    /**
     * Rafraîchir les tokens JWT
     */
    static async refreshTokens(refreshToken) {
        try {
            const payload = jwt_config_1.JwtConfig.validateRefreshToken(refreshToken);
            // Vérifier que l'utilisateur existe toujours
            const user = await UserDatabase.findById(payload.userId);
            if (!user || !user.isActive) {
                throw new Error('Utilisateur non trouvé ou inactif');
            }
            // Générer de nouveaux tokens
            const jwtTokens = jwt_config_1.JwtConfig.generateTokens(user.id, user.email, user.role);
            const newTokens = {
                accessToken: jwtTokens.accessToken.toString(),
                refreshToken: jwtTokens.refreshToken.toString()
            };
            logger_utils_1.Logger.info('Tokens refreshed successfully', {
                userId: user.id,
                action: 'tokens_refreshed'
            });
            return newTokens;
        }
        catch (error) {
            logger_utils_1.Logger.error('Token refresh failed', {
                action: 'token_refresh_failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            throw error;
        }
    }
    /**
     * Obtenir le profil utilisateur
     */
    static async getProfile(userId) {
        try {
            const user = await UserDatabase.findById(userId);
            if (!user) {
                return null;
            }
            const userResponse = {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
                subscription: user.subscription,
                level: user.level,
                elo: user.elo,
                isActive: user.isActive,
                isVerified: user.isVerified,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            };
            logger_utils_1.Logger.debug('Profile fetched successfully', {
                userId,
                action: 'profile_fetched'
            });
            return userResponse;
        }
        catch (error) {
            logger_utils_1.Logger.error('Profile fetch failed', {
                userId,
                action: 'profile_fetch_failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            return null;
        }
    }
    /**
     * Mettre à jour le ELO de l'utilisateur
     */
    static async updateElo(userId, gameResult, opponentElo) {
        try {
            const user = await UserDatabase.findById(userId);
            if (!user) {
                throw new Error('Utilisateur non trouvé');
            }
            const newElo = AuthService.calculateElo(user.elo, opponentElo, gameResult);
            await UserDatabase.update(userId, {
                elo: Math.round(newElo),
                level: Math.floor(newElo / 100) + 1
            });
            logger_utils_1.Logger.info('ELO updated successfully', {
                userId,
                oldElo: user.elo,
                newElo: Math.round(newElo),
                gameResult,
                action: 'elo_updated'
            });
        }
        catch (error) {
            logger_utils_1.Logger.error('ELO update failed', {
                userId,
                action: 'elo_update_failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            throw error;
        }
    }
    /**
     * Mettre à jour le profil utilisateur
     */
    static async updateProfile(userId, profileData) {
        try {
            // Validation robuste avec Zod
            const validatedData = UpdateProfileSchema.parse(profileData);
            const user = await UserDatabase.findById(userId);
            if (!user) {
                throw new Error('Utilisateur non trouvé');
            }
            const updates = {};
            // Si changement de mot de passe
            if (validatedData.newPassword) {
                if (!validatedData.currentPassword) {
                    throw new Error('Le mot de passe actuel est requis pour le changer');
                }
                const isCurrentPasswordValid = await security_utils_1.SecurityUtils.verifyPassword(validatedData.currentPassword, user.passwordHash);
                if (!isCurrentPasswordValid) {
                    throw new Error('Le mot de passe actuel est incorrect');
                }
                updates.passwordHash = await security_utils_1.SecurityUtils.hashPassword(validatedData.newPassword);
            }
            // Mettre à jour le username si fourni
            if (validatedData.username) {
                const existingUsername = await UserDatabase.findByUsername(validatedData.username);
                if (existingUsername && existingUsername.id !== userId) {
                    throw new Error('Ce username est déjà pris');
                }
                updates.username = validatedData.username;
            }
            const updatedUser = await UserDatabase.update(userId, updates);
            if (!updatedUser) {
                throw new Error('Échec de la mise à jour');
            }
            const userResponse = {
                id: updatedUser.id,
                email: updatedUser.email,
                username: updatedUser.username,
                role: updatedUser.role,
                subscription: updatedUser.subscription,
                level: updatedUser.level,
                elo: updatedUser.elo,
                isActive: updatedUser.isActive,
                isVerified: updatedUser.isVerified,
                createdAt: updatedUser.createdAt,
                updatedAt: updatedUser.updatedAt
            };
            logger_utils_1.Logger.info('Profile updated successfully', {
                userId,
                action: 'profile_updated'
            });
            return userResponse;
        }
        catch (error) {
            logger_utils_1.Logger.error('Profile update failed', {
                userId,
                action: 'profile_update_failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            throw error;
        }
    }
    /**
     * Désactiver un compte utilisateur
     */
    static async deactivateAccount(userId) {
        try {
            const user = await UserDatabase.findById(userId);
            if (!user) {
                throw new Error('Utilisateur non trouvé');
            }
            await UserDatabase.update(userId, { isActive: false });
            logger_utils_1.Logger.info('Account deactivated successfully', {
                userId,
                action: 'account_deactivated'
            });
        }
        catch (error) {
            logger_utils_1.Logger.error('Account deactivation failed', {
                userId,
                action: 'account_deactivation_failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            throw error;
        }
    }
    /**
     * Calculer le nouveau ELO selon la formule standard
     */
    static calculateElo(currentElo, opponentElo, result) {
        const K = 32; // Facteur K pour les joueurs amateurs
        const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - currentElo) / 400));
        const actualScore = result === 'win' ? 1 : result === 'draw' ? 0.5 : 0;
        return currentElo + K * (actualScore - expectedScore);
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.robust.js.map