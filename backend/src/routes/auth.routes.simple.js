"use strict";
/**
 * Auth Routes Simplifiées - Sans middleware externes
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
// Middleware de validation simple
const validateBody = (schema) => (req, res, next) => {
    try {
        req.body = schema.parse(req.body);
        next();
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Données invalides',
                details: error.issues
            });
        }
        return res.status(500).json({
            success: false,
            error: 'Erreur de validation'
        });
    }
};
const validateQuery = (schema) => (req, res, next) => {
    try {
        req.query = schema.parse(req.query);
        next();
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Paramètres de requête invalides',
                details: error.issues
            });
        }
        return res.status(500).json({
            success: false,
            error: 'Erreur de validation'
        });
    }
};
// Schémas de validation
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    username: zod_1.z.string().min(3)
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1)
});
const refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1)
});
const updateProfileSchema = zod_1.z.object({
    username: zod_1.z.string().min(3).max(20).optional(),
    currentPassword: zod_1.z.string().min(1).optional(),
    newPassword: zod_1.z.string().min(8).optional()
});
const emailCheckSchema = zod_1.z.object({
    email: zod_1.z.string().email()
});
const usernameCheckSchema = zod_1.z.object({
    username: zod_1.z.string().min(3)
});
/**
 * @route   POST /api/auth/register
 * @desc    Inscription
 */
router.post('/register', validateBody(registerSchema), auth_controller_1.AuthController.register);
/**
 * @route   POST /api/auth/login
 * @desc    Connexion
 */
router.post('/login', validateBody(loginSchema), auth_controller_1.AuthController.login);
/**
 * @route   POST /api/auth/refresh
 * @desc    Rafraîchir tokens
 */
router.post('/refresh', validateBody(refreshTokenSchema), auth_controller_1.AuthController.refreshTokens);
/**
 * @route   GET /api/auth/profile
 * @desc    Obtenir profil
 */
router.get('/profile', auth_controller_1.AuthController.getProfile);
/**
 * @route   PUT /api/auth/profile
 * @desc    Mettre à jour profil
 */
router.put('/profile', validateBody(updateProfileSchema), auth_controller_1.AuthController.updateProfile);
/**
 * @route   POST /api/auth/logout
 * @desc    Déconnexion
 */
router.post('/logout', auth_controller_1.AuthController.logout);
/**
 * @route   DELETE /api/auth/account
 * @desc    Désactiver compte
 */
router.delete('/account', auth_controller_1.AuthController.deactivateAccount);
/**
 * @route   GET /api/auth/check-email
 * @desc    Vérifier email
 */
router.get('/check-email', validateQuery(emailCheckSchema), auth_controller_1.AuthController.checkEmailAvailability);
/**
 * @route   GET /api/auth/check-username
 * @desc    Vérifier username
 */
router.get('/check-username', validateQuery(usernameCheckSchema), auth_controller_1.AuthController.checkUsernameAvailability);
exports.default = router;
//# sourceMappingURL=auth.routes.simple.js.map