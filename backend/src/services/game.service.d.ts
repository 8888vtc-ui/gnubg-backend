/**
 * GameService - Logique métier du backgammon
 */
import { ServiceGameState, CreateGameInput, MakeMoveInput } from '../types';
export declare class GameService {
    /**
     * Créer une nouvelle partie de backgammon
     */
    static createGame(userId: string, gameData: CreateGameInput): ServiceGameState;
    /**
     * Lancer les dés pour le tour actuel
     */
    static rollDice(gameState: GameState): GameState;
    /**
     * Valider et exécuter un mouvement
     */
    static makeMove(gameState: GameState, moveData: MakeMoveInput): GameState;
    /**
     * Obtenir l'état actuel du jeu
     */
    static getGameState(gameId: string): GameState | null;
    /**
     * Créer le plateau initial de backgammon
     */
    private static createInitialBoard;
    /**
     * Valider si un mouvement est légal
     */
    private static isValidMove;
    /**
     * Exécuter un mouvement sur le plateau
     */
    private static executeMove;
    /**
     * Vérifier si le tour est complet
     */
    private static isTurnComplete;
    /**
     * Vérifier s'il reste des mouvements possibles
     */
    private static hasAvailableMoves;
    /**
     * Vérifier si un joueur a gagné
     */
    private static checkWinner;
    /**
     * Générer un ID de partie unique
     */
    private static generateGameId;
}
//# sourceMappingURL=game.service.d.ts.map