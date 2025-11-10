/**
 * API Service - Centralized API Management
 * Handles all API calls to backend, Claude, OpenAI, and Replicate
 */

class ApiService {
  constructor() {
    // Determine base URL based on environment
    this.isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    this.baseUrl = this.isDev ?
      (import.meta.env.VITE_DEV_API_BASE_URL || 'http://localhost:3000') :
      (import.meta.env.VITE_API_BASE_URL || 'https://gammon-guru-api.onrender.com');

    // JWT token storage
    this.token = localStorage.getItem('authToken') || null;

    // API Keys - SECURE: Only backend should have access
    this.apiKeys = {
      claude: null, // Removed for security - use backend proxy
      openai: null, // Removed for security - use backend proxy
      replicate: null // Removed for security - use backend proxy
    };

    // Feature flags
    this.features = {
      claude: import.meta.env.VITE_ENABLE_CLAUDE === 'true',
      openai: import.meta.env.VITE_ENABLE_OPENAI === 'true',
      imageGeneration: import.meta.env.VITE_ENABLE_IMAGE_GENERATION === 'true',
      websocket: import.meta.env.VITE_ENABLE_WEBSOCKET === 'true'
    };
  }

  /**
   * Generic API request method
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    // Add JWT token if available
    if (this.token) {
      config.headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  /**
   * Authentication methods
   */
  async login(email, password) {
    const response = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async register(name, email, password) {
    const response = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });

    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async logout() {
    const response = await this.request('/api/auth/logout', {
      method: 'POST'
    });

    this.clearToken();
    return response;
  }

  async getProfile() {
    return this.request('/api/user/profile');
  }

  /**
   * Token management
   */
  setToken(token) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  isAuthenticated() {
    return !!this.token;
  }

  /**
   * Backend API calls
   */
  async getHealth() {
    return this.request('/health');
  }

  async getWebSocketStats() {
    return this.request('/api/ws/stats');
  }

  async createGame(gameData = {}) {
    const data = {
      gameMode: gameData.gameMode || 'AI_VS_PLAYER',
      difficulty: gameData.difficulty || 'MEDIUM',
      ...gameData
    };

    return this.request('/api/games', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getGameStatus(gameId) {
    return this.request(`/api/games/${gameId}`);
  }

  async rollDice(gameId) {
    return this.request(`/api/games/${gameId}/roll`, {
      method: 'POST'
    });
  }

  async makeMove(gameId, from, to) {
    return this.request(`/api/games/${gameId}/move`, {
      method: 'POST',
      body: JSON.stringify({ from, to })
    });
  }

  async getPlayers() {
    return this.request('/api/players');
  }

  async getGnubgAnalysis(positionData) {
    return this.request('/api/gnubg/analyze', {
      method: 'POST',
      body: JSON.stringify(positionData)
    });
  }

  /**
   * Claude AI API calls - SECURE: Backend proxy only
   */
  async askClaude(message, context = {}) {
    if (!this.features.claude) {
      throw new Error('Claude AI is not available');
    }

    return this.request('/api/claude/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        context
        // API key managed by backend for security
      })
    });
  }

  async analyzeGameWithClaude(gameData) {
    if (!this.features.claude) {
      throw new Error('Claude AI is not available');
    }

    return this.request('/api/claude/analyze-game', {
      method: 'POST',
      body: JSON.stringify({
        ...gameData
        // API key managed by backend for security
      })
    });
  }

  async getSuggestedMove(position, dice, playerColor) {
    if (!this.features.claude) {
      throw new Error('Claude AI is not available');
    }

    return this.request('/api/claude/suggest-move', {
      method: 'POST',
      body: JSON.stringify({
        position,
        dice,
        playerColor
        // API key managed by backend for security
      })
    });
  }

  /**
   * OpenAI API calls - SECURE: Backend proxy only
   */
  async askOpenAI(message, context = {}) {
    if (!this.features.openai) {
      throw new Error('OpenAI is not available');
    }

    return this.request('/api/openai/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        context
        // API key managed by backend for security
      })
    });
  }

  /**
   * Image generation with Replicate - SECURE: Backend proxy only
   */
  async generateImage(prompt, style = 'backgammon') {
    if (!this.features.imageGeneration) {
      throw new Error('Image generation is not available');
    }

    return this.request('/api/images/generate', {
      method: 'POST',
      body: JSON.stringify({
        prompt,
        style
        // API key managed by backend for security
      })
    });
  }

  /**
   * User management
   */
  async getUserProfile(email) {
    return this.request(`/api/user/profile/${email}`);
  }

  async updateUserProfile(userId, updates) {
    return this.request(`/api/user/profile/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  /**
   * Statistics
   */
  async getGameStats() {
    return this.request('/api/stats/games');
  }

  /**
   * Check API availability
   */
  async checkApiStatus() {
    const status = {
      backend: false,
      claude: false,
      openai: false,
      imageGeneration: false,
      websocket: false
    };

    try {
      // Check backend
      await this.getHealth();
      status.backend = true;
    } catch (error) {
      console.error('Backend health check failed:', error);
    }

    try {
      // Check Claude
      if (this.features.claude && this.apiKeys.claude) {
        await this.request('/api/claude/status');
        status.claude = true;
      }
    } catch (error) {
      console.error('Claude status check failed:', error);
    }

    try {
      // Check OpenAI
      if (this.features.openai && this.apiKeys.openai) {
        await this.request('/api/openai/status');
        status.openai = true;
      }
    } catch (error) {
      console.error('OpenAI status check failed:', error);
    }

    try {
      // Check image generation
      if (this.features.imageGeneration && this.apiKeys.replicate) {
        await this.request('/api/images/status');
        status.imageGeneration = true;
      }
    } catch (error) {
      console.error('Image generation status check failed:', error);
    }

    try {
      // Check WebSocket
      if (this.features.websocket) {
        await this.getWebSocketStats();
        status.websocket = true;
      }
    } catch (error) {
      console.error('WebSocket status check failed:', error);
    }

    return status;
  }

  /**
   * Get environment info
   */
  getEnvironment() {
    return {
      isDev: this.isDev,
      baseUrl: this.baseUrl,
      features: this.features,
      app: {
        name: import.meta.env.VITE_APP_NAME || 'GammonGuru',
        version: import.meta.env.VITE_APP_VERSION || '1.0.0',
        description: import.meta.env.VITE_APP_DESCRIPTION || 'Real-time Backgammon with AI Coaching'
      }
    };
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
