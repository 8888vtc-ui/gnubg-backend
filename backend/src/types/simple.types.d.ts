/**
 * Types simplifiés pour éviter les conflits et rendre le développement plus rapide
 */
export declare enum SimpleGameStatus {
    WAITING = "waiting",
    PLAYING = "playing",
    COMPLETED = "completed"
}
export declare enum SimplePlayerColor {
    WHITE = "white",
    BLACK = "black"
}
export declare enum SimpleGameMode {
    PVP = "pvp",
    PVC = "pvc"
}
export declare enum SimpleDifficulty {
    EASY = "easy",
    MEDIUM = "medium",
    HARD = "hard"
}
export declare enum SimpleUserRole {
    USER = "user",
    ADMIN = "admin"
}
export declare enum SimpleSubscriptionType {
    FREE = "free",
    PREMIUM = "premium"
}
export interface SimpleUser {
    id: string;
    email: string;
    username: string;
    passwordHash: string;
    role: SimpleUserRole;
    subscription: SimpleSubscriptionType;
    level: number;
    elo: number;
    isActive: boolean;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface SimplePlayer {
    id: string;
    color: SimplePlayerColor;
    isHuman: boolean;
}
export interface SimpleDice {
    die1: number;
    die2: number;
}
export interface SimpleMove {
    from: number;
    to: number;
    diceValue: number;
    player: SimplePlayerColor;
    timestamp: Date;
}
export interface SimpleBoardPosition {
    point: number;
    checkers: number;
    player: SimplePlayerColor | null;
}
export interface SimpleGameState {
    id: string;
    status: SimpleGameStatus;
    mode: SimpleGameMode;
    isRanked: boolean;
    timeLimit?: number;
    currentPlayer: SimplePlayerColor;
    players: SimplePlayer[];
    board: SimpleBoardPosition[];
    dice: SimpleDice;
    moves: SimpleMove[];
    winner?: SimplePlayer;
    createdAt: Date;
    updatedAt: Date;
}
export interface SimpleCreateGameRequest {
    mode: SimpleGameMode;
    difficulty?: SimpleDifficulty;
    isRanked: boolean;
    timeLimit?: number;
}
export interface SimpleMakeMoveRequest {
    from: number;
    to: number;
    diceValue: number;
}
export interface SimpleRegisterRequest {
    email: string;
    password: string;
    username: string;
}
export interface SimpleLoginRequest {
    email: string;
    password: string;
}
export interface SimpleUpdateProfileRequest {
    username?: string;
    currentPassword?: string;
    newPassword?: string;
}
export interface SimpleAnalyzeRequest {
    boardState: string;
    dice: [number, number];
    move?: string;
    analysisType: string;
    playerColor: SimplePlayerColor;
}
export interface SimpleMoveSuggestion {
    move: string;
    equity: number;
    winProbability: number;
    rank: number;
    isBest: boolean;
}
export interface SimplePositionEvaluation {
    winProbability: number;
    equity: number;
    cubefulEquity: number;
    marketWindow: {
        isDouble: boolean;
        takePoint: number;
        cashPoint: number;
    };
}
export interface SimpleAnalysisResponse {
    boardState: string;
    analysis: {
        moveSuggestions?: SimpleMoveSuggestion[];
        positionEvaluation?: SimplePositionEvaluation;
    };
    analysisType: string;
    playerColor: SimplePlayerColor;
    dice: [number, number];
    timestamp: Date;
    processingTimeMs: number;
}
//# sourceMappingURL=simple.types.d.ts.map