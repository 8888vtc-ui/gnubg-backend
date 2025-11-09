/**
 * Types pour l'intégration GNUBG (GNU Backgammon)
 */
export type BoardState = string;
export type Move = string;
export type Dice = readonly [number, number];
export type PlayerColor = 'WHITE' | 'BLACK';
export declare enum AnalysisType {
    QUICK = "quick",
    FULL = "full",
    EVALUATION = "evaluation",
    BEST_MOVE = "best_move",
    BEST_MOVES = "best_moves",
    MOVE_ANALYSIS = "move_analysis"
}
export declare enum GamePhase {
    OPENING = "opening",
    MIDDLEGAME = "middlegame",
    ENDGAME = "endgame",
    BEAROFF = "bearoff"
}
export interface AnalyzeRequest {
    readonly boardState: BoardState;
    readonly dice: Dice;
    readonly move?: Move;
    readonly analysisType: AnalysisType;
    readonly playerColor: PlayerColor;
}
export interface GnubgAnalysisRequest {
    readonly boardState: BoardState;
    readonly dice: Dice;
    readonly move?: Move;
    readonly analysisType: AnalysisType;
    readonly playerColor: PlayerColor;
}
export interface GnubgAnalysisResponse {
    readonly success: boolean;
    readonly bestMove?: Move;
    readonly evaluation?: {
        readonly winProbability: number;
        readonly equity: number;
        readonly cubeDecision?: 'TAKE' | 'DROP' | 'DOUBLE';
    };
    readonly moveAnalysis?: {
        readonly move: Move;
        readonly errorRate: number;
        readonly rank: number;
        readonly totalMoves: number;
    };
    readonly gamePhase: GamePhase;
    readonly difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
    readonly processingTime: number;
}
export interface GnubgMoveSuggestion {
    readonly move: Move;
    readonly confidence: number;
    readonly reasoning: string;
    readonly alternatives: readonly {
        readonly move: Move;
        readonly score: number;
    }[];
}
export interface GnubgPositionEvaluation {
    readonly equity: number;
    readonly winProbability: number;
    readonly gammonProbability: number;
    readonly backgammonProbability: number;
    readonly cubeDecision: 'TAKE' | 'DROP' | 'DOUBLE' | 'NO_DOUBLE';
}
export interface GnubgResponse {
    readonly success: boolean;
    readonly bestMove?: Move;
    readonly evaluation?: {
        readonly winProbability: number;
        readonly equity: number;
        readonly cubeDecision?: 'TAKE' | 'DROP' | 'DOUBLE';
    };
    readonly moveAnalysis?: {
        readonly move: Move;
        readonly errorRate: number;
        readonly rank: number;
        readonly totalMoves: number;
    };
    readonly gamePhase: GamePhase;
    readonly difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
    readonly processingTime: number;
}
export interface MoveSuggestion {
    readonly move: Move;
    readonly confidence: number;
    readonly reasoning: string;
    readonly alternatives: readonly {
        readonly move: Move;
        readonly score: number;
    }[];
}
export interface GnubgConfig {
    readonly serviceUrl: string;
    readonly apiKey: string;
    readonly timeout: number;
    readonly maxRetries: number;
    readonly difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
}
export interface GnubgError {
    readonly code: string;
    readonly message: string;
    readonly details?: unknown;
}
//# sourceMappingURL=gnubg.types.d.ts.map