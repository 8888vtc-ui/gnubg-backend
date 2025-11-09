/**
 * AuthController - API REST pour l'authentification
 */
import { Request, Response } from 'express';
export declare class AuthController {
    /**
     * Inscription d'un nouvel utilisateur
     */
    static register(req: Request, res: Response): Promise<void>;
    /**
     * Connexion d'un utilisateur
     */
    static login(req: Request, res: Response): Promise<void>;
    /**
     * Rafraîchir les tokens JWT
     */
    static refreshTokens(req: Request, res: Response): Promise<void>;
    /**
     * Obtenir le profil utilisateur
     */
    static getProfile(req: Request, res: Response): Promise<void>;
    /**
     * Mettre à jour le profil utilisateur
     */
    static updateProfile(req: Request, res: Response): Promise<void>;
    /**
     * Déconnexion (révocation des tokens)
     */
    static logout(req: Request, res: Response): Promise<void>;
    /**
     * Désactiver le compte utilisateur
     */
    static deactivateAccount(req: Request, res: Response): Promise<void>;
    /**
     * Vérifier si l'email est disponible
     */
    static checkEmailAvailability(req: Request, res: Response): Promise<void>;
    /**
     * Vérifier si le username est disponible
     */
    static checkUsernameAvailability(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=auth.controller.d.ts.map