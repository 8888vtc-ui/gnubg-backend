"use strict";
/**
 * GnubgService - Intégration GNUBG IA robuste et sécurisée
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GnubgService = void 0;
const logger_utils_1 = require("../utils/logger.utils");
const zod_1 = require("zod");
// Schémas de validation Zod robustes
const AnalyzeRequestSchema = zod_1.z.object({
    boardState: zod_1.z.string().min(1, 'L\'état du plateau est requis'),
    dice: zod_1.z.tuple([zod_1.z.number().int().min(1).max(6), zod_1.z.number().int().min(1).max(6)]),
    move: zod_1.z.string().optional(),
    analysisType: zod_1.z.enum(['BEST_MOVE', 'POSITION_EVALUATION', 'FULL_ANALYSIS']),
    playerColor: zod_1.z.enum(['white', 'black'])
});
class GnubgService {
    static config = {
        serviceUrl: process.env.GNUBG_SERVICE_URL || 'https://api.gnubg.ai/v1',
        apiKey: process.env.GNUBG_API_KEY || '',
        timeout: 30000,
        maxRetries: 3
    };
    /**
     * Analyser une position de jeu avec GNUBG
     */
    static async analyzePosition(request) {
        try {
            // Validation robuste avec Zod
            const validatedRequest = AnalyzeRequestSchema.parse(request);
            const startTime = Date.now();
            // Appel API GNUBG avec retry
            const response = await GnubgService.callGnubgApi('/analyze', {
                board_state: validatedRequest.boardState,
                dice: validatedRequest.dice,
                move: validatedRequest.move,
                analysis_type: validatedRequest.analysisType,
                player_color: validatedRequest.playerColor
            });
            const processingTime = Date.now() - startTime;
            // Transformer la réponse GNUBG en notre format
            const analysisResponse = {
                boardState: validatedRequest.boardState,
                analysis: GnubgService.transformGnubgResponse(response, validatedRequest.analysisType),
                analysisType: validatedRequest.analysisType,
                playerColor: validatedRequest.playerColor,
                dice: validatedRequest.dice,
                timestamp: new Date(),
                processingTimeMs: processingTime
            };
            logger_utils_1.Logger.info('GNUGB analysis completed successfully', {
                analysisType: validatedRequest.analysisType,
                playerColor: validatedRequest.playerColor,
                processingTimeMs: processingTime,
                action: 'gnubg_analysis_completed'
            });
            return analysisResponse;
        }
        catch (error) {
            logger_utils_1.Logger.error('GNUGB analysis failed', {
                analysisType: request.analysisType,
                playerColor: request.playerColor,
                action: 'gnubg_analysis_failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            throw error;
        }
    }
    /**
     * Obtenir les meilleurs mouvements possibles
     */
    static async getBestMoves(boardState, dice, playerColor) {
        try {
            const analysis = await GnubgService.analyzePosition({
                boardState,
                dice,
                analysisType: 'BEST_MOVE',
                playerColor
            });
            return analysis.analysis.moveSuggestions || [];
        }
        catch (error) {
            logger_utils_1.Logger.error('Best moves analysis failed', {
                playerColor,
                action: 'best_moves_failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            throw error;
        }
    }
    /**
     * Évaluer la position actuelle
     */
    static async evaluatePosition(boardState, playerColor) {
        try {
            const analysis = await GnubgService.analyzePosition({
                boardState,
                dice: [1, 1], // Valeur par défaut pour l'évaluation
                analysisType: 'POSITION_EVALUATION',
                playerColor
            });
            if (!analysis.analysis.positionEvaluation) {
                throw new Error('Évaluation de position non disponible');
            }
            return analysis.analysis.positionEvaluation;
        }
        catch (error) {
            logger_utils_1.Logger.error('Position evaluation failed', {
                playerColor,
                action: 'position_evaluation_failed',
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
            const analysis = await GnubgService.analyzePosition({
                boardState,
                dice,
                move,
                analysisType: 'BEST_MOVE',
                playerColor
            });
            const moveSuggestions = analysis.analysis.moveSuggestions || [];
            const analyzedMove = moveSuggestions.find(suggestion => suggestion.move === move);
            if (!analyzedMove) {
                throw new Error('Mouvement non trouvé dans les suggestions');
            }
            return analyzedMove;
        }
        catch (error) {
            logger_utils_1.Logger.error('Move analysis failed', {
                move,
                playerColor,
                action: 'move_analysis_failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            throw error;
        }
    }
    /**
     * Analyse complète de la partie
     */
    static async analyzeFullGame(boardState, dice, playerColor) {
        try {
            const analysis = await GnubgService.analyzePosition({
                boardState,
                dice,
                analysisType: 'FULL_ANALYSIS',
                playerColor
            });
            if (!analysis.analysis.moveSuggestions || !analysis.analysis.positionEvaluation) {
                throw new Error('Analyse complète non disponible');
            }
            return {
                moveSuggestions: analysis.analysis.moveSuggestions,
                positionEvaluation: analysis.analysis.positionEvaluation
            };
        }
        catch (error) {
            logger_utils_1.Logger.error('Full game analysis failed', {
                playerColor,
                action: 'full_analysis_failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            throw error;
        }
    }
    /**
     * Vérifier la santé du service GNUBG
     */
    static async healthCheck() {
        try {
            const startTime = Date.now();
            await GnubgService.callGnubgApi('/health', {}, true);
            const responseTime = Date.now() - startTime;
            logger_utils_1.Logger.debug('GNUBG health check passed', {
                responseTime,
                action: 'gnubg_health_check'
            });
            return { status: 'healthy', responseTime };
        }
        catch (error) {
            logger_utils_1.Logger.error('GNUBG health check failed', {
                action: 'gnubg_health_check_failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            return { status: 'unhealthy', responseTime: -1 };
        }
    }
    /**
     * Appeler l'API GNUBG avec retry et timeout
     */
    static async callGnubgApi(endpoint, data, isHealthCheck = false) {
        const url = `${GnubgService.config.serviceUrl}${endpoint}`;
        for (let attempt = 1; attempt <= GnubgService.config.maxRetries; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), GnubgService.config.timeout);
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${GnubgService.config.apiKey}`,
                        'User-Agent': 'GammonGuru/1.0'
                    },
                    body: JSON.stringify(data),
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                if (!response.ok) {
                    throw new Error(`GNUBG API error: ${response.status} ${response.statusText}`);
                }
                return await response.json();
            }
            catch (error) {
                if (attempt === GnubgService.config.maxRetries) {
                    throw error;
                }
                logger_utils_1.Logger.warn(`GNUBG API attempt ${attempt} failed, retrying...`, {
                    endpoint,
                    attempt,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
                // Exponential backoff
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
        }
        throw new Error('GNUBG API: Max retries exceeded');
    }
    /**
     * Transformer la réponse GNUBG en notre format standard
     */
    static transformGnubgResponse(gnubgResponse, analysisType) {
        switch (analysisType) {
            case 'BEST_MOVE':
                return {
                    moveSuggestions: gnubgResponse.moves?.map((move, index) => ({
                        move: move.notation || move.move,
                        equity: move.equity || 0,
                        winProbability: move.winProbability || 0,
                        rank: index + 1,
                        isBest: index === 0
                    })) || []
                };
            case 'POSITION_EVALUATION':
                return {
                    positionEvaluation: {
                        winProbability: gnubgResponse.winProbability || 0,
                        equity: gnubgResponse.equity || 0,
                        cubefulEquity: gnubgResponse.cubefulEquity || 0,
                        marketWindow: {
                            isDouble: gnubgResponse.marketWindow?.isDouble || false,
                            takePoint: gnubgResponse.marketWindow?.takePoint || 0,
                            cashPoint: gnubgResponse.marketWindow?.cashPoint || 0
                        }
                    }
                };
            case 'FULL_ANALYSIS':
                return {
                    moveSuggestions: gnubgResponse.moves?.map((move, index) => ({
                        move: move.notation || move.move,
                        equity: move.equity || 0,
                        winProbability: move.winProbability || 0,
                        rank: index + 1,
                        isBest: index === 0
                    })) || [],
                    positionEvaluation: {
                        winProbability: gnubgResponse.winProbability || 0,
                        equity: gnubgResponse.equity || 0,
                        cubefulEquity: gnubgResponse.cubefulEquity || 0,
                        marketWindow: {
                            isDouble: gnubgResponse.marketWindow?.isDouble || false,
                            takePoint: gnubgResponse.marketWindow?.takePoint || 0,
                            cashPoint: gnubgResponse.marketWindow?.cashPoint || 0
                        }
                    }
                };
            default:
                throw new Error(`Type d'analyse non supporté: ${analysisType}`);
        }
    }
    /**
     * Mettre à jour la configuration GNUBG
     */
    static updateConfig(newConfig) {
        GnubgService.config = { ...GnubgService.config, ...newConfig };
        logger_utils_1.Logger.info('GNUBG configuration updated', {
            newConfig,
            action: 'gnubg_config_updated'
        });
    }
    /**
     * Obtenir la configuration actuelle
     */
    static getConfig() {
        return { ...GnubgService.config };
    }
}
exports.GnubgService = GnubgService;
//# sourceMappingURL=gnubg.service.robust.js.map