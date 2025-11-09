/**
 * WebSocket Service - GammonGuru Real-time Multiplayer
 * Handles game synchronization, chat, tournaments, and notifications
 */

const { Server } = require('ws');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

class WebSocketService {
  constructor() {
    this.wss = null;
    this.connections = new Map(); // connectionId -> { ws, userId, gameId, type }
    this.gameRooms = new Map(); // gameId -> Set of connectionIds
    this.chatRooms = new Map(); // gameId -> Set of connectionIds
    this.tournamentRooms = new Map(); // tournamentId -> Set of connectionIds
    this.userConnections = new Map(); // userId -> Set of connectionIds
  }

  /**
   * Initialize WebSocket server
   */
  initialize(server) {
    this.wss = new Server({ server });
    
    this.wss.on('connection', (ws, req) => {
      this.handleConnection(ws, req);
    });

    console.log('🔌 WebSocket server initialized');
    return this.wss;
  }

  /**
   * Handle new WebSocket connection
   */
  async handleConnection(ws, req) {
    try {
      // Extract connection parameters
      const url = new URL(req.url, 'http://localhost:3000');
      const pathParts = url.pathname.split('/').filter(Boolean);
      
      // Validate JWT token
      const token = url.searchParams.get('token');
      if (!token) {
        ws.close(4001, 'Authentication required');
        return;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId;

      // Determine connection type and ID
      const connectionType = pathParts[0]; // game, chat, tournament, notifications
      const resourceId = pathParts[1]; // gameId, tournamentId, etc.
      
      const connectionId = uuidv4();
      
      // Store connection
      this.connections.set(connectionId, {
        ws,
        userId,
        type: connectionType,
        resourceId,
        connectedAt: new Date(),
        lastPing: new Date()
      });

      // Add to appropriate rooms
      this.addToRoom(connectionType, resourceId, connectionId);
      this.addUserConnection(userId, connectionId);

      // Setup message handlers
      this.setupMessageHandlers(ws, connectionId, connectionType, resourceId);

      // Send welcome message
      this.sendToConnection(connectionId, {
        type: 'connected',
        connectionId,
        timestamp: new Date().toISOString()
      });

      console.log(`🔗 WebSocket connected: ${connectionType}/${resourceId} for user ${userId}`);

    } catch (error) {
      console.error('WebSocket connection error:', error);
      ws.close(4002, 'Authentication failed');
    }
  }

  /**
   * Setup message handlers for different connection types
   */
  setupMessageHandlers(ws, connectionId, type, resourceId) {
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleMessage(connectionId, type, resourceId, message);
      } catch (error) {
        console.error('Message parse error:', error);
        this.sendToConnection(connectionId, {
          type: 'error',
          message: 'Invalid message format'
        });
      }
    });

    ws.on('close', () => {
      this.handleDisconnection(connectionId);
    });

    ws.on('pong', () => {
      const connection = this.connections.get(connectionId);
      if (connection) {
        connection.lastPing = new Date();
      }
    });
  }

  /**
   * Handle incoming messages
   */
  handleMessage(connectionId, type, resourceId, message) {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    switch (type) {
      case 'game':
        this.handleGameMessage(connectionId, resourceId, message);
        break;
      case 'chat':
        this.handleChatMessage(connectionId, resourceId, message);
        break;
      case 'tournament':
        this.handleTournamentMessage(connectionId, resourceId, message);
        break;
      case 'notifications':
        this.handleNotificationMessage(connectionId, message);
        break;
    }
  }

  /**
   * Handle game-related messages
   */
  handleGameMessage(connectionId, gameId, message) {
    const connection = this.connections.get(connectionId);
    
    switch (message.type) {
      case 'game_move':
        // Broadcast move to all players in game
        this.broadcastToGame(gameId, {
          type: 'game_move',
          gameId,
          playerId: connection.userId,
          move: message.move,
          timestamp: new Date().toISOString()
        }, connectionId);
        break;

      case 'game_roll':
        // Broadcast dice roll
        this.broadcastToGame(gameId, {
          type: 'game_roll',
          gameId,
          playerId: connection.userId,
          dice: message.dice,
          timestamp: new Date().toISOString()
        }, connectionId);
        break;

      case 'game_state':
        // Request current game state
        this.sendToConnection(connectionId, {
          type: 'game_state_response',
          gameId,
          state: message.state,
          timestamp: new Date().toISOString()
        });
        break;

      case 'player_joined':
      case 'player_left':
        // Broadcast player status
        this.broadcastToGame(gameId, {
          type: message.type,
          gameId,
          playerId: connection.userId,
          timestamp: new Date().toISOString()
        });
        break;
    }
  }

  /**
   * Handle chat messages
   */
  handleChatMessage(connectionId, gameId, message) {
    const connection = this.connections.get(connectionId);
    
    if (message.type === 'chat_message') {
      const chatMessage = {
        type: 'chat_message',
        gameId,
        userId: connection.userId,
        username: message.username,
        message: message.message,
        messageType: message.messageType || 'TEXT',
        timestamp: new Date().toISOString()
      };

      // Broadcast to all players in game chat
      this.broadcastToChat(gameId, chatMessage);
      
      // Store in database (async)
      this.storeChatMessage(gameId, connection.userId, message.message, message.messageType);
    }
  }

  /**
   * Handle tournament messages
   */
  handleTournamentMessage(connectionId, tournamentId, message) {
    const connection = this.connections.get(connectionId);
    
    switch (message.type) {
      case 'tournament_update':
        this.broadcastToTournament(tournamentId, {
          type: 'tournament_update',
          tournamentId,
          data: message.data,
          timestamp: new Date().toISOString()
        });
        break;

      case 'match_start':
      case 'match_end':
        this.broadcastToTournament(tournamentId, {
          type: message.type,
          tournamentId,
          matchData: message.matchData,
          timestamp: new Date().toISOString()
        });
        break;
    }
  }

  /**
   * Handle notification messages
   */
  handleNotificationMessage(connectionId, message) {
    // Individual notifications are sent directly to user
    if (message.type === 'notification_ack') {
      // Mark notification as read
      this.markNotificationRead(connectionId, message.notificationId);
    }
  }

  /**
   * Add connection to appropriate room
   */
  addToRoom(type, resourceId, connectionId) {
    switch (type) {
      case 'game':
        if (!this.gameRooms.has(resourceId)) {
          this.gameRooms.set(resourceId, new Set());
        }
        this.gameRooms.get(resourceId).add(connectionId);
        break;
      case 'chat':
        if (!this.chatRooms.has(resourceId)) {
          this.chatRooms.set(resourceId, new Set());
        }
        this.chatRooms.get(resourceId).add(connectionId);
        break;
      case 'tournament':
        if (!this.tournamentRooms.has(resourceId)) {
          this.tournamentRooms.set(resourceId, new Set());
        }
        this.tournamentRooms.get(resourceId).add(connectionId);
        break;
    }
  }

  /**
   * Add connection to user's connection set
   */
  addUserConnection(userId, connectionId) {
    if (!this.userConnections.has(userId)) {
      this.userConnections.set(userId, new Set());
    }
    this.userConnections.get(userId).add(connectionId);
  }

  /**
   * Handle disconnection
   */
  handleDisconnection(connectionId) {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    // Remove from rooms
    this.removeFromRoom(connection.type, connection.resourceId, connectionId);
    
    // Remove from user connections
    const userConns = this.userConnections.get(connection.userId);
    if (userConns) {
      userConns.delete(connectionId);
      if (userConns.size === 0) {
        this.userConnections.delete(connection.userId);
      }
    }

    // Remove connection
    this.connections.delete(connectionId);

    // Broadcast disconnection to relevant rooms
    if (connection.type === 'game') {
      this.broadcastToGame(connection.resourceId, {
        type: 'player_disconnected',
        gameId: connection.resourceId,
        playerId: connection.userId,
        timestamp: new Date().toISOString()
      });
    }

    console.log(`🔌 WebSocket disconnected: ${connection.type}/${connection.resourceId} for user ${connection.userId}`);
  }

  /**
   * Remove connection from room
   */
  removeFromRoom(type, resourceId, connectionId) {
    let room;
    switch (type) {
      case 'game':
        room = this.gameRooms.get(resourceId);
        break;
      case 'chat':
        room = this.chatRooms.get(resourceId);
        break;
      case 'tournament':
        room = this.tournamentRooms.get(resourceId);
        break;
    }
    
    if (room) {
      room.delete(connectionId);
      if (room.size === 0) {
        // Clean up empty room
        switch (type) {
          case 'game':
            this.gameRooms.delete(resourceId);
            break;
          case 'chat':
            this.chatRooms.delete(resourceId);
            break;
          case 'tournament':
            this.tournamentRooms.delete(resourceId);
            break;
        }
      }
    }
  }

  /**
   * Send message to specific connection
   */
  sendToConnection(connectionId, message) {
    const connection = this.connections.get(connectionId);
    if (connection && connection.ws.readyState === connection.ws.OPEN) {
      connection.ws.send(JSON.stringify(message));
    }
  }

  /**
   * Broadcast to all connections in a game room
   */
  broadcastToGame(gameId, message, excludeConnectionId = null) {
    const room = this.gameRooms.get(gameId);
    if (room) {
      room.forEach(connectionId => {
        if (connectionId !== excludeConnectionId) {
          this.sendToConnection(connectionId, message);
        }
      });
    }
  }

  /**
   * Broadcast to all connections in a chat room
   */
  broadcastToChat(gameId, message) {
    const room = this.chatRooms.get(gameId);
    if (room) {
      room.forEach(connectionId => {
        this.sendToConnection(connectionId, message);
      });
    }
  }

  /**
   * Broadcast to all connections in a tournament room
   */
  broadcastToTournament(tournamentId, message) {
    const room = this.tournamentRooms.get(tournamentId);
    if (room) {
      room.forEach(connectionId => {
        this.sendToConnection(connectionId, message);
      });
    }
  }

  /**
   * Send notification to specific user
   */
  sendNotificationToUser(userId, notification) {
    const userConns = this.userConnections.get(userId);
    if (userConns) {
      const message = {
        type: 'notification',
        userId,
        notification,
        timestamp: new Date().toISOString()
      };
      
      userConns.forEach(connectionId => {
        this.sendToConnection(connectionId, message);
      });
    }
  }

  /**
   * Get connection statistics
   */
  getStats() {
    return {
      totalConnections: this.connections.size,
      gameRooms: this.gameRooms.size,
      chatRooms: this.chatRooms.size,
      tournamentRooms: this.tournamentRooms.size,
      activeUsers: this.userConnections.size
    };
  }

  /**
   * Clean up inactive connections
   */
  cleanup() {
    const now = new Date();
    const timeout = 5 * 60 * 1000; // 5 minutes

    this.connections.forEach((connection, connectionId) => {
      if (now - connection.lastPing > timeout) {
        connection.ws.terminate();
        this.handleDisconnection(connectionId);
      }
    });
  }

  /**
   * Store chat message in database (placeholder)
   */
  async storeChatMessage(gameId, userId, message, messageType) {
    // TODO: Implement database storage
    console.log(`💬 Storing chat message for game ${gameId} from user ${userId}`);
  }

  /**
   * Mark notification as read (placeholder)
   */
  async markNotificationRead(connectionId, notificationId) {
    // TODO: Implement database update
    console.log(`📧 Marking notification ${notificationId} as read`);
  }
}

// Singleton instance
const wsService = new WebSocketService();

module.exports = wsService;
