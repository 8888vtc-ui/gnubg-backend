/**
 * GnubgService - Intégration GNUBG IA robuste et sécurisée
 */
interface SimpleAnalyzeRequest {
    boardState: string;
    dice: [number, number];
    move?: string;
    analysisType: 'BEST_MOVE' | 'POSITION_EVALUATION' | 'FULL_ANALYSIS';
    playerColor: 'white' | 'black';
}
interface SimpleMoveSuggestion {
    move: string;
    equity: number;
    winProbability: number;
    rank: number;
    isBest: boolean;
}
interface SimplePositionEvaluation {
    winProbability: number;
    equity: number;
    cubefulEquity: number;
    marketWindow: {
        isDouble: boolean;
        takePoint: number;
        cashPoint: number;
    };
}
interface SimpleAnalysisResponse {
    boardState: string;
    analysis: {
        moveSuggestions?: SimpleMoveSuggestion[];
        positionEvaluation?: SimplePositionEvaluation;
    };
    analysisType: string;
    playerColor: 'white' | 'black';
    dice: [number, number];
    timestamp: Date;
    processingTimeMs: number;
}
interface GnubgConfig {
    serviceUrl: string;
    apiKey: string;
    timeout: number;
    maxRetries: number;
}
export declare class GnubgService {
    private static config;
    /**
     * Analyser une position de jeu avec GNUBG
     */
    static analyzePosition(request: SimpleAnalyzeRequest): Promise<SimpleAnalysisResponse>;
    /**
     * Obtenir les meilleurs mouvements possibles
     */
    static getBestMoves(boardState: string, dice: [number, number], playerColor: 'white' | 'black'): Promise<SimpleMoveSuggestion[]>;
    /**
     * Évaluer la position actuelle
     */
    static evaluatePosition(boardState: string, playerColor: 'white' | 'black'): Promise<SimplePositionEvaluation>;
    /**
     * Analyser un mouvement spécifique
     */
    static analyzeMove(boardState: string, move: string, dice: [number, number], playerColor: 'white' | 'black'): Promise<SimpleMoveSuggestion>;
    /**
     * Analyse complète de la partie
     */
    static analyzeFullGame(boardState: string, dice: [number, number], playerColor: 'white' | 'black'): Promise<{
        moveSuggestions: SimpleMoveSuggestion[];
        positionEvaluation: SimplePositionEvaluation;
    }>;
    /**
     * Vérifier la santé du service GNUBG
     */
    static healthCheck(): Promise<{
        status: 'healthy' | 'unhealthy';
        responseTime: number;
    }>;
    /**
     * Appeler l'API GNUBG avec retry et timeout
     */
    private static callGnubgApi;
    /**
     * Transformer la réponse GNUBG en notre format standard
     */
    private static transformGnubgResponse;
    /**
     * Mettre à jour la configuration GNUBG
     */
    static updateConfig(newConfig: Partial<GnubgConfig>): void;
    /**
     * Obtenir la configuration actuelle
     */
    static getConfig(): GnubgConfig;
}
export {};
//# sourceMappingURL=gnubg.service.robust.d.ts.map