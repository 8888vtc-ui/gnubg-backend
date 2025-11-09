/**
 * Simple Express Server for Railway Deployment
 * JavaScript version - no TypeScript errors
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');

const app = express();
const server = createServer(app);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'GammonGuru Backend',
    version: '1.0.0'
  });
});

// Game routes
app.post('/api/game/create', (req, res) => {
  const { mode, difficulty } = req.body;
  const gameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  res.json({
    success: true,
    game: {
      id: gameId,
      mode: mode || 'AI_VS_PLAYER',
      difficulty: difficulty || 'MEDIUM',
      status: 'waiting',
      board: generateInitialBoard(),
      currentPlayer: 'white',
      dice: null,
      createdAt: new Date().toISOString()
    }
  });
});

app.get('/api/game/status/:gameId', (req, res) => {
  const { gameId } = req.params;
  
  res.json({
    success: true,
    game: {
      id: gameId,
      status: 'playing',
      board: generateInitialBoard(),
      currentPlayer: 'white',
      dice: [3, 5],
      moves: [],
      winner: null
    }
  });
});

app.post('/api/game/roll', (req, res) => {
  const dice1 = Math.floor(Math.random() * 6) + 1;
  const dice2 = Math.floor(Math.random() * 6) + 1;
  const dice = dice1 === dice2 ? [dice1, dice1, dice1, dice1] : [dice1, dice2];
  
  res.json({
    success: true,
    dice,
    canMove: true
  });
});

app.post('/api/game/move', (req, res) => {
  const { from, to, gameId } = req.body;
  
  res.json({
    success: true,
    move: { from, to, timestamp: new Date().toISOString() },
    board: generateInitialBoard()
  });
});

// GNUBG Analysis (mock)
app.post('/api/gnubg/analyze', (req, res) => {
  const { boardState, dice, analysisType } = req.body;
  
  // Mock analysis response
  const mockAnalysis = {
    success: true,
    bestMove: '8/5 6/5',
    evaluation: {
      winProbability: 0.52 + Math.random() * 0.1,
      equity: -0.1 + Math.random() * 0.2,
      cubeDecision: 'NO_DOUBLE'
    },
    moveAnalysis: {
      move: '8/5 6/5',
      errorRate: Math.floor(Math.random() * 50),
      rank: 1,
      totalMoves: 20
    },
    gamePhase: 'MIDDLEGAME',
    difficulty: 'EXPERT',
    processingTime: 1200 + Math.floor(Math.random() * 800)
  };
  
  setTimeout(() => {
    res.json(mockAnalysis);
  }, 1000 + Math.random() * 2000); // Simulate processing time
});

// Auth routes (mock)
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Mock authentication
  const token = 'mock_jwt_token_' + Date.now();
  const user = {
    id: 'user_' + Date.now(),
    email,
    username: email.split('@')[0],
    elo: 1500 + Math.floor(Math.random() * 500),
    subscription_type: 'FREE'
  };
  
  res.json({
    success: true,
    token,
    user
  });
});

app.post('/api/auth/register', (req, res) => {
  const { email, username, password } = req.body;
  
  const token = 'mock_jwt_token_' + Date.now();
  const user = {
    id: 'user_' + Date.now(),
    email,
    username,
    elo: 1500,
    subscription_type: 'FREE',
    created_at: new Date().toISOString()
  };
  
  res.status(201).json({
    success: true,
    token,
    user
  });
});

// User profile
app.get('/api/user/profile', (req, res) => {
  res.json({
    success: true,
    user: {
      id: 'user_demo',
      email: 'demo@gammonguru.com',
      username: 'DemoPlayer',
      elo: 1650,
      subscription_type: 'PREMIUM',
      games_played: 42,
      win_rate: 0.67,
      created_at: new Date().toISOString()
    }
  });
});

// Helper function to generate initial board
function generateInitialBoard() {
  return [
    { point: 1, checkers: 2, player: 'white' },
    { point: 6, checkers: 5, player: 'black' },
    { point: 8, checkers: 3, player: 'black' },
    { point: 12, checkers: 5, player: 'white' },
    { point: 13, checkers: 5, player: 'black' },
    { point: 17, checkers: 3, player: 'white' },
    { point: 19, checkers: 5, player: 'white' },
    { point: 24, checkers: 2, player: 'black' }
  ];
}

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🎲 GammonGuru Backend running on port ${PORT}`);
  console.log(`🚀 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 API Base: http://localhost:${PORT}/api`);
});

module.exports = { app, server };
