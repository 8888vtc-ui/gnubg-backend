"use strict";
/**
 * GameController - API REST pour la gestion des jeux
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameController = void 0;
const game_simple_1 = require("../services/game.simple");
const auth_service_robust_1 = require("../services/auth.service.robust");
const gnubg_service_robust_1 = require("../services/gnubg.service.robust");
const logger_utils_1 = require("../utils/logger.utils");
const zod_1 = require("zod");
// Schémas de validation pour les requêtes API
const CreateGameRequestSchema = zod_1.z.object({
    mode: zod_1.z.enum(['pvp', 'pvc']),
    difficulty: zod_1.z.enum(['easy', 'medium', 'hard']).optional(),
    isRanked: zod_1.z.boolean(),
    timeLimit: zod_1.z.number().positive().optional()
});
const MakeMoveRequestSchema = zod_1.z.object({
    from: zod_1.z.number().int().min(0).max(25),
    to: zod_1.z.number().int().min(0).max(25),
    diceValue: zod_1.z.number().int().min(1).max(6)
});
const RollDiceRequestSchema = zod_1.z.object({
    gameId: zod_1.z.string().min(1)
});
class GameController {
    /**
     * Créer une nouvelle partie
     */
    static async createGame(req, res) {
        try {
            // Validation de la requête
            const validatedData = CreateGameRequestSchema.parse(req.body);
            // Récupérer l'utilisateur depuis le JWT (middleware d'auth)
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ error: 'Utilisateur non authentifié' });
                return;
            }
            // Créer la partie via GameService
            const gameState = game_simple_1.GameService.createGame(userId, validatedData);
            logger_utils_1.Logger.info('Game created via API', {
                gameId: gameState.id,
                userId,
                mode: validatedData.mode,
                action: 'api_game_created'
            });
            res.status(201).json({
                success: true,
                data: {
                    gameId: gameState.id,
                    status: gameState.status,
                    mode: gameState.mode,
                    currentPlayer: gameState.currentPlayer,
                    players: gameState.players,
                    board: gameState.board,
                    isRanked: gameState.isRanked,
                    timeLimit: gameState.timeLimit,
                    createdAt: gameState.createdAt
                }
            });
        }
        catch (error) {
            logger_utils_1.Logger.error('API create game failed', {
                userId: req.user?.id,
                action: 'api_create_game_failed',
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
                error: 'Erreur serveur lors de la création de la partie'
            });
        }
    }
    /**
     * Lancer les dés
     */
    static async rollDice(req, res) {
        try {
            const { gameId } = RollDiceRequestSchema.parse(req.params);
            // Récupérer l'état actuel du jeu
            const currentGameState = game_simple_1.GameService.getGameState(gameId);
            if (!currentGameState) {
                res.status(404).json({
                    success: false,
                    error: 'Partie non trouvée'
                });
                return;
            }
            // Lancer les dés
            const updatedGameState = game_simple_1.GameService.rollDice(currentGameState);
            logger_utils_1.Logger.info('Dice rolled via API', {
                gameId,
                dice: updatedGameState.dice,
                action: 'api_dice_rolled'
            });
            res.status(200).json({
                success: true,
                data: {
                    gameId: updatedGameState.id,
                    dice: updatedGameState.dice,
                    currentPlayer: updatedGameState.currentPlayer,
                    updatedAt: updatedGameState.updatedAt
                }
            });
        }
        catch (error) {
            logger_utils_1.Logger.error('API roll dice failed', {
                gameId: req.params.gameId,
                action: 'api_roll_dice_failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({
                    success: false,
                    error: 'ID de partie invalide',
                    details: error.errors
                });
                return;
            }
            res.status(500).json({
                success: false,
                error: 'Erreur serveur lors du lancer des dés'
            });
        }
    }
    /**
     * Effectuer un mouvement
     */
    static async makeMove(req, res) {
        try {
            const { gameId } = RollDiceRequestSchema.parse(req.params);
            const moveData = MakeMoveRequestSchema.parse(req.body);
            // Récupérer l'état actuel du jeu
            const currentGameState = game_simple_1.GameService.getGameState(gameId);
            if (!currentGameState) {
                res.status(404).json({
                    success: false,
                    error: 'Partie non trouvée'
                });
                return;
            }
            // Effectuer le mouvement
            const updatedGameState = game_simple_1.GameService.makeMove(currentGameState, moveData);
            // Si la partie est terminée, mettre à jour le ELO
            if (updatedGameState.status === 'completed' && updatedGameState.winner) {
                try {
                    const userId = req.user?.id;
                    const opponentElo = 1200; // ELO par défaut pour l'IA
                    if (userId && updatedGameState.winner.id === userId) {
                        await auth_service_robust_1.AuthService.updateElo(userId, 'win', opponentElo);
                    }
                    else if (userId) {
                        await auth_service_robust_1.AuthService.updateElo(userId, 'loss', opponentElo);
                    }
                }
                catch (eloError) {
                    logger_utils_1.Logger.warn('ELO update failed after game completion', {
                        gameId,
                        error: eloError instanceof Error ? eloError.message : 'Unknown error'
                    });
                }
            }
            logger_utils_1.Logger.info('Move executed via API', {
                gameId,
                move: moveData,
                gameStatus: updatedGameState.status,
                action: 'api_move_executed'
            });
            res.status(200).json({
                success: true,
                data: {
                    gameId: updatedGameState.id,
                    board: updatedGameState.board,
                    moves: updatedGameState.moves,
                    currentPlayer: updatedGameState.currentPlayer,
                    status: updatedGameState.status,
                    winner: updatedGameState.winner,
                    updatedAt: updatedGameState.updatedAt
                }
            });
        }
        catch (error) {
            logger_utils_1.Logger.error('API make move failed', {
                gameId: req.params.gameId,
                action: 'api_make_move_failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({
                    success: false,
                    error: 'Données de mouvement invalides',
                    details: error.errors
                });
                return;
            }
            res.status(500).json({
                success: false,
                error: 'Erreur serveur lors du mouvement'
            });
        }
    }
    /**
     * Obtenir l'état actuel d'une partie
     */
    static async getGameState(req, res) {
        try {
            const { gameId } = RollDiceRequestSchema.parse(req.params);
            const gameState = game_simple_1.GameService.getGameState(gameId);
            if (!gameState) {
                res.status(404).json({
                    success: false,
                    error: 'Partie non trouvée'
                });
                return;
            }
            logger_utils_1.Logger.debug('Game state fetched via API', {
                gameId,
                status: gameState.status,
                action: 'api_game_state_fetched'
            });
            res.status(200).json({
                success: true,
                data: {
                    gameId: gameState.id,
                    status: gameState.status,
                    mode: gameState.mode,
                    currentPlayer: gameState.currentPlayer,
                    players: gameState.players,
                    board: gameState.board,
                    dice: gameState.dice,
                    moves: gameState.moves,
                    winner: gameState.winner,
                    isRanked: gameState.isRanked,
                    timeLimit: gameState.timeLimit,
                    createdAt: gameState.createdAt,
                    updatedAt: gameState.updatedAt
                }
            });
        }
        catch (error) {
            logger_utils_1.Logger.error('API get game state failed', {
                gameId: req.params.gameId,
                action: 'api_get_game_state_failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({
                    success: false,
                    error: 'ID de partie invalide',
                    details: error.errors
                });
                return;
            }
            res.status(500).json({
                success: false,
                error: 'Erreur serveur lors de la récupération de l\'état de jeu'
            });
        }
    }
    /**
     * Obtenir les suggestions de mouvements de l'IA GNUBG
     */
    static async getMoveSuggestions(req, res) {
        try {
            const { gameId } = RollDiceRequestSchema.parse(req.params);
            const gameState = game_simple_1.GameService.getGameState(gameId);
            if (!gameState) {
                res.status(404).json({
                    success: false,
                    error: 'Partie non trouvée'
                });
                return;
            }
            // Convertir l'état du jeu en format GNUBG
            const boardState = GameController.convertBoardToGnubgFormat(gameState.board);
            const suggestions = await gnubg_service_robust_1.GnubgService.getBestMoves(boardState, [gameState.dice.die1, gameState.dice.die2], gameState.currentPlayer);
            logger_utils_1.Logger.info('Move suggestions fetched via API', {
                gameId,
                currentPlayer: gameState.currentPlayer,
                dice: gameState.dice,
                suggestionsCount: suggestions.length,
                action: 'api_move_suggestions_fetched'
            });
            res.status(200).json({
                success: true,
                data: {
                    gameId,
                    currentPlayer: gameState.currentPlayer,
                    dice: gameState.dice,
                    suggestions: suggestions.map(suggestion => ({
                        move: suggestion.move,
                        equity: suggestion.equity,
                        winProbability: suggestion.winProbability,
                        rank: suggestion.rank,
                        isBest: suggestion.isBest
                    }))
                }
            });
        }
        catch (error) {
            logger_utils_1.Logger.error('API get move suggestions failed', {
                gameId: req.params.gameId,
                action: 'api_get_move_suggestions_failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({
                    success: false,
                    error: 'ID de partie invalide',
                    details: error.errors
                });
                return;
            }
            res.status(500).json({
                success: false,
                error: 'Erreur serveur lors de la récupération des suggestions de mouvements'
            });
        }
    }
    /**
     * Évaluer la position actuelle avec GNUBG
     */
    static async evaluatePosition(req, res) {
        try {
            const { gameId } = RollDiceRequestSchema.parse(req.params);
            const gameState = game_simple_1.GameService.getGameState(gameId);
            if (!gameState) {
                res.status(404).json({
                    success: false,
                    error: 'Partie non trouvée'
                });
                return;
            }
            const boardState = GameController.convertBoardToGnubgFormat(gameState.board);
            const evaluation = await gnubg_service_robust_1.GnubgService.evaluatePosition(boardState, gameState.currentPlayer);
            logger_utils_1.Logger.info('Position evaluated via API', {
                gameId,
                currentPlayer: gameState.currentPlayer,
                winProbability: evaluation.winProbability,
                equity: evaluation.equity,
                action: 'api_position_evaluated'
            });
            res.status(200).json({
                success: true,
                data: {
                    gameId,
                    currentPlayer: gameState.currentPlayer,
                    evaluation: {
                        winProbability: evaluation.winProbability,
                        equity: evaluation.equity,
                        cubefulEquity: evaluation.cubefulEquity,
                        marketWindow: evaluation.marketWindow
                    }
                }
            });
        }
        catch (error) {
            logger_utils_1.Logger.error('API evaluate position failed', {
                gameId: req.params.gameId,
                action: 'api_evaluate_position_failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({
                    success: false,
                    error: 'ID de partie invalide',
                    details: error.errors
                });
                return;
            }
            res.status(500).json({
                success: false,
                error: 'Erreur serveur lors de l\'évaluation de la position'
            });
        }
    }
    /**
     * Liste des parties de l'utilisateur
     */
    static async getUserGames(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ error: 'Utilisateur non authentifié' });
                return;
            }
            // Pour l'instant, retourne une liste vide (à implémenter avec base de données)
            const userGames = [];
            logger_utils_1.Logger.info('User games fetched via API', {
                userId,
                gamesCount: userGames.length,
                action: 'api_user_games_fetched'
            });
            res.status(200).json({
                success: true,
                data: {
                    games: userGames,
                    count: userGames.length
                }
            });
        }
        catch (error) {
            logger_utils_1.Logger.error('API get user games failed', {
                userId: req.user?.id,
                action: 'api_get_user_games_failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            res.status(500).json({
                success: false,
                error: 'Erreur serveur lors de la récupération des parties'
            });
        }
    }
    /**
     * Convertir le plateau en format GNUBG
     */
    static convertBoardToGnubgFormat(board) {
        // Format GNUBG: position:point1,point2,...,point24
        // Point positif = pions blancs, négatif = pions noirs
        const gnubgBoard = Array(24).fill(0);
        board.forEach((position, index) => {
            if (index > 0 && index <= 24) {
                if (position.player === 'white') {
                    gnubgBoard[index - 1] = position.checkers;
                }
                else if (position.player === 'black') {
                    gnubgBoard[index - 1] = -position.checkers;
                }
            }
        });
        return gnubgBoard.join(':');
    }
}
exports.GameController = GameController;
//# sourceMappingURL=game.controller.js.map