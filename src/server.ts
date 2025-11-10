// src/server.ts
import express from 'express';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { loggerMiddleware } from './middleware/loggerMiddleware.js';
import { errorHandlerMiddleware } from './middleware/errorHandlerMiddleware.js';
import { helmet, cors, corsOptions, generalLimiter, authLimiter, validateInput } from './middleware/securityMiddleware.js';
import playersRouter from './routes/players.js';
import authRouter from './routes/auth.js';
import userRouter from './routes/user.js';
import gamesRouter from './routes/games.js';
import gnubgRouter from './routes/gnubg.js';
import gnubgDebugRouter from './routes/gnubgDebug.js';

const app = express();

// Middleware de base
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de sécurité
app.use(helmet());
app.use(cors(corsOptions));
app.use(generalLimiter);

// Middleware personnalisé
app.use(loggerMiddleware);

// Routes
app.use('/api/players', playersRouter);
app.use('/api/auth', authLimiter, authRouter); // Rate limiting strict pour auth
app.use('/api/user', userRouter);
app.use('/api/games', gamesRouter);
app.use('/api/gnubg', gnubgRouter);
app.use('/api/gnubg-debug', gnubgDebugRouter);

// Route de santé
app.get('/health', (req: express.Request, res: express.Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Route racine
app.get('/', (req: express.Request, res: express.Response) => {
  res.json({
    message: 'GammonGuru API',
    version: '1.0.0',
    endpoints: [
      'GET /health',
      'GET /api/players',
      'POST /api/players'
    ]
  });
});

// Middleware de gestion d'erreurs
app.use(errorHandlerMiddleware);

// Démarrage du serveur
app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`);
  logger.info(`Environment: ${config.nodeEnv}`);
});

export default app;