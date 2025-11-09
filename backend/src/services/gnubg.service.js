"use strict";
/**
 * GnubgService - Intégration avec l'IA GNUBG pour l'analyse de backgammon
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GnubgService = void 0;
const gnubg_types_1 = require("../types/gnubg.types");
const config_1 = require("../config");
const utils_1 = require("../utils");
const utils_2 = require("../utils");
class GnubgService {
    static GNUBG_API_URL = config_1.EnvConfig.get().GNUBG_SERVICE_URL;
    static GNUBG_API_KEY = config_1.EnvConfig.get().GNUBG_API_KEY;
    static TIMEOUT_MS = 30000; // 30 secondes timeout
    /**
     * Analyser une position de backgammon avec GNUBG
     */
    static async analyzePosition(request) {
        try {
            const validatedRequest = utils_2.ValidationUtils.validate(utils_2.AnalyzeRequestSchema, request);
            const startTime = Date.now();
            // Préparer la requête pour GNUBG
            const gnubgRequest = GnubgService.formatGnubgRequest(validatedRequest);
            // Appeler l'API GNUBG
            const response = await GnubgService.callGnubgApi('/analyze', gnubgRequest);
            const duration = Date.now() - startTime;
            const analysisResponse = {
                boardState: validatedRequest.boardState,
                analysis: GnubgService.parseGnubgResponse(response),
                analysisType: validatedRequest.analysisType,
                playerColor: validatedRequest.playerColor,
                dice: validatedRequest.dice,
                timestamp: new Date(),
                processingTimeMs: duration
            };
            utils_1.Logger.info('Position analysis completed', {
                action: 'position_analyzed',
                analysisType: validatedRequest.analysisType,
                processingTimeMs: duration,
                boardState: validatedRequest.boardState
            });
            return analysisResponse;
        }
        catch (error) {
            utils_1.Logger.error('Position analysis failed', {
                action: 'position_analysis_failed',
                boardState: request.boardState,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            throw error;
        }
    }
    /**
     * Obtenir des suggestions de coups pour une position donnée
     */
    static async getMoveSuggestions(boardState, dice, playerColor) {
        try {
            const request = {
                boardState,
                dice,
                analysisType: gnubg_types_1.AnalysisType.BEST_MOVES,
                playerColor
            };
            const response = await GnubgService.analyzePosition(request);
            // Extraire les suggestions de coups de l'analyse
            const suggestions = response.analysis.moveSuggestions || [];
            utils_1.Logger.info('Move suggestions generated', {
                action: 'move_suggestions_generated',
                boardState,
                dice,
                suggestionsCount: suggestions.length
            });
            return suggestions;
        }
        catch (error) {
            utils_1.Logger.error('Move suggestions failed', {
                action: 'move_suggestions_failed',
                boardState,
                dice,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            throw error;
        }
    }
    /**
     * Évaluer une position (win probability, equity, etc.)
     */
    static async evaluatePosition(boardState, playerColor) {
        try {
            const request = {
                boardState,
                dice: [1, 1], // Valeurs par défaut pour l'évaluation
                analysisType: gnubg_types_1.AnalysisType.EVALUATION,
                playerColor
            };
            const response = await GnubgService.analyzePosition(request);
            const evaluation = response.analysis.positionEvaluation || {
                winProbability: 0.5,
                equity: 0.0,
                cubefulEquity: 0.0,
                marketWindow: { isDouble: false, takePoint: 0.0, cashPoint: 0.0 }
            };
            utils_1.Logger.info('Position evaluation completed', {
                action: 'position_evaluated',
                boardState,
                playerColor,
                winProbability: evaluation.winProbability,
                equity: evaluation.equity
            });
            return evaluation;
        }
        catch (error) {
            utils_1.Logger.error('Position evaluation failed', {
                action: 'position_evaluation_failed',
                boardState,
                playerColor,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            throw error;
        }
    }
    /**
     * Analyser un mouvement spécifique
     */
    static async analyzeMove(boardState, move, dice, playerColor) {
        try {
            const request = {
                boardState,
                dice,
                move,
                analysisType: gnubg_types_1.AnalysisType.MOVE_ANALYSIS,
                playerColor
            };
            const response = await GnubgService.analyzePosition(request);
            const moveAnalysis = response.analysis.moveSuggestions?.[0];
            if (!moveAnalysis) {
                throw new Error('No move analysis returned from GNUBG');
            }
            utils_1.Logger.info('Move analysis completed', {
                action: 'move_analyzed',
                boardState,
                move,
                playerColor,
                equity: moveAnalysis.equity
            });
            return moveAnalysis;
        }
        catch (error) {
            utils_1.Logger.error('Move analysis failed', {
                action: 'move_analysis_failed',
                boardState,
                move,
                playerColor,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            throw error;
        }
    }
    /**
     * Obtenir une analyse complète de la partie
     */
    static async getFullGameAnalysis(gameMoves, playerColor) {
        try {
            utils_1.Logger.info('Starting full game analysis', {
                action: 'full_game_analysis_started',
                movesCount: gameMoves.length,
                playerColor
            });
            const startTime = Date.now();
            // Appeler l'API GNUBG pour l'analyse complète
            const requestBody = {
                moves: gameMoves,
                playerColor,
                analysisType: 'full_game'
            };
            const response = await GnubgService.callGnubgApi('/full-analysis', requestBody);
            const duration = Date.now() - startTime;
            const analysis = GnubgService.parseFullGameResponse(response);
            utils_1.Logger.info('Full game analysis completed', {
                action: 'full_game_analysis_completed',
                movesCount: gameMoves.length,
                processingTimeMs: duration,
                mistakesCount: analysis.mistakes.length
            });
            return analysis;
        }
        catch (error) {
            utils_1.Logger.error('Full game analysis failed', {
                action: 'full_game_analysis_failed',
                movesCount: gameMoves.length,
                playerColor,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            throw error;
        }
    }
    /**
     * Appeler l'API GNUBG avec gestion d'erreurs et timeout
     */
    static async callGnubgApi(endpoint, body) {
        const url = `${GnubgService.GNUBG_API_URL}${endpoint}`;
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), GnubgService.TIMEOUT_MS);
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GnubgService.GNUBG_API_KEY}`,
                    'User-Agent': 'GammonGuru-Backend/1.0'
                },
                body: JSON.stringify(body),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            if (!response.ok) {
                throw new Error(`GNUBG API error: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            if (data.error) {
                throw new Error(`GNUBG API error: ${data.error}`);
            }
            return data;
        }
        catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error('GNUBG API timeout');
            }
            throw error;
        }
    }
    /**
     * Formater la requête pour GNUBG
     */
    static formatGnubgRequest(request) {
        return {
            board: request.boardState,
            dice: request.dice,
            player: request.playerColor.toLowerCase(),
            analysis: request.analysisType.toLowerCase(),
            move: request.move || null
        };
    }
    /**
     * Parser la réponse de GNUBG
     */
    static parseGnubgResponse(response) {
        return {
            moveSuggestions: response.moves?.map((move) => ({
                move: move.notation,
                equity: move.equity,
                winProbability: move.winProb,
                rank: move.rank,
                isBest: move.rank === 1
            })) || [],
            positionEvaluation: response.evaluation ? {
                winProbability: response.evaluation.winProb,
                equity: response.evaluation.equity,
                cubefulEquity: response.evaluation.cubefulEquity,
                marketWindow: {
                    isDouble: response.evaluation.double || false,
                    takePoint: response.evaluation.takePoint || 0.0,
                    cashPoint: response.evaluation.cashPoint || 0.0
                }
            } : null
        };
    }
    /**
     * Parser la réponse d'analyse complète
     */
    static parseFullGameResponse(response) {
        return {
            overallEvaluation: response.overall || {
                winProbability: 0.5,
                equity: 0.0,
                cubefulEquity: 0.0,
                marketWindow: { isDouble: false, takePoint: 0.0, cashPoint: 0.0 }
            },
            moveAnalysis: response.moves?.map((move) => ({
                move: move.notation,
                equity: move.equity,
                winProbability: move.winProb,
                rank: move.rank,
                isBest: move.rank === 1
            })) || [],
            mistakes: response.mistakes?.map((mistake) => ({
                moveNumber: mistake.moveNumber,
                move: mistake.move,
                mistakeType: mistake.type,
                equityLoss: mistake.equityLoss
            })) || []
        };
    }
    /**
     * Vérifier la connectivité avec GNUBG
     */
    static async checkConnectivity() {
        try {
            const response = await fetch(`${GnubgService.GNUBG_API_URL}/health`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${GnubgService.GNUBG_API_KEY}`,
                    'User-Agent': 'GammonGuru-Backend/1.0'
                },
                signal: AbortSignal.timeout(5000) // 5 secondes timeout
            });
            const isHealthy = response.ok && (await response.json()).status === 'healthy';
            utils_1.Logger.info('GNUBG connectivity check', {
                action: 'gnubg_connectivity_check',
                isHealthy,
                status: response.status
            });
            return isHealthy;
        }
        catch (error) {
            utils_1.Logger.error('GNUBG connectivity check failed', {
                action: 'gnubg_connectivity_failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            return false;
        }
    }
}
exports.GnubgService = GnubgService;
//# sourceMappingURL=gnubg.service.js.map