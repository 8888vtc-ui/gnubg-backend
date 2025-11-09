/**
 * GameController - API REST pour la gestion des jeux
 */
import { Request, Response } from 'express';
export declare class GameController {
    /**
     * Créer une nouvelle partie
     */
    static createGame(req: Request, res: Response): Promise<void>;
    /**
     * Lancer les dés
     */
    static rollDice(req: Request, res: Response): Promise<void>;
    /**
     * Effectuer un mouvement
     */
    static makeMove(req: Request, res: Response): Promise<void>;
    /**
     * Obtenir l'état actuel d'une partie
     */
    static getGameState(req: Request, res: Response): Promise<void>;
    /**
     * Obtenir les suggestions de mouvements de l'IA GNUBG
     */
    static getMoveSuggestions(req: Request, res: Response): Promise<void>;
    /**
     * Évaluer la position actuelle avec GNUBG
     */
    static evaluatePosition(req: Request, res: Response): Promise<void>;
    /**
     * Liste des parties de l'utilisateur
     */
    static getUserGames(req: Request, res: Response): Promise<void>;
    /**
     * Convertir le plateau en format GNUBG
     */
    private static convertBoardToGnubgFormat;
}
//# sourceMappingURL=game.controller.d.ts.map