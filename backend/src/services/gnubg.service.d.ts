/**
 * GnubgService - Intégration avec l'IA GNUBG pour l'analyse de backgammon
 */
import { GnubgAnalysisRequest, GnubgAnalysisResponse, GnubgMoveSuggestion, GnubgPositionEvaluation, PlayerColor } from '../types/gnubg.types';
export declare class GnubgService {
    private static readonly GNUBG_API_URL;
    private static readonly GNUBG_API_KEY;
    private static readonly TIMEOUT_MS;
    /**
     * Analyser une position de backgammon avec GNUBG
     */
    static analyzePosition(request: GnubgAnalysisRequest): Promise<GnubgAnalysisResponse>;
    /**
     * Obtenir des suggestions de coups pour une position donnée
     */
    static getMoveSuggestions(boardState: string, dice: [number, number], playerColor: PlayerColor): Promise<GnubgMoveSuggestion[]>;
    /**
     * Évaluer une position (win probability, equity, etc.)
     */
    static evaluatePosition(boardState: string, playerColor: PlayerColor): Promise<GnubgPositionEvaluation>;
    /**
     * Analyser un mouvement spécifique
     */
    static analyzeMove(boardState: string, move: string, dice: [number, number], playerColor: PlayerColor): Promise<GnubgMoveSuggestion>;
    /**
     * Obtenir une analyse complète de la partie
     */
    static getFullGameAnalysis(gameMoves: string[], playerColor: PlayerColor): Promise<{
        overallEvaluation: GnubgPositionEvaluation;
        moveAnalysis: GnubgMoveSuggestion[];
        mistakes: Array<{
            moveNumber: number;
            move: string;
            mistakeType: 'blunder' | 'mistake' | 'dubious';
            equityLoss: number;
        }>;
    }>;
    /**
     * Appeler l'API GNUBG avec gestion d'erreurs et timeout
     */
    private static callGnubgApi;
    /**
     * Formater la requête pour GNUBG
     */
    private static formatGnubgRequest;
    /**
     * Parser la réponse de GNUBG
     */
    private static parseGnubgResponse;
    /**
     * Parser la réponse d'analyse complète
     */
    private static parseFullGameResponse;
    /**
     * Vérifier la connectivité avec GNUBG
     */
    static checkConnectivity(): Promise<boolean>;
}
//# sourceMappingURL=gnubg.service.d.ts.map