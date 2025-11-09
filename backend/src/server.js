"use strict";
/**
 * Point d'entrée principal du serveur GammonGuru
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const logger_utils_1 = require("./utils/logger.utils");
const env_config_1 = require("./config/env.config");
const app_1 = __importDefault(require("./app"));
// Charger les variables d'environnement
dotenv_1.default.config();
/**
 * Fonction principale de démarrage du serveur
 */
async function startServer() {
    try {
        // Valider la configuration
        env_config_1.EnvConfig.validate();
        logger_utils_1.Logger.info('Starting GammonGuru Backend Server...', {
            environment: process.env.NODE_ENV,
            port: process.env.PORT,
            action: 'server_startup_initiated'
        });
        // Créer et démarrer l'application
        const app = new app_1.default();
        app.listen();
        logger_utils_1.Logger.info('GammonGuru Backend Server is running successfully!', {
            environment: process.env.NODE_ENV,
            port: process.env.PORT || 3000,
            action: 'server_startup_completed'
        });
        // Gérer l'arrêt gracieux
        setupGracefulShutdown();
    }
    catch (error) {
        logger_utils_1.Logger.error('Failed to start GammonGuru Backend Server', {
            error: error instanceof Error ? error.message : 'Unknown error',
            action: 'server_startup_failed'
        });
        process.exit(1);
    }
}
/**
 * Configuration de l'arrêt gracieux du serveur
 */
function setupGracefulShutdown() {
    const gracefulShutdown = (signal) => {
        logger_utils_1.Logger.info(`Received ${signal}. Starting graceful shutdown...`, {
            signal,
            action: 'graceful_shutdown_initiated'
        });
        // Fermer les connexions, nettoyer les ressources, etc.
        setTimeout(() => {
            logger_utils_1.Logger.info('Graceful shutdown completed', {
                action: 'graceful_shutdown_completed'
            });
            process.exit(0);
        }, 5000); // 5 secondes pour l'arrêt gracieux
    };
    // Écouter les signaux d'arrêt
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    // Gérer les erreurs non capturées
    process.on('uncaughtException', (error) => {
        logger_utils_1.Logger.error('Uncaught Exception', {
            error: error.message,
            stack: error.stack,
            action: 'uncaught_exception'
        });
        process.exit(1);
    });
    process.on('unhandledRejection', (reason, promise) => {
        logger_utils_1.Logger.error('Unhandled Rejection', {
            reason: reason instanceof Error ? reason.message : String(reason),
            promise: promise.toString(),
            action: 'unhandled_rejection'
        });
        process.exit(1);
    });
}
// Démarrer le serveur
if (require.main === module) {
    startServer();
}
exports.default = startServer;
//# sourceMappingURL=server.js.map