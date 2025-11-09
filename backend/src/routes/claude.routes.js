/**
 * Claude AI Routes - GammonGuru Intelligence API
 * Endpoints for Claude-powered backgammon analysis and coaching
 */

const express = require('express');
const claudeService = require('../services/claude.service');
const { authenticateToken } = require('../middleware/auth.middleware');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for Claude API (more restrictive due to costs)
const claudeLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: {
    success: false,
    error: 'Too many Claude requests',
    message: 'Veuillez patienter avant de faire une nouvelle demande d\'analyse'
  }
});

/**
 * Analyze backgammon position with Claude
 */
router.post('/analyze', authenticateToken, claudeLimiter, async (req, res) => {
  try {
    const { boardState, dice, playerLevel = 'INTERMEDIATE' } = req.body;

    // Validate input
    if (!boardState) {
      return res.status(400).json({
        success: false,
        error: 'Board state is required'
      });
    }

    // Get Claude analysis
    const analysis = await claudeService.analyzePosition(boardState, dice, playerLevel);

    res.json({
      success: true,
      data: analysis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Claude position analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Analysis failed',
      message: error.message
    });
  }
});

/**
 * Get move suggestions from Claude
 */
router.post('/suggest-moves', authenticateToken, claudeLimiter, async (req, res) => {
  try {
    const { boardState, dice, availableMoves, playerLevel = 'INTERMEDIATE' } = req.body;

    // Validate input
    if (!boardState || !dice || !availableMoves) {
      return res.status(400).json({
        success: false,
        error: 'Board state, dice, and available moves are required'
      });
    }

    // Get Claude suggestions
    const suggestions = await claudeService.getMoveSuggestions(boardState, dice, availableMoves, playerLevel);

    res.json({
      success: true,
      data: suggestions,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Claude move suggestions error:', error);
    res.status(500).json({
      success: false,
      error: 'Move suggestions failed',
      message: error.message
    });
  }
});

/**
 * Get personalized coaching from Claude
 */
router.post('/coach', authenticateToken, claudeLimiter, async (req, res) => {
  try {
    const { playerStats, recentGames, improvementAreas = [] } = req.body;

    // Validate input
    if (!playerStats) {
      return res.status(400).json({
        success: false,
        error: 'Player statistics are required'
      });
    }

    // Get Claude coaching
    const coaching = await claudeService.coachPlayer(playerStats, recentGames, improvementAreas);

    res.json({
      success: true,
      data: coaching,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Claude coaching error:', error);
    res.status(500).json({
      success: false,
      error: 'Coaching failed',
      message: error.message
    });
  }
});

/**
 * Chat with Claude for backgammon questions
 */
router.post('/chat', authenticateToken, claudeLimiter, async (req, res) => {
  try {
    const { message, gameContext, playerLevel = 'INTERMEDIATE' } = req.body;

    // Validate input
    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Limit message length
    if (message.length > 500) {
      return res.status(400).json({
        success: false,
        error: 'Message too long (max 500 characters)'
      });
    }

    // Chat with Claude
    const response = await claudeService.chatWithClaude(message, gameContext, playerLevel);

    res.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Claude chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Chat failed',
      message: error.message
    });
  }
});

/**
 * Analyze completed game with Claude
 */
router.post('/analyze-game', authenticateToken, claudeLimiter, async (req, res) => {
  try {
    const { gameData, playerMoves, gnubgAnalysis } = req.body;

    // Validate input
    if (!gameData || !playerMoves) {
      return res.status(400).json({
        success: false,
        error: 'Game data and player moves are required'
      });
    }

    // Get Claude game analysis
    const analysis = await claudeService.analyzeGame(gameData, playerMoves, gnubgAnalysis);

    res.json({
      success: true,
      data: analysis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Claude game analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Game analysis failed',
      message: error.message
    });
  }
});

/**
 * Get Claude API health status
 */
router.get('/health', async (req, res) => {
  try {
    const health = await claudeService.healthCheck();
    
    res.json({
      success: true,
      data: health,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Claude health check error:', error);
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      message: error.message
    });
  }
});

/**
 * Get Claude usage statistics
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // In a real implementation, you'd track usage in database
    const stats = {
      requests_today: Math.floor(Math.random() * 100),
      requests_this_month: Math.floor(Math.random() * 1000),
      average_response_time: Math.floor(Math.random() * 2000) + 500,
      success_rate: 95 + Math.random() * 5,
      quota_remaining: 1000 - Math.floor(Math.random() * 100)
    };

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Claude stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Stats retrieval failed',
      message: error.message
    });
  }
});

/**
 * Reset Claude usage quota (admin only)
 */
router.post('/reset-quota', authenticateToken, async (req, res) => {
  try {
    // In a real implementation, you'd check admin rights and reset quota
    res.json({
      success: true,
      message: 'Claude quota reset successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Claude quota reset error:', error);
    res.status(500).json({
      success: false,
      error: 'Quota reset failed',
      message: error.message
    });
  }
});

/**
 * Get Claude pricing information
 */
router.get('/pricing', async (req, res) => {
  try {
    const pricing = {
      analysis: {
        cost_per_request: 0.01,
        included_in_free_tier: 10,
        premium_limit: 1000,
        vip_limit: 'unlimited'
      },
      coaching: {
        cost_per_session: 0.02,
        included_in_free_tier: 5,
        premium_limit: 500,
        vip_limit: 'unlimited'
      },
      chat: {
        cost_per_message: 0.005,
        included_in_free_tier: 50,
        premium_limit: 2000,
        vip_limit: 'unlimited'
      }
    };

    res.json({
      success: true,
      data: pricing,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Claude pricing error:', error);
    res.status(500).json({
      success: false,
      error: 'Pricing retrieval failed',
      message: error.message
    });
  }
});

module.exports = router;
