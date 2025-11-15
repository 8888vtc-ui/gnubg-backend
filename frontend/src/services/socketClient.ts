/* eslint-disable no-console */
export type GameEventType = 'join' | 'move' | 'resign' | 'draw';

export interface SocketMessage<T = unknown> {
  type: GameEventType;
  payload: T;
  timestamp: string;
  senderId: string | null;
}

export interface SocketClientOptions {
  baseUrl?: string;
  reconnectAttempts?: number;
  reconnectDelayMs?: number;
}

type MessageHandler = (message: SocketMessage) => void;

type InternalConnection = {
  socket: WebSocket;
  handlers: Set<MessageHandler>;
  gameId: string;
  token: string;
  reconnectAttempts: number;
  options: Required<SocketClientOptions>;
};

const DEFAULT_OPTIONS: Required<SocketClientOptions> = {
  baseUrl: import.meta.env.VITE_WS_BASE_URL ?? 'wss://gammon-guru-api.onrender.com',
  reconnectAttempts: 5,
  reconnectDelayMs: 1_000
};

class SocketClient {
  private connection: InternalConnection | null = null;

  connect(gameId: string, token: string, options: SocketClientOptions = {}) {
    if (this.connection) {
      this.disconnect(1000, 'Reconnecting');
    }

    const mergedOptions: Required<SocketClientOptions> = {
      ...DEFAULT_OPTIONS,
      ...options
    };

    const protocol = `Bearer ${token}`;
    const url = `${mergedOptions.baseUrl.replace(/\/$/, '')}/ws/game/${gameId}`;

    const socket = new WebSocket(url, protocol);
    const handlers = new Set<MessageHandler>();

    this.connection = {
      socket,
      handlers,
      gameId,
      token,
      reconnectAttempts: 0,
      options: mergedOptions
    };

    socket.addEventListener('open', () => {
      console.info(`[ws] Connected to game ${gameId}`);
      this.sendJoin();
    });

    socket.addEventListener('message', (event) => {
      try {
        const message: SocketMessage = JSON.parse(event.data);
        handlers.forEach((handler) => handler(message));
      } catch (error) {
        console.error('[ws] Failed to parse message', error);
      }
    });

    socket.addEventListener('close', (event) => {
      console.warn(`[ws] Connection closed (${event.code}) ${event.reason ?? ''}`);
      this.reconnect();
    });

    socket.addEventListener('error', (event) => {
      console.error('[ws] Connection error', event);
    });
  }

  disconnect(code = 1000, reason?: string) {
    if (!this.connection) {
      return;
    }

    this.connection.socket.close(code, reason);
    this.connection = null;
  }

  onMessage(handler: MessageHandler) {
    if (!this.connection) {
      throw new Error('Socket is not connected');
    }

    this.connection.handlers.add(handler);

    return () => {
      this.connection?.handlers.delete(handler);
    };
  }

  sendMove(move: string) {
    this.sendPayload('move', move);
  }

  sendJoin() {
    this.sendPayload('join', {});
  }

  sendResign() {
    this.sendPayload('resign', {});
  }

  sendDraw() {
    this.sendPayload('draw', {});
  }

  private sendPayload(type: GameEventType, payload: unknown) {
    if (!this.connection) {
      console.warn('[ws] Cannot send message, socket not connected');
      return;
    }

    if (this.connection.socket.readyState !== WebSocket.OPEN) {
      console.warn('[ws] Cannot send message, socket not open');
      return;
    }

    this.connection.socket.send(
      JSON.stringify({
        type,
        payload
      })
    );
  }

  private reconnect() {
    if (!this.connection) {
      return;
    }

    const { reconnectAttempts, options, gameId, token } = this.connection;

    if (reconnectAttempts >= options.reconnectAttempts) {
      console.error('[ws] Max reconnect attempts reached');
      this.connection = null;
      return;
    }

    const delay = options.reconnectDelayMs * Math.pow(2, reconnectAttempts);
    console.info(`[ws] Attempting to reconnect in ${delay}ms`);

    setTimeout(() => {
      if (!this.connection) {
        return;
      }

      this.connection.reconnectAttempts += 1;
      this.connect(gameId, token, options);
    }, delay);
  }
}

const socketClient = new SocketClient();

export default socketClient;
