/**
 * GameService - Version robuste et sécurisée
 */
interface SimplePlayer {
    id: string;
    color: 'white' | 'black';
    isHuman: boolean;
}
interface SimpleDice {
    die1: number;
    die2: number;
}
interface SimpleMove {
    from: number;
    to: number;
    diceValue: number;
    player: 'white' | 'black';
    timestamp: Date;
}
interface SimpleBoardPosition {
    point: number;
    checkers: number;
    player: 'white' | 'black' | null;
}
interface SimpleGameState {
    id: string;
    status: 'waiting' | 'playing' | 'completed';
    mode: 'pvp' | 'pvc';
    isRanked: boolean;
    timeLimit?: number;
    currentPlayer: 'white' | 'black';
    players: SimplePlayer[];
    board: SimpleBoardPosition[];
    dice: SimpleDice;
    moves: SimpleMove[];
    winner?: SimplePlayer;
    createdAt: Date;
    updatedAt: Date;
}
interface SimpleCreateGameRequest {
    mode: 'pvp' | 'pvc';
    difficulty?: 'easy' | 'medium' | 'hard';
    isRanked: boolean;
    timeLimit?: number;
}
interface SimpleMakeMoveRequest {
    from: number;
    to: number;
    diceValue: number;
}
export declare class GameService {
    /**
     * Créer une nouvelle partie de backgammon
     */
    static createGame(userId: string, gameData: SimpleCreateGameRequest): SimpleGameState;
    /**
     * Lancer les dés pour le tour actuel
     */
    static rollDice(gameState: SimpleGameState): SimpleGameState;
    /**
     * Valider et exécuter un mouvement
     */
    static makeMove(gameState: SimpleGameState, moveData: SimpleMakeMoveRequest): SimpleGameState;
    /**
     * Obtenir l'état actuel du jeu
     */
    static getGameState(gameId: string): SimpleGameState | null;
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
export {};
//# sourceMappingURL=game.simple.d.ts.map