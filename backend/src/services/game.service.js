"use strict";
/**
 * GameService - Logique métier du backgammon
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameService = void 0;
const types_1 = require("../types");
const utils_1 = require("../utils");
const utils_2 = require("../utils");
const utils_3 = require("../utils");
class GameService {
    /**
     * Créer une nouvelle partie de backgammon
     */
    static createGame(userId, gameData) {
        try {
            const validatedData = utils_3.ValidationUtils.validate(utils_1.CreateGameSchema, gameData);
            const player = {
                id: userId,
                color: types_1.PlayerColor.WHITE,
                isHuman: true
            };
            const opponent = {
                id: 'ai_' + Date.now(),
                color: types_1.PlayerColor.BLACK,
                isHuman: false
            };
            const initialBoard = GameService.createInitialBoard();
            const gameState = {
                id: GameService.generateGameId(),
                status: types_1.GameStatus.WAITING,
                mode: validatedData.mode,
                isRanked: validatedData.isRanked,
                timeLimit: validatedData.timeLimit,
                currentPlayer: types_1.PlayerColor.WHITE,
                players: [player, opponent],
                board: initialBoard,
                dice: { die1: 0, die2: 0 },
                moves: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            utils_2.Logger.info('Game created successfully', {
                gameId: gameState.id,
                userId,
                action: 'game_created',
                mode: validatedData.mode
            });
            return gameState;
        }
        catch (error) {
            utils_2.Logger.error('Failed to create game', {
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
        utils_2.Logger.debug('Dice rolled', {
            gameId: gameState.id,
            dice: { die1, die2 },
            currentPlayer: gameState.currentPlayer
        });
        return updatedState;
    }
    /**
     * Valider et exécuter un mouvement
     */
    static makeMove(gameState, moveData) {
        try {
            const validatedMove = utils_3.ValidationUtils.validate(utils_1.MakeMoveSchema, moveData);
            // Validation du mouvement
            if (!GameService.isValidMove(gameState, validatedMove)) {
                throw new Error('Invalid move');
            }
            // Exécuter le mouvement
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
                updatedState.currentPlayer = updatedState.currentPlayer === types_1.PlayerColor.WHITE
                    ? types_1.PlayerColor.BLACK
                    : types_1.PlayerColor.WHITE;
                updatedState.dice = { die1: 0, die2: 0 };
            }
            // Vérifier la victoire
            const winner = GameService.checkWinner(updatedState);
            if (winner) {
                updatedState.status = types_1.GameStatus.COMPLETED;
                updatedState.winner = winner;
            }
            utils_2.Logger.info('Move executed successfully', {
                gameId: gameState.id,
                move: validatedMove,
                currentPlayer: gameState.currentPlayer
            });
            return updatedState;
        }
        catch (error) {
            utils_2.Logger.error('Failed to execute move', {
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
            // En production, cela viendrait de la base de données
            utils_2.Logger.debug('Fetching game state', { gameId, action: 'fetch_game_state' });
            // Pour l'instant, retourne null (à implémenter avec base de données)
            return null;
        }
        catch (error) {
            utils_2.Logger.error('Failed to fetch game state', {
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
        // Configuration initiale standard du backgammon
        // Pions blancs
        board[1] = { point: 1, checkers: 2, player: types_1.PlayerColor.WHITE };
        board[12] = { point: 12, checkers: 5, player: types_1.PlayerColor.WHITE };
        board[17] = { point: 17, checkers: 3, player: types_1.PlayerColor.WHITE };
        board[19] = { point: 19, checkers: 5, player: types_1.PlayerColor.WHITE };
        // Pions noirs
        board[24] = { point: 24, checkers: 2, player: types_1.PlayerColor.BLACK };
        board[13] = { point: 13, checkers: 5, player: types_1.PlayerColor.BLACK };
        board[8] = { point: 8, checkers: 3, player: types_1.PlayerColor.BLACK };
        board[6] = { point: 6, checkers: 5, player: types_1.PlayerColor.BLACK };
        return board;
    }
    /**
     * Valider si un mouvement est légal
     */
    static isValidMove(gameState, move) {
        const { board, dice, currentPlayer } = gameState;
        // Vérifier si la valeur du dé correspond
        const diceValues = [dice.die1, dice.die2].filter(d => d > 0);
        if (!diceValues.includes(move.diceValue)) {
            return false;
        }
        // Vérifier si le point de départ contient des pions du joueur
        const fromPoint = board[move.from];
        if (!fromPoint || fromPoint.player !== currentPlayer || fromPoint.checkers === 0) {
            return false;
        }
        // Vérifier si le point de destination est valide
        const toPoint = board[move.to];
        if (!toPoint) {
            return false;
        }
        // Vérifier si le mouvement est dans la bonne direction
        const direction = currentPlayer === types_1.PlayerColor.WHITE ? 1 : -1;
        if ((move.to - move.from) * direction !== move.diceValue) {
            return false;
        }
        // Vérifier si la destination est accessible
        if (toPoint.player && toPoint.player !== currentPlayer && toPoint.checkers > 1) {
            return false; // Point bloqué par l'adversaire
        }
        return true;
    }
    /**
     * Exécuter un mouvement sur le plateau
     */
    static executeMove(board, move) {
        const newBoard = board.map(pos => ({ ...pos }));
        // Retirer le pion du point de départ
        const fromPoint = newBoard[move.from];
        if (fromPoint.checkers > 1) {
            fromPoint.checkers--;
        }
        else {
            fromPoint.checkers = 0;
            fromPoint.player = null;
        }
        // Ajouter le pion au point de destination
        const toPoint = newBoard[move.to];
        if (toPoint.player && toPoint.player !== fromPoint.player && toPoint.checkers === 1) {
            // Frapper un pion adverse
            toPoint.player = fromPoint.player;
            // Le pion frappé va au bar (point 0)
            newBoard[0].checkers++;
            newBoard[0].player = toPoint.player === types_1.PlayerColor.WHITE ? types_1.PlayerColor.BLACK : types_1.PlayerColor.WHITE;
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
        const { dice, moves } = gameState;
        const diceValues = [dice.die1, dice.die2].filter(d => d > 0);
        // Si les dés sont les mêmes (double), 4 mouvements sont possibles
        const totalMoves = dice.die1 === dice.die2 ? 4 : 2;
        return moves.length >= totalMoves || !GameService.hasAvailableMoves(gameState);
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
                    const direction = currentPlayer === types_1.PlayerColor.WHITE ? 1 : -1;
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
            // Vérifier si tous les pions du joueur sont sortis (point 25)
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
//# sourceMappingURL=game.service.js.map