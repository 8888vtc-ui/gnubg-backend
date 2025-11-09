/**
 * Types pour l'intégration GNUBG (GNU Backgammon)
 */

export type BoardState = string; // Format GNUBG: "4HPwATDgc/ABMA"
export type Move = string; // Format GNUBG: "8/5 6/5"
export type Dice = readonly [number, number];
export type PlayerColor = 'WHITE' | 'BLACK';

export enum AnalysisType {
  QUICK = 'quick',
  FULL = 'full',
  EVALUATION = 'evaluation',
  BEST_MOVE = 'best_move',
  BEST_MOVES = 'best_moves',
  MOVE_ANALYSIS = 'move_analysis'
}

export enum GamePhase {
  OPENING = 'opening',
  MIDDLEGAME = 'middlegame',
  ENDGAME = 'endgame',
  BEAROFF = 'bearoff'
}

// Interface pour requête d'analyse (alias)
export interface AnalyzeRequest {
  readonly boardState: BoardState;
  readonly dice: Dice;
  readonly move?: Move;
  readonly analysisType: AnalysisType;
  readonly playerColor: PlayerColor;
}

// Interface pour requête d'analyse
export interface GnubgAnalysisRequest {
  readonly boardState: BoardState;
  readonly dice: Dice;
  readonly move?: Move;
  readonly analysisType: AnalysisType;
  readonly playerColor: PlayerColor;
}

// Interface réponse GNUBG
export interface GnubgAnalysisResponse {
  readonly success: boolean;
  readonly bestMove?: Move;
  readonly evaluation?: {
    readonly winProbability: number; // 0-1
    readonly equity: number; // Expected value
    readonly cubeDecision?: 'TAKE' | 'DROP' | 'DOUBLE';
  };
  readonly moveAnalysis?: {
    readonly move: Move;
    readonly errorRate: number; // in millipoints
    readonly rank: number; // 1 = best move
    readonly totalMoves: number;
  };
  readonly gamePhase: GamePhase;
  readonly difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  readonly processingTime: number; // in milliseconds
}

// Interface pour suggestion de coup
export interface GnubgMoveSuggestion {
  readonly move: Move;
  readonly confidence: number; // 0-1
  readonly reasoning: string;
  readonly alternatives: readonly {
    readonly move: Move;
    readonly score: number;
  }[];
}

// Interface pour évaluation de position
export interface GnubgPositionEvaluation {
  readonly equity: number;
  readonly winProbability: number;
  readonly gammonProbability: number;
  readonly backgammonProbability: number;
  readonly cubeDecision: 'TAKE' | 'DROP' | 'DOUBLE' | 'NO_DOUBLE';
}

// Interface réponse GNUBG
export interface GnubgResponse {
  readonly success: boolean;
  readonly bestMove?: Move;
  readonly evaluation?: {
    readonly winProbability: number; // 0-1
    readonly equity: number; // Expected value
    readonly cubeDecision?: 'TAKE' | 'DROP' | 'DOUBLE';
  };
  readonly moveAnalysis?: {
    readonly move: Move;
    readonly errorRate: number; // in millipoints
    readonly rank: number; // 1 = best move
    readonly totalMoves: number;
  };
  readonly gamePhase: GamePhase;
  readonly difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  readonly processingTime: number; // in milliseconds
}

// Interface pour suggestion de coup
export interface MoveSuggestion {
  readonly move: Move;
  readonly confidence: number; // 0-1
  readonly reasoning: string;
  readonly alternatives: readonly {
    readonly move: Move;
    readonly score: number;
  }[];
}

// Interface configuration IA
export interface GnubgConfig {
  readonly serviceUrl: string;
  readonly apiKey: string;
  readonly timeout: number; // en millisecondes
  readonly maxRetries: number;
  readonly difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
}

// Interface erreur GNUBG
export interface GnubgError {
  readonly code: string;
  readonly message: string;
  readonly details?: unknown;
}
