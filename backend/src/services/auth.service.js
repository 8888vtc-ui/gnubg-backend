"use strict";
/**
 * AuthService - Gestion des utilisateurs et authentification
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const types_1 = require("../types");
const config_1 = require("../config");
const utils_1 = require("../utils");
const utils_2 = require("../utils");
const utils_3 = require("../utils");
class AuthService {
    /**
     * Inscription d'un nouvel utilisateur
     */
    static async register(userData) {
        try {
            const validatedData = utils_3.ValidationUtils.validate(utils_3.RegisterSchema, userData);
            // Vérifier si l'email existe déjà
            const existingUser = await AuthService.findUserByEmail(validatedData.email);
            if (existingUser) {
                throw new Error('Email already registered');
            }
            // Vérifier si le username existe déjà
            const existingUsername = await AuthService.findUserByUsername(validatedData.username);
            if (existingUsername) {
                throw new Error('Username already taken');
            }
            // Hasher le mot de passe
            const passwordHash = await utils_1.SecurityUtils.hashPassword(validatedData.password);
            // Créer l'utilisateur
            const newUser = {
                id: utils_1.SecurityUtils.generateSecureId(),
                email: validatedData.email,
                username: validatedData.username,
                passwordHash,
                role: types_1.UserRole.USER,
                subscriptionType: types_1.SubscriptionType.FREE,
                level: 1,
                elo: 1200,
                isActive: true,
                isVerified: false,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            // Sauvegarder l'utilisateur (en production: base de données)
            await AuthService.saveUser(newUser);
            // Générer les tokens JWT
            const tokens = config_1.JwtConfig.generateTokens(newUser.id, newUser.email, newUser.role);
            const userResponse = {
                id: newUser.id,
                email: newUser.email,
                username: newUser.username,
                role: newUser.role,
                subscriptionType: newUser.subscriptionType,
                level: newUser.level,
                elo: newUser.elo,
                isActive: newUser.isActive,
                isVerified: newUser.isVerified,
                createdAt: newUser.createdAt,
                updatedAt: newUser.updatedAt
            };
            utils_2.Logger.info('User registered successfully', {
                userId: newUser.id,
                email: newUser.email,
                action: 'user_registered'
            });
            return { user: userResponse, tokens };
        }
        catch (error) {
            utils_2.Logger.error('Registration failed', {
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
            const validatedData = utils_3.ValidationUtils.validate(utils_3.LoginSchema, loginData);
            // Trouver l'utilisateur par email
            const user = await AuthService.findUserByEmail(validatedData.email);
            if (!user) {
                throw new Error('Invalid credentials');
            }
            // Vérifier si le compte est actif
            if (!user.isActive) {
                throw new Error('Account is deactivated');
            }
            // Vérifier le mot de passe
            const isPasswordValid = await utils_1.SecurityUtils.verifyPassword(validatedData.password, user.passwordHash);
            if (!isPasswordValid) {
                throw new Error('Invalid credentials');
            }
            // Générer les tokens JWT
            const tokens = config_1.JwtConfig.generateTokens(user.id, user.email, user.role);
            const userResponse = {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
                subscriptionType: user.subscriptionType,
                level: user.level,
                elo: user.elo,
                isActive: user.isActive,
                isVerified: user.isVerified,
                createdAt: user.createdAt,
                updatedAt: new Date()
            };
            utils_2.Logger.info('User logged in successfully', {
                userId: user.id,
                email: user.email,
                action: 'user_login'
            });
            return { user: userResponse, tokens };
        }
        catch (error) {
            utils_2.Logger.error('Login failed', {
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
            const payload = config_1.JwtConfig.validateRefreshToken(refreshToken);
            // Vérifier que l'utilisateur existe toujours
            const user = await AuthService.findUserById(payload.userId);
            if (!user || !user.isActive) {
                throw new Error('User not found or inactive');
            }
            // Générer de nouveaux tokens
            const newTokens = config_1.JwtConfig.generateTokens(user.id, user.email, user.role);
            utils_2.Logger.info('Tokens refreshed successfully', {
                userId: user.id,
                action: 'tokens_refreshed'
            });
            return newTokens;
        }
        catch (error) {
            utils_2.Logger.error('Token refresh failed', {
                action: 'token_refresh_failed',
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
            const validatedData = utils_3.ValidationUtils.validate(utils_3.UpdateProfileSchema, profileData);
            const user = await AuthService.findUserById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            // Si changement de mot de passe
            if (validatedData.newPassword) {
                if (!validatedData.currentPassword) {
                    throw new Error('Current password is required');
                }
                const isCurrentPasswordValid = await utils_1.SecurityUtils.verifyPassword(validatedData.currentPassword, user.passwordHash);
                if (!isCurrentPasswordValid) {
                    throw new Error('Current password is incorrect');
                }
                user.passwordHash = await utils_1.SecurityUtils.hashPassword(validatedData.newPassword);
            }
            // Mettre à jour le username si fourni
            if (validatedData.username) {
                const existingUsername = await AuthService.findUserByUsername(validatedData.username);
                if (existingUsername && existingUsername.id !== userId) {
                    throw new Error('Username already taken');
                }
                user.username = validatedData.username;
            }
            user.updatedAt = new Date();
            // Sauvegarder les modifications
            await AuthService.updateUser(user);
            const userResponse = {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
                subscriptionType: user.subscriptionType,
                level: user.level,
                elo: user.elo,
                isActive: user.isActive,
                isVerified: user.isVerified,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            };
            utils_2.Logger.info('Profile updated successfully', {
                userId,
                action: 'profile_updated'
            });
            return userResponse;
        }
        catch (error) {
            utils_2.Logger.error('Profile update failed', {
                userId,
                action: 'profile_update_failed',
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
            const user = await AuthService.findUserById(userId);
            if (!user) {
                return null;
            }
            const userResponse = {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
                subscriptionType: user.subscriptionType,
                level: user.level,
                elo: user.elo,
                isActive: user.isActive,
                isVerified: user.isVerified,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            };
            utils_2.Logger.debug('Profile fetched successfully', {
                userId,
                action: 'profile_fetched'
            });
            return userResponse;
        }
        catch (error) {
            utils_2.Logger.error('Profile fetch failed', {
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
            const user = await AuthService.findUserById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            const newElo = AuthService.calculateElo(user.elo, opponentElo, gameResult);
            user.elo = Math.round(newElo);
            user.updatedAt = new Date();
            await AuthService.updateUser(user);
            utils_2.Logger.info('ELO updated successfully', {
                userId,
                oldElo: user.elo,
                newElo,
                gameResult,
                action: 'elo_updated'
            });
        }
        catch (error) {
            utils_2.Logger.error('ELO update failed', {
                userId,
                action: 'elo_update_failed',
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
            const user = await AuthService.findUserById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            user.isActive = false;
            user.updatedAt = new Date();
            await AuthService.updateUser(user);
            utils_2.Logger.info('Account deactivated successfully', {
                userId,
                action: 'account_deactivated'
            });
        }
        catch (error) {
            utils_2.Logger.error('Account deactivation failed', {
                userId,
                action: 'account_deactivation_failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            throw error;
        }
    }
    // Méthodes privées (en production, ces méthodes interagiraient avec la base de données)
    static async findUserByEmail(email) {
        // Simulation - en production: requête base de données
        utils_2.Logger.debug('Finding user by email', { email, action: 'find_user_by_email' });
        return null;
    }
    static async findUserByUsername(username) {
        // Simulation - en production: requête base de données
        utils_2.Logger.debug('Finding user by username', { username, action: 'find_user_by_username' });
        return null;
    }
    static async findUserById(userId) {
        // Simulation - en production: requête base de données
        utils_2.Logger.debug('Finding user by ID', { userId, action: 'find_user_by_id' });
        return null;
    }
    static async saveUser(user) {
        // Simulation - en production: insertion base de données
        utils_2.Logger.debug('Saving user', { userId: user.id, action: 'save_user' });
    }
    static async updateUser(user) {
        // Simulation - en production: mise à jour base de données
        utils_2.Logger.debug('Updating user', { userId: user.id, action: 'update_user' });
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
//# sourceMappingURL=auth.service.js.map