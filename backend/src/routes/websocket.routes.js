/**
 * WebSocket Routes - GammonGuru Real-time Endpoints
 * Defines all WebSocket connection endpoints
 */

const express = require('express');
const wsService = require('../services/websocket.service');

const router = express.Router();

/**
 * Initialize WebSocket routes with HTTP server
 */
router.initializeWebSocket = (server) => {
  return wsService.initialize(server);
};

/**
 * Get WebSocket connection statistics
 */
router.get('/stats', (req, res) => {
  try {
    const stats = wsService.getStats();
    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('WebSocket stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get WebSocket stats',
      message: error.message
    });
  }
});

/**
 * Send notification to specific user
 */
router.post('/notify/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { notification } = req.body;

    if (!notification) {
      return res.status(400).json({
        success: false,
        error: 'Notification data required'
      });
    }

    wsService.sendNotificationToUser(userId, notification);

    res.json({
      success: true,
      message: `Notification sent to user ${userId}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send notification',
      message: error.message
    });
  }
});

/**
 * Broadcast to game room
 */
router.post('/broadcast/game/:gameId', (req, res) => {
  try {
    const { gameId } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message data required'
      });
    }

    wsService.broadcastToGame(gameId, message);

    res.json({
      success: true,
      message: `Message broadcast to game ${gameId}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Broadcast to game error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to broadcast to game',
      message: error.message
    });
  }
});

/**
 * Broadcast to chat room
 */
router.post('/broadcast/chat/:gameId', (req, res) => {
  try {
    const { gameId } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message data required'
      });
    }

    wsService.broadcastToChat(gameId, message);

    res.json({
      success: true,
      message: `Message broadcast to chat ${gameId}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Broadcast to chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to broadcast to chat',
      message: error.message
    });
  }
});

/**
 * Broadcast to tournament room
 */
router.post('/broadcast/tournament/:tournamentId', (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message data required'
      });
    }

    wsService.broadcastToTournament(tournamentId, message);

    res.json({
      success: true,
      message: `Message broadcast to tournament ${tournamentId}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Broadcast to tournament error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to broadcast to tournament',
      message: error.message
    });
  }
});

/**
 * Clean up inactive connections
 */
router.post('/cleanup', (req, res) => {
  try {
    wsService.cleanup();
    
    res.json({
      success: true,
      message: 'WebSocket cleanup completed',
      stats: wsService.getStats(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('WebSocket cleanup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cleanup WebSocket connections',
      message: error.message
    });
  }
});

module.exports = router;
