/**
 * Types fondamentaux pour le jeu de backgammon
 * Architecture propre et typée strictement
 */
export type PlayerId = string;
export type PointId = number;
export type DiceValue = 1 | 2 | 3 | 4 | 5 | 6;
export type GameId = string;
export type UserId = string;
export type MoveId = string;
export declare enum GameStatus {
    WAITING = "WAITING",
    PLAYING = "PLAYING",
    FINISHED = "FINISHED",
    PAUSED = "PAUSED"
}
export declare enum PlayerColor {
    WHITE = "WHITE",
    BLACK = "BLACK"
}
export declare enum GameMode {
    PLAYER_VS_PLAYER = "PLAYER_VS_PLAYER",
    PLAYER_VS_AI = "PLAYER_VS_AI",
    AI_VS_AI = "AI_VS_AI"
}
export declare enum Difficulty {
    EASY = "EASY",
    MEDIUM = "MEDIUM",
    HARD = "HARD",
    EXPERT = "EXPERT"
}
export interface Player {
    readonly id: PlayerId;
    readonly userId: UserId;
    readonly username: string;
    readonly color: PlayerColor;
    readonly elo: number;
    readonly isReady: boolean;
    readonly isHuman?: boolean;
}
export interface Dice {
    readonly values: readonly [DiceValue, DiceValue];
    readonly isDouble: boolean;
    readonly used: readonly boolean[];
}
export interface Point {
    readonly id: PointId;
    readonly tokens: readonly Token[];
    readonly color: PlayerColor | null;
    readonly index: number;
    readonly checkers: number;
    readonly player: PlayerColor | null;
}
export interface Token {
    readonly id: string;
    readonly playerId: PlayerId;
    readonly color: PlayerColor;
    readonly position: PointId;
}
export interface Move {
    readonly id: MoveId;
    readonly playerId: PlayerId;
    readonly from: PointId;
    readonly to: PointId;
    readonly diceUsed: DiceValue;
    readonly timestamp: Date;
    readonly player: PlayerColor;
    readonly diceValue: number;
}
export interface GameState {
    readonly id: GameId;
    readonly status: GameStatus;
    readonly mode: GameMode;
    readonly players: readonly [Player, Player];
    readonly currentPlayerIndex: 0 | 1;
    readonly currentPlayer: PlayerColor;
    readonly board: readonly Point[];
    readonly dice: Dice | null;
    readonly moves: readonly Move[];
    readonly winner: PlayerId | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly settings: GameSettings;
    readonly isRanked: boolean;
    readonly timeLimit?: number;
}
export interface GameSettings {
    readonly difficulty?: Difficulty;
    readonly timeLimit?: number;
    readonly isRanked: boolean;
    readonly allowUndo: boolean;
}
export interface CreateGameRequest {
    readonly mode: GameMode;
    readonly difficulty?: Difficulty;
    readonly isRanked: boolean;
    readonly timeLimit?: number;
}
export interface MakeMoveRequest {
    readonly from: PointId;
    readonly to: PointId;
    readonly diceValue: DiceValue;
}
export interface ApiResponse<T = unknown> {
    readonly success: boolean;
    readonly data?: T;
    readonly error?: string;
    readonly timestamp: Date;
}
export interface Pagination {
    readonly page: number;
    readonly limit: number;
    readonly total: number;
    readonly totalPages: number;
}
export interface GameHistory {
    readonly game: GameState;
    readonly moves: readonly Move[];
    readonly duration: number;
    readonly finalScore: {
        readonly winner: PlayerId;
        readonly points: number;
    };
}
export interface PlayerStats {
    readonly userId: UserId;
    readonly username: string;
    readonly elo: number;
    readonly gamesPlayed: number;
    readonly gamesWon: number;
    readonly gamesLost: number;
    readonly winRate: number;
    readonly averageGameDuration: number;
    readonly bestMove: Move | null;
}
//# sourceMappingURL=game.types.d.ts.map