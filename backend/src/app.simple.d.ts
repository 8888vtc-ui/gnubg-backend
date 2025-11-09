/**
 * Application Express Simplifiée - GammonGuru Backend
 */
import express from 'express';
declare class App {
    app: express.Application;
    private port;
    constructor();
    /**
     * Initialiser les middlewares
     */
    private initializeMiddlewares;
    /**
     * Initialiser les routes
     */
    private initializeRoutes;
    /**
     * Initialiser la gestion des erreurs
     */
    private initializeErrorHandling;
    /**
     * Démarrer le serveur
     */
    listen(): void;
    /**
     * Obtenir l'application Express
     */
    getApp(): express.Application;
}
export default App;
//# sourceMappingURL=app.simple.d.ts.map