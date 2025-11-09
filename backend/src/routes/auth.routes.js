"use strict";
/**
 * Auth Routes - Définition des routes API pour l'authentification
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const rate_limit_middleware_1 = require("../middleware/rate-limit.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
// Schémas de validation pour les routes
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email invalide'),
    password: zod_1.z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    username: zod_1.z.string().min(3, 'Le username doit contenir au moins 3 caractères')
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email invalide'),
    password: zod_1.z.string().min(1, 'Le mot de passe est requis')
});
const refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Le refresh token est requis')
});
const updateProfileSchema = zod_1.z.object({
    username: zod_1.z.string().min(3).max(20).optional(),
    currentPassword: zod_1.z.string().min(1).optional(),
    newPassword: zod_1.z.string().min(8).optional()
});
/**
 * @route   POST /api/auth/register
 * @desc    Inscription d'un nouvel utilisateur
 * @access  Public
 */
router.post('/register', (0, rate_limit_middleware_1.rateLimitMiddleware)({ windowMs: 15 * 60 * 1000, max: 5 }), // 5 inscriptions par 15 minutes
(0, validation_middleware_1.validationMiddleware)(registerSchema, 'body'), auth_controller_1.AuthController.register);
/**
 * @route   POST /api/auth/login
 * @desc    Connexion d'un utilisateur
 * @access  Public
 */
router.post('/login', (0, rate_limit_middleware_1.rateLimitMiddleware)({ windowMs: 15 * 60 * 1000, max: 10 }), // 10 connexions par 15 minutes
(0, validation_middleware_1.validationMiddleware)(loginSchema, 'body'), auth_controller_1.AuthController.login);
/**
 * @route   POST /api/auth/refresh
 * @desc    Rafraîchir les tokens JWT
 * @access  Public
 */
router.post('/refresh', (0, rate_limit_middleware_1.rateLimitMiddleware)({ windowMs: 60 * 1000, max: 20 }), // 20 rafraîchissements par minute
(0, validation_middleware_1.validationMiddleware)(refreshTokenSchema, 'body'), auth_controller_1.AuthController.refreshTokens);
/**
 * @route   GET /api/auth/profile
 * @desc    Obtenir le profil utilisateur
 * @access  Private
 */
router.get('/profile', (0, rate_limit_middleware_1.rateLimitMiddleware)({ windowMs: 60 * 1000, max: 30 }), // 30 requêtes par minute
auth_controller_1.AuthController.getProfile);
/**
 * @route   PUT /api/auth/profile
 * @desc    Mettre à jour le profil utilisateur
 * @access  Private
 */
router.put('/profile', (0, rate_limit_middleware_1.rateLimitMiddleware)({ windowMs: 60 * 1000, max: 10 }), // 10 mises à jour par minute
(0, validation_middleware_1.validationMiddleware)(updateProfileSchema, 'body'), auth_controller_1.AuthController.updateProfile);
/**
 * @route   POST /api/auth/logout
 * @desc    Déconnexion d'un utilisateur
 * @access  Private
 */
router.post('/logout', (0, rate_limit_middleware_1.rateLimitMiddleware)({ windowMs: 60 * 1000, max: 10 }), // 10 déconnexions par minute
auth_controller_1.AuthController.logout);
/**
 * @route   DELETE /api/auth/account
 * @desc    Désactiver le compte utilisateur
 * @access  Private
 */
router.delete('/account', (0, rate_limit_middleware_1.rateLimitMiddleware)({ windowMs: 60 * 1000, max: 3 }), // 3 désactivations par minute
auth_controller_1.AuthController.deactivateAccount);
/**
 * @route   GET /api/auth/check-email
 * @desc    Vérifier si un email est disponible
 * @access  Public
 */
router.get('/check-email', (0, rate_limit_middleware_1.rateLimitMiddleware)({ windowMs: 60 * 1000, max: 20 }), // 20 vérifications par minute
auth_controller_1.AuthController.checkEmailAvailability);
/**
 * @route   GET /api/auth/check-username
 * @desc    Vérifier si un username est disponible
 * @access  Public
 */
router.get('/check-username', (0, rate_limit_middleware_1.rateLimitMiddleware)({ windowMs: 60 * 1000, max: 20 }), // 20 vérifications par minute
auth_controller_1.AuthController.checkUsernameAvailability);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map