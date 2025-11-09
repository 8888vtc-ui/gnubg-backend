"use strict";
/**
 * Game Routes Simplifiées - Sans middleware externes
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const game_controller_1 = require("../controllers/game.controller");
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
const validateParams = (schema) => (req, res, next) => {
    try {
        req.params = schema.parse(req.params);
        next();
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Paramètres invalides',
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
const gameIdSchema = zod_1.z.object({
    gameId: zod_1.z.string().min(1)
});
// Middleware d'authentification simple
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            error: 'Token d\'authentification requis'
        });
    }
    // Simulation d'utilisateur authentifié
    req.user = {
        id: 'user_123',
        email: 'test@example.com',
        role: 'PLAYER'
    };
    next();
};
/**
 * @route   POST /api/games
 * @desc    Créer une nouvelle partie
 */
router.post('/', authMiddleware, validateBody(createGameSchema), game_controller_1.GameController.createGame);
/**
 * @route   GET /api/games/:gameId
 * @desc    Obtenir l'état d'une partie
 */
router.get('/:gameId', authMiddleware, validateParams(gameIdSchema), game_controller_1.GameController.getGameState);
/**
 * @route   POST /api/games/:gameId/roll
 * @desc    Lancer les dés
 */
router.post('/:gameId/roll', authMiddleware, validateParams(gameIdSchema), game_controller_1.GameController.rollDice);
/**
 * @route   POST /api/games/:gameId/move
 * @desc    Effectuer un mouvement
 */
router.post('/:gameId/move', authMiddleware, validateParams(gameIdSchema), validateBody(makeMoveSchema), game_controller_1.GameController.makeMove);
/**
 * @route   GET /api/games/:gameId/suggestions
 * @desc    Obtenir les suggestions IA
 */
router.get('/:gameId/suggestions', authMiddleware, validateParams(gameIdSchema), game_controller_1.GameController.getMoveSuggestions);
/**
 * @route   GET /api/games/:gameId/evaluate
 * @desc    Évaluer la position
 */
router.get('/:gameId/evaluate', authMiddleware, validateParams(gameIdSchema), game_controller_1.GameController.evaluatePosition);
/**
 * @route   GET /api/games
 * @desc    Liste des parties utilisateur
 */
router.get('/', authMiddleware, game_controller_1.GameController.getUserGames);
exports.default = router;
//# sourceMappingURL=game.routes.simple.js.map