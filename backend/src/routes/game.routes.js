"use strict";
/**
 * Game Routes - Définition des routes API pour les jeux
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const game_controller_1 = require("../controllers/game.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rate_limit_middleware_1 = require("../middleware/rate-limit.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
// Schémas de validation pour les routes
const createGameSchema = zod_1.z.object({
    mode: zod_1.z.enum(['pvp', 'pvc']),
    difficulty: zod_1.z.enum(['easy', 'medium', 'hard']).optional(),
    isRanked: zod_1.z.boolean(),
    timeLimit: zod_1.z.number().positive().optional()
});
const makeMoveSchema = zod_1.z.object({
    from: zod_1.z.number().int().min(0).max(25),
    to: zod_1.z.number().int().min(0).max(25),
    diceValue: zod_1.z.number().int().min(1).max(6)
});
const gameIdParamSchema = zod_1.z.object({
    gameId: zod_1.z.string().min(1, 'ID de partie requis')
});
/**
 * @route   POST /api/games
 * @desc    Créer une nouvelle partie de backgammon
 * @access  Private
 */
router.post('/', auth_middleware_1.authMiddleware, (0, rate_limit_middleware_1.rateLimitMiddleware)({ windowMs: 60 * 1000, max: 10 }), // 10 parties par minute
(0, validation_middleware_1.validationMiddleware)(createGameSchema, 'body'), game_controller_1.GameController.createGame);
/**
 * @route   GET /api/games/:gameId
 * @desc    Obtenir l'état actuel d'une partie
 * @access  Private
 */
router.get('/:gameId', auth_middleware_1.authMiddleware, (0, validation_middleware_1.validationMiddleware)(gameIdParamSchema, 'params'), game_controller_1.GameController.getGameState);
/**
 * @route   POST /api/games/:gameId/roll
 * @desc    Lancer les dés pour une partie
 * @access  Private
 */
router.post('/:gameId/roll', auth_middleware_1.authMiddleware, (0, rate_limit_middleware_1.rateLimitMiddleware)({ windowMs: 60 * 1000, max: 30 }), // 30 lancers par minute
(0, validation_middleware_1.validationMiddleware)(gameIdParamSchema, 'params'), game_controller_1.GameController.rollDice);
/**
 * @route   POST /api/games/:gameId/move
 * @desc    Effectuer un mouvement dans une partie
 * @access  Private
 */
router.post('/:gameId/move', auth_middleware_1.authMiddleware, (0, rate_limit_middleware_1.rateLimitMiddleware)({ windowMs: 60 * 1000, max: 60 }), // 60 mouvements par minute
(0, validation_middleware_1.validationMiddleware)(gameIdParamSchema, 'params'), (0, validation_middleware_1.validationMiddleware)(makeMoveSchema, 'body'), game_controller_1.GameController.makeMove);
/**
 * @route   GET /api/games/:gameId/suggestions
 * @desc    Obtenir les suggestions de mouvements de l'IA GNUBG
 * @access  Private
 */
router.get('/:gameId/suggestions', auth_middleware_1.authMiddleware, (0, rate_limit_middleware_1.rateLimitMiddleware)({ windowMs: 60 * 1000, max: 20 }), // 20 demandes de suggestions par minute
(0, validation_middleware_1.validationMiddleware)(gameIdParamSchema, 'params'), game_controller_1.GameController.getMoveSuggestions);
/**
 * @route   GET /api/games/:gameId/evaluate
 * @desc    Évaluer la position actuelle avec GNUBG
 * @access  Private
 */
router.get('/:gameId/evaluate', auth_middleware_1.authMiddleware, (0, rate_limit_middleware_1.rateLimitMiddleware)({ windowMs: 60 * 1000, max: 15 }), // 15 évaluations par minute
(0, validation_middleware_1.validationMiddleware)(gameIdParamSchema, 'params'), game_controller_1.GameController.evaluatePosition);
/**
 * @route   GET /api/games
 * @desc    Obtenir la liste des parties de l'utilisateur
 * @access  Private
 */
router.get('/', auth_middleware_1.authMiddleware, (0, rate_limit_middleware_1.rateLimitMiddleware)({ windowMs: 60 * 1000, max: 30 }), // 30 requêtes par minute
game_controller_1.GameController.getUserGames);
exports.default = router;
//# sourceMappingURL=game.routes.js.map