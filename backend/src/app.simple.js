"use strict";
/**
 * Application Express Simplifiée - GammonGuru Backend
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const logger_utils_1 = require("./utils/logger.utils");
// Import des routes simplifiées
const game_routes_simple_1 = __importDefault(require("./routes/game.routes.simple"));
const auth_routes_simple_1 = __importDefault(require("./routes/auth.routes.simple"));
class App {
    app;
    port;
    constructor() {
        this.app = (0, express_1.default)();
        this.port = process.env.PORT || 3000;
        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }
    /**
     * Initialiser les middlewares
     */
    initializeMiddlewares() {
        // Sécurité
        this.app.use((0, helmet_1.default)({
            contentSecurityPolicy: false
        }));
        // CORS
        this.app.use((0, cors_1.default)({
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            credentials: true
        }));
        // Compression
        this.app.use((0, compression_1.default)());
        // Body parsing
        this.app.use(express_1.default.json({ limit: '10mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
        // Logging
        if (process.env.NODE_ENV !== 'test') {
            this.app.use((0, morgan_1.default)('combined'));
        }
        // Middleware de logging simple
        this.app.use((req, res, next) => {
            logger_utils_1.Logger.info(`${req.method} ${req.path}`, {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                action: 'http_request'
            });
            next();
        });
    }
    /**
     * Initialiser les routes
     */
    initializeRoutes() {
        // Route de santé
        this.app.get('/health', (req, res) => {
            res.status(200).json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: process.env.NODE_ENV,
                version: '1.0.0'
            });
        });
        // Route d'information API
        this.app.get('/api', (req, res) => {
            res.status(200).json({
                name: 'GammonGuru API',
                version: '1.0.0',
                description: 'API REST pour le jeu de backgammon avec IA GNUBG',
                endpoints: {
                    auth: '/api/auth',
                    games: '/api/games'
                },
                health: '/health'
            });
        });
        // Routes API
        this.app.use('/api/auth', auth_routes_simple_1.default);
        this.app.use('/api/games', game_routes_simple_1.default);
        // Route 404
        this.app.use('*', (req, res) => {
            res.status(404).json({
                success: false,
                error: 'Endpoint non trouvé',
                message: `La route ${req.method} ${req.originalUrl} n'existe pas`,
                availableEndpoints: {
                    auth: '/api/auth',
                    games: '/api/games',
                    health: '/health',
                    docs: '/api'
                }
            });
        });
    }
    /**
     * Initialiser la gestion des erreurs
     */
    initializeErrorHandling() {
        // Middleware d'erreurs simple
        this.app.use((error, req, res, next) => {
            logger_utils_1.Logger.error('Unhandled error', {
                error: error.message,
                stack: error.stack,
                path: req.path,
                method: req.method,
                action: 'unhandled_error'
            });
            const isDevelopment = process.env.NODE_ENV === 'development';
            res.status(500).json({
                success: false,
                error: 'Erreur serveur interne',
                ...(isDevelopment && {
                    details: {
                        message: error.message,
                        stack: error.stack
                    }
                })
            });
        });
    }
    /**
     * Démarrer le serveur
     */
    listen() {
        this.app.listen(this.port, () => {
            logger_utils_1.Logger.info('Server started successfully', {
                port: this.port,
                environment: process.env.NODE_ENV,
                action: 'server_started'
            });
        });
    }
    /**
     * Obtenir l'application Express
     */
    getApp() {
        return this.app;
    }
}
exports.default = App;
//# sourceMappingURL=app.simple.js.map