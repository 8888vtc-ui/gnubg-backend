"use strict";
/**
 * AuthController - API REST pour l'authentification
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_robust_1 = require("../services/auth.service.robust");
const logger_utils_1 = require("../utils/logger.utils");
const zod_1 = require("zod");
// Schémas de validation pour les requêtes API
const RegisterRequestSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email invalide'),
    password: zod_1.z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    username: zod_1.z.string().min(3, 'Le username doit contenir au moins 3 caractères')
});
const LoginRequestSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email invalide'),
    password: zod_1.z.string().min(1, 'Le mot de passe est requis')
});
const UpdateProfileRequestSchema = zod_1.z.object({
    username: zod_1.z.string().min(3).max(20).optional(),
    currentPassword: zod_1.z.string().min(1).optional(),
    newPassword: zod_1.z.string().min(8).optional()
});
const RefreshTokenRequestSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Le refresh token est requis')
});
class AuthController {
    /**
     * Inscription d'un nouvel utilisateur
     */
    static async register(req, res) {
        try {
            // Validation de la requête
            const validatedData = RegisterRequestSchema.parse(req.body);
            // Appeler AuthService pour l'inscription
            const result = await auth_service_robust_1.AuthService.register(validatedData);
            logger_utils_1.Logger.info('User registered via API', {
                userId: result.user.id,
                email: result.user.email,
                action: 'api_user_registered'
            });
            res.status(201).json({
                success: true,
                message: 'Inscription réussie',
                data: {
                    user: result.user,
                    tokens: result.tokens
                }
            });
        }
        catch (error) {
            logger_utils_1.Logger.error('API register failed', {
                email: req.body.email,
                action: 'api_register_failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({
                    success: false,
                    error: 'Données invalides',
                    details: error.issues
                });
                return;
            }
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Erreur serveur lors de l\'inscription'
            });
        }
    }
    /**
     * Connexion d'un utilisateur
     */
    static async login(req, res) {
        try {
            // Validation de la requête
            const validatedData = LoginRequestSchema.parse(req.body);
            // Appeler AuthService pour la connexion
            const result = await auth_service_robust_1.AuthService.login(validatedData);
            logger_utils_1.Logger.info('User logged in via API', {
                userId: result.user.id,
                email: result.user.email,
                action: 'api_user_login'
            });
            res.status(200).json({
                success: true,
                message: 'Connexion réussie',
                data: {
                    user: result.user,
                    tokens: result.tokens
                }
            });
        }
        catch (error) {
            logger_utils_1.Logger.error('API login failed', {
                email: req.body.email,
                action: 'api_login_failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({
                    success: false,
                    error: 'Données invalides',
                    details: error.issues
                });
                return;
            }
            res.status(401).json({
                success: false,
                error: error instanceof Error ? error.message : 'Email ou mot de passe incorrect'
            });
        }
    }
    /**
     * Rafraîchir les tokens JWT
     */
    static async refreshTokens(req, res) {
        try {
            // Validation de la requête
            const { refreshToken } = RefreshTokenRequestSchema.parse(req.body);
            // Appeler AuthService pour rafraîchir les tokens
            const tokens = await auth_service_robust_1.AuthService.refreshTokens(refreshToken);
            logger_utils_1.Logger.info('Tokens refreshed via API', {
                action: 'api_tokens_refreshed'
            });
            res.status(200).json({
                success: true,
                message: 'Tokens rafraîchis avec succès',
                data: {
                    tokens
                }
            });
        }
        catch (error) {
            logger_utils_1.Logger.error('API refresh tokens failed', {
                action: 'api_refresh_tokens_failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({
                    success: false,
                    error: 'Données invalides',
                    details: error.issues
                });
                return;
            }
            res.status(401).json({
                success: false,
                error: error instanceof Error ? error.message : 'Token de rafraîchissement invalide'
            });
        }
    }
    /**
     * Obtenir le profil utilisateur
     */
    static async getProfile(req, res) {
        try {
            // Récupérer l'utilisateur depuis le JWT (middleware d'auth)
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: 'Utilisateur non authentifié'
                });
                return;
            }
            // Appeler AuthService pour obtenir le profil
            const user = await auth_service_robust_1.AuthService.getProfile(userId);
            if (!user) {
                res.status(404).json({
                    success: false,
                    error: 'Utilisateur non trouvé'
                });
                return;
            }
            logger_utils_1.Logger.info('Profile fetched via API', {
                userId,
                action: 'api_profile_fetched'
            });
            res.status(200).json({
                success: true,
                data: {
                    user
                }
            });
        }
        catch (error) {
            logger_utils_1.Logger.error('API get profile failed', {
                userId: req.user?.id,
                action: 'api_get_profile_failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            res.status(500).json({
                success: false,
                error: 'Erreur serveur lors de la récupération du profil'
            });
        }
    }
    /**
     * Mettre à jour le profil utilisateur
     */
    static async updateProfile(req, res) {
        try {
            // Récupérer l'utilisateur depuis le JWT (middleware d'auth)
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: 'Utilisateur non authentifié'
                });
                return;
            }
            // Validation de la requête
            const validatedData = UpdateProfileRequestSchema.parse(req.body);
            // Appeler AuthService pour mettre à jour le profil
            const updatedUser = await auth_service_robust_1.AuthService.updateProfile(userId, validatedData);
            logger_utils_1.Logger.info('Profile updated via API', {
                userId,
                action: 'api_profile_updated'
            });
            res.status(200).json({
                success: true,
                message: 'Profil mis à jour avec succès',
                data: {
                    user: updatedUser
                }
            });
        }
        catch (error) {
            logger_utils_1.Logger.error('API update profile failed', {
                userId: req.user?.id,
                action: 'api_update_profile_failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({
                    success: false,
                    error: 'Données invalides',
                    details: error.issues
                });
                return;
            }
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Erreur serveur lors de la mise à jour du profil'
            });
        }
    }
    /**
     * Déconnexion (révocation des tokens)
     */
    static async logout(req, res) {
        try {
            // Récupérer l'utilisateur depuis le JWT (middleware d'auth)
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: 'Utilisateur non authentifié'
                });
                return;
            }
            // Pour l'instant, on simule la déconnexion
            // En production, on pourrait ajouter les tokens à une blacklist
            logger_utils_1.Logger.info('User logged out via API', {
                userId,
                action: 'api_user_logout'
            });
            res.status(200).json({
                success: true,
                message: 'Déconnexion réussie'
            });
        }
        catch (error) {
            logger_utils_1.Logger.error('API logout failed', {
                userId: req.user?.id,
                action: 'api_logout_failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            res.status(500).json({
                success: false,
                error: 'Erreur serveur lors de la déconnexion'
            });
        }
    }
    /**
     * Désactiver le compte utilisateur
     */
    static async deactivateAccount(req, res) {
        try {
            // Récupérer l'utilisateur depuis le JWT (middleware d'auth)
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: 'Utilisateur non authentifié'
                });
                return;
            }
            // Appeler AuthService pour désactiver le compte
            await auth_service_robust_1.AuthService.deactivateAccount(userId);
            logger_utils_1.Logger.info('Account deactivated via API', {
                userId,
                action: 'api_account_deactivated'
            });
            res.status(200).json({
                success: true,
                message: 'Compte désactivé avec succès'
            });
        }
        catch (error) {
            logger_utils_1.Logger.error('API deactivate account failed', {
                userId: req.user?.id,
                action: 'api_deactivate_account_failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Erreur serveur lors de la désactivation du compte'
            });
        }
    }
    /**
     * Vérifier si l'email est disponible
     */
    static async checkEmailAvailability(req, res) {
        try {
            const { email } = req.query;
            if (!email || typeof email !== 'string') {
                res.status(400).json({
                    success: false,
                    error: 'Email requis'
                });
                return;
            }
            // Pour l'instant, on simule la vérification
            // En production, on vérifierait dans la base de données
            const isAvailable = !email.includes('taken'); // Simulation simple
            logger_utils_1.Logger.debug('Email availability checked via API', {
                email,
                isAvailable,
                action: 'api_email_availability_checked'
            });
            res.status(200).json({
                success: true,
                data: {
                    email,
                    isAvailable
                }
            });
        }
        catch (error) {
            logger_utils_1.Logger.error('API check email availability failed', {
                email: req.query.email,
                action: 'api_check_email_availability_failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            res.status(500).json({
                success: false,
                error: 'Erreur serveur lors de la vérification de la disponibilité de l\'email'
            });
        }
    }
    /**
     * Vérifier si le username est disponible
     */
    static async checkUsernameAvailability(req, res) {
        try {
            const { username } = req.query;
            if (!username || typeof username !== 'string') {
                res.status(400).json({
                    success: false,
                    error: 'Username requis'
                });
                return;
            }
            // Pour l'instant, on simule la vérification
            const isAvailable = !username.includes('taken'); // Simulation simple
            logger_utils_1.Logger.debug('Username availability checked via API', {
                username,
                isAvailable,
                action: 'api_username_availability_checked'
            });
            res.status(200).json({
                success: true,
                data: {
                    username,
                    isAvailable
                }
            });
        }
        catch (error) {
            logger_utils_1.Logger.error('API check username availability failed', {
                username: req.query.username,
                action: 'api_check_username_availability_failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            res.status(500).json({
                success: false,
                error: 'Erreur serveur lors de la vérification de la disponibilité du username'
            });
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map