/**
 * WebSocket Frontend Service - GammonGuru Real-time Client
 * Handles WebSocket connections for game, chat, tournaments, and notifications
 */

class WebSocketClient {
  constructor() {
    this.connections = new Map(); // connectionId -> WebSocket instance
    this.handlers = new Map(); // eventType -> Set of handlers
    this.reconnectAttempts = new Map(); // connectionId -> attempts
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
  }

  /**
   * Connect to WebSocket endpoint
   */
  async connect(type, resourceId, token) {
    const connectionId = `${type}-${resourceId}`;
    
    try {
      // Close existing connection if any
      if (this.connections.has(connectionId)) {
        this.disconnect(connectionId);
      }

      // Build WebSocket URL
      const wsUrl = this.buildWebSocketUrl(type, resourceId, token);
      
      // Create WebSocket connection
      const ws = new WebSocket(wsUrl);
      
      // Store connection
      this.connections.set(connectionId, ws);
      this.reconnectAttempts.set(connectionId, 0);

      // Setup event handlers
      this.setupConnectionHandlers(ws, connectionId, type, resourceId, token);

      console.log(`🔌 Connecting to WebSocket: ${type}/${resourceId}`);
      
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('WebSocket connection timeout'));
        }, 10000);

        ws.onopen = () => {
          clearTimeout(timeout);
          console.log(`✅ WebSocket connected: ${type}/${resourceId}`);
          resolve(connectionId);
        };

        ws.onerror = (error) => {
          clearTimeout(timeout);
          console.error(`❌ WebSocket connection error: ${type}/${resourceId}`, error);
          reject(error);
        };
      });

    } catch (error) {
      console.error(`WebSocket connection failed: ${type}/${resourceId}`, error);
      throw error;
    }
  }

  /**
   * Build WebSocket URL with authentication
   */
  buildWebSocketUrl(type, resourceId, token) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    
    // For development, use Railway backend
    const wsHost = host.includes('localhost') ? 'gammon-guru-backend.railway.app' : host;
    
    return `${protocol}//${wsHost}/ws/${type}/${resourceId}?token=${encodeURIComponent(token)}`;
  }

  /**
   * Setup WebSocket event handlers
   */
  setupConnectionHandlers(ws, connectionId, type, resourceId, token) {
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleMessage(connectionId, message);
      } catch (error) {
        console.error('WebSocket message parse error:', error);
      }
    };

    ws.onclose = (event) => {
      console.log(`🔌 WebSocket closed: ${connectionId}`, event.code, event.reason);
      this.connections.delete(connectionId);
      
      // Attempt reconnection if not a normal closure
      if (event.code !== 1000) {
        this.attemptReconnection(connectionId, type, resourceId, token);
      }
    };

    ws.onerror = (error) => {
      console.error(`WebSocket error: ${connectionId}`, error);
      this.emit('error', { connectionId, error });
    };
  }

  /**
   * Handle incoming WebSocket messages
   */
  handleMessage(connectionId, message) {
    console.log(`📨 WebSocket message: ${connectionId}`, message);
    
    // Emit specific event type
    if (message.type) {
      this.emit(message.type, {
        connectionId,
        ...message
      });
    }
    
    // Emit generic message event
    this.emit('message', {
      connectionId,
      message
    });
  }

  /**
   * Attempt to reconnect WebSocket
   */
  async attemptReconnection(connectionId, type, resourceId, token) {
    const attempts = this.reconnectAttempts.get(connectionId) || 0;
    
    if (attempts >= this.maxReconnectAttempts) {
      console.error(`❌ Max reconnection attempts reached for: ${connectionId}`);
      this.emit('reconnectFailed', { connectionId, type, resourceId });
      return;
    }

    const delay = this.reconnectDelay * Math.pow(2, attempts); // Exponential backoff
    this.reconnectAttempts.set(connectionId, attempts + 1);

    console.log(`🔄 Reconnecting to WebSocket in ${delay}ms: ${connectionId}`);

    setTimeout(async () => {
      try {
        await this.connect(type, resourceId, token);
        this.reconnectAttempts.set(connectionId, 0);
        this.emit('reconnected', { connectionId, type, resourceId });
      } catch (error) {
        console.error(`Reconnection failed for: ${connectionId}`, error);
        this.attemptReconnection(connectionId, type, resourceId, token);
      }
    }, delay);
  }

  /**
   * Send message through WebSocket
   */
  send(connectionId, message) {
    const ws = this.connections.get(connectionId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
      return true;
    } else {
      console.warn(`Cannot send message - WebSocket not connected: ${connectionId}`);
      return false;
    }
  }

  /**
   * Send game move
   */
  sendGameMove(connectionId, move) {
    return this.send(connectionId, {
      type: 'game_move',
      move,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send dice roll
   */
  sendDiceRoll(connectionId, dice) {
    return this.send(connectionId, {
      type: 'game_roll',
      dice,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Request game state
   */
  requestGameState(connectionId) {
    return this.send(connectionId, {
      type: 'game_state',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send chat message
   */
  sendChatMessage(connectionId, message, username, messageType = 'TEXT') {
    return this.send(connectionId, {
      type: 'chat_message',
      message,
      username,
      messageType,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Notify player joined
   */
  notifyPlayerJoined(connectionId) {
    return this.send(connectionId, {
      type: 'player_joined',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Notify player left
   */
  notifyPlayerLeft(connectionId) {
    return this.send(connectionId, {
      type: 'player_left',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Acknowledge notification
   */
  acknowledgeNotification(connectionId, notificationId) {
    return this.send(connectionId, {
      type: 'notification_ack',
      notificationId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(connectionId) {
    const ws = this.connections.get(connectionId);
    if (ws) {
      ws.close(1000, 'Client disconnect');
      this.connections.delete(connectionId);
      this.reconnectAttempts.delete(connectionId);
      console.log(`🔌 WebSocket disconnected: ${connectionId}`);
    }
  }

  /**
   * Disconnect all WebSockets
   */
  disconnectAll() {
    this.connections.forEach((ws, connectionId) => {
      this.disconnect(connectionId);
    });
    console.log('🔌 All WebSockets disconnected');
  }

  /**
   * Check if connection is active
   */
  isConnected(connectionId) {
    const ws = this.connections.get(connectionId);
    return ws && ws.readyState === WebSocket.OPEN;
  }

  /**
   * Get connection statistics
   */
  getStats() {
    const stats = {
      totalConnections: this.connections.size,
      connectedCount: 0,
      connectingCount: 0,
      disconnectedCount: 0
    };

    this.connections.forEach((ws, connectionId) => {
      switch (ws.readyState) {
        case WebSocket.OPEN:
          stats.connectedCount++;
          break;
        case WebSocket.CONNECTING:
          stats.connectingCount++;
          break;
        default:
          stats.disconnectedCount++;
      }
    });

    return stats;
  }

  /**
   * Event emitter methods
   */
  on(eventType, handler) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType).add(handler);
  }

  off(eventType, handler) {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.handlers.delete(eventType);
      }
    }
  }

  emit(eventType, data) {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`WebSocket event handler error: ${eventType}`, error);
        }
      });
    }
  }
}

// Singleton instance
const wsClient = new WebSocketClient();

export default wsClient;
