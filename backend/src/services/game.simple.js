"use strict";
/**
 * GameService - Version robuste et sécurisée
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameService = void 0;
const logger_utils_1 = require("../utils/logger.utils");
const zod_1 = require("zod");
// Schémas de validation Zod robustes
const CreateGameSchema = zod_1.z.object({
    mode: zod_1.z.enum(['pvp', 'pvc']),
    difficulty: zod_1.z.enum(['easy', 'medium', 'hard']).optional(),
    isRanked: zod_1.z.boolean(),
    timeLimit: zod_1.z.number().positive().optional()
});
const MakeMoveSchema = zod_1.z.object({
    from: zod_1.z.number().int().min(0).max(25),
    to: zod_1.z.number().int().min(0).max(25),
    diceValue: zod_1.z.number().int().min(1).max(6)
});
class GameService {
    /**
     * Créer une nouvelle partie de backgammon
     */
    static createGame(userId, gameData) {
        try {
            // Validation robuste avec Zod
            const validatedData = CreateGameSchema.parse(gameData);
            const player = {
                id: userId,
                color: 'white',
                isHuman: true
            };
            const opponent = {
                id: 'ai_' + Date.now(),
                color: 'black',
                isHuman: false
            };
            const initialBoard = GameService.createInitialBoard();
            const gameState = {
                id: GameService.generateGameId(),
                status: 'waiting',
                mode: validatedData.mode,
                isRanked: validatedData.isRanked,
                timeLimit: validatedData.timeLimit,
                currentPlayer: 'white',
                players: [player, opponent],
                board: initialBoard,
                dice: { die1: 0, die2: 0 },
                moves: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            logger_utils_1.Logger.info('Game created successfully', {
                gameId: gameState.id,
                userId,
                action: 'game_created'
            });
            return gameState;
        }
        catch (error) {
            logger_utils_1.Logger.error('Failed to create game', {
                userId,
                action: 'game_creation_failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            throw error;
        }
    }
    /**
     * Lancer les dés pour le tour actuel
     */
    static rollDice(gameState) {
        const die1 = Math.floor(Math.random() * 6) + 1;
        const die2 = Math.floor(Math.random() * 6) + 1;
        const updatedState = {
            ...gameState,
            dice: { die1, die2 },
            updatedAt: new Date()
        };
        logger_utils_1.Logger.info('Dice rolled', {
            gameId: gameState.id,
            dice: { die1, die2 }
        });
        return updatedState;
    }
    /**
     * Valider et exécuter un mouvement
     */
    static makeMove(gameState, moveData) {
        try {
            // Validation robuste avec Zod
            const validatedMove = MakeMoveSchema.parse(moveData);
            if (!GameService.isValidMove(gameState, validatedMove)) {
                throw new Error('Invalid move: movement violates backgammon rules');
            }
            const newBoard = GameService.executeMove(gameState.board, validatedMove);
            const move = {
                from: validatedMove.from,
                to: validatedMove.to,
                diceValue: validatedMove.diceValue,
                player: gameState.currentPlayer,
                timestamp: new Date()
            };
            const updatedState = {
                ...gameState,
                board: newBoard,
                moves: [...gameState.moves, move],
                updatedAt: new Date()
            };
            // Vérifier si le tour est terminé
            if (GameService.isTurnComplete(updatedState)) {
                updatedState.currentPlayer = updatedState.currentPlayer === 'white' ? 'black' : 'white';
                updatedState.dice = { die1: 0, die2: 0 };
            }
            // Vérifier la victoire
            const winner = GameService.checkWinner(updatedState);
            if (winner) {
                updatedState.status = 'completed';
                updatedState.winner = winner;
            }
            logger_utils_1.Logger.info('Move executed successfully', {
                gameId: gameState.id,
                move: validatedMove
            });
            return updatedState;
        }
        catch (error) {
            logger_utils_1.Logger.error('Failed to execute move', {
                gameId: gameState.id,
                action: 'move_failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            throw error;
        }
    }
    /**
     * Obtenir l'état actuel du jeu
     */
    static getGameState(gameId) {
        try {
            logger_utils_1.Logger.debug('Fetching game state', { gameId, action: 'fetch_game_state' });
            return null;
        }
        catch (error) {
            logger_utils_1.Logger.error('Failed to fetch game state', {
                gameId,
                action: 'fetch_game_state_failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            return null;
        }
    }
    /**
     * Créer le plateau initial de backgammon
     */
    static createInitialBoard() {
        const board = Array(26).fill(null).map((_, index) => ({
            point: index,
            checkers: 0,
            player: null
        }));
        // Configuration initiale standard
        board[1] = { point: 1, checkers: 2, player: 'white' };
        board[12] = { point: 12, checkers: 5, player: 'white' };
        board[17] = { point: 17, checkers: 3, player: 'white' };
        board[19] = { point: 19, checkers: 5, player: 'white' };
        board[24] = { point: 24, checkers: 2, player: 'black' };
        board[13] = { point: 13, checkers: 5, player: 'black' };
        board[8] = { point: 8, checkers: 3, player: 'black' };
        board[6] = { point: 6, checkers: 5, player: 'black' };
        return board;
    }
    /**
     * Valider si un mouvement est légal
     */
    static isValidMove(gameState, move) {
        const { board, dice, currentPlayer } = gameState;
        const diceValues = [dice.die1, dice.die2].filter(d => d > 0);
        if (!diceValues.includes(move.diceValue)) {
            return false;
        }
        const fromPoint = board[move.from];
        if (!fromPoint || fromPoint.player !== currentPlayer || fromPoint.checkers === 0) {
            return false;
        }
        const toPoint = board[move.to];
        if (!toPoint) {
            return false;
        }
        const direction = currentPlayer === 'white' ? 1 : -1;
        if ((move.to - move.from) * direction !== move.diceValue) {
            return false;
        }
        if (toPoint.player && toPoint.player !== currentPlayer && toPoint.checkers > 1) {
            return false;
        }
        return true;
    }
    /**
     * Exécuter un mouvement sur le plateau
     */
    static executeMove(board, move) {
        const newBoard = board.map(pos => ({ ...pos }));
        const fromPoint = newBoard[move.from];
        if (fromPoint.checkers > 1) {
            fromPoint.checkers--;
        }
        else {
            fromPoint.checkers = 0;
            fromPoint.player = null;
        }
        const toPoint = newBoard[move.to];
        if (toPoint.player && toPoint.player !== fromPoint.player && toPoint.checkers === 1) {
            toPoint.player = fromPoint.player;
            newBoard[0].checkers++;
            newBoard[0].player = toPoint.player === 'white' ? 'black' : 'white';
        }
        else {
            toPoint.checkers++;
            toPoint.player = fromPoint.player;
        }
        return newBoard;
    }
    /**
     * Vérifier si le tour est complet
     */
    static isTurnComplete(gameState) {
        const { dice } = gameState;
        const diceValues = [dice.die1, dice.die2].filter(d => d > 0);
        const totalMoves = dice.die1 === dice.die2 ? 4 : 2;
        return gameState.moves.length >= totalMoves || !GameService.hasAvailableMoves(gameState);
    }
    /**
     * Vérifier s'il reste des mouvements possibles
     */
    static hasAvailableMoves(gameState) {
        const { board, dice, currentPlayer } = gameState;
        const diceValues = [dice.die1, dice.die2].filter(d => d > 0);
        for (const dieValue of diceValues) {
            for (let i = 0; i < board.length; i++) {
                const position = board[i];
                if (position && position.player === currentPlayer && position.checkers > 0) {
                    const direction = currentPlayer === 'white' ? 1 : -1;
                    const targetPoint = i + (dieValue * direction);
                    if (targetPoint >= 0 && targetPoint <= 25) {
                        const target = board[targetPoint];
                        if (target && (!target.player || target.player === currentPlayer || target.checkers <= 1)) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }
    /**
     * Vérifier si un joueur a gagné
     */
    static checkWinner(gameState) {
        const { board, players } = gameState;
        for (const player of players) {
            const playerCheckers = board.filter(pos => pos && pos.player === player.color && pos.checkers > 0);
            if (playerCheckers.length === 0 || (playerCheckers.length === 1 && playerCheckers[0] && playerCheckers[0].point === 25)) {
                return player;
            }
        }
        return null;
    }
    /**
     * Générer un ID de partie unique
     */
    static generateGameId() {
        return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
exports.GameService = GameService;
//# sourceMappingURL=game.simple.js.map