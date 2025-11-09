/**
 * MultiplayerGame View - Complete Real-time Backgammon Experience
 * Integrates GameBoard and GameChat with WebSocket synchronization
 */

<template>
  <div class="multiplayer-game-container">
    <!-- Game Header -->
    <div class="game-header">
      <div class="game-title">
        <h1>🎲 Partie Multijoueur #{{ $route.params.gameId }}</h1>
        <div class="game-status" :class="gameStatusClass">
          {{ gameStatusText }}
        </div>
      </div>
      
      <div class="game-actions">
        <button
          @click="toggleFullscreen"
          class="action-btn fullscreen"
          title="Plein écran"
        >
          {{ isFullscreen ? '🔲' : '🔳' }}
        </button>
        <button
          @click="toggleSettings"
          class="action-btn settings"
          title="Paramètres"
        >
          ⚙️
        </button>
        <button
          @click="leaveGame"
          class="action-btn leave"
          title="Quitter la partie"
        >
          🚪
        </button>
      </div>
    </div>

    <!-- Main Game Area -->
    <div class="game-main" :class="{ 'settings-open': showSettings }">
      <!-- Game Board Section -->
      <div class="game-board-section">
        <GameBoard
          :game-id="$route.params.gameId"
          :initial-board-state="initialBoardState"
          @game-state-changed="handleGameStateChanged"
          @player-joined="handlePlayerJoined"
          @player-left="handlePlayerLeft"
        />
      </div>

      <!-- Chat Section -->
      <div class="game-chat-section">
        <GameChat
          :game-id="$route.params.gameId"
          :current-user-id="currentUserId"
          :current-user-name="currentUserName"
          @message-sent="handleMessageSent"
        />
      </div>
    </div>

    <!-- Settings Panel -->
    <div v-if="showSettings" class="settings-panel">
      <div class="settings-header">
        <h3>⚙️ Paramètres de la partie</h3>
        <button @click="toggleSettings" class="close-btn">✕</button>
      </div>
      
      <div class="settings-content">
        <!-- Game Settings -->
        <div class="settings-group">
          <h4>🎮 Jeu</h4>
          <label class="setting-item">
            <input
              v-model="settings.soundEnabled"
              type="checkbox"
              class="setting-checkbox"
            />
            <span>Activer les sons du jeu</span>
          </label>
          <label class="setting-item">
            <input
              v-model="settings.showHints"
              type="checkbox"
              class="setting-checkbox"
            />
            <span>Afficher les suggestions</span>
          </label>
          <label class="setting-item">
            <input
              v-model="settings.autoRoll"
              type="checkbox"
              class="setting-checkbox"
            />
            <span>Lancement automatique des dés</span>
          </label>
        </div>

        <!-- Display Settings -->
        <div class="settings-group">
          <h4>🎨 Affichage</h4>
          <div class="setting-item">
            <label>Thème du plateau</label>
            <select v-model="settings.boardTheme" class="setting-select">
              <option value="classic">Classique</option>
              <option value="modern">Moderne</option>
              <option value="dark">Sombre</option>
              <option value="wood">Bois</option>
            </select>
          </div>
          <div class="setting-item">
            <label>Taille des pièces</label>
            <select v-model="settings.pieceSize" class="setting-select">
              <option value="small">Petit</option>
              <option value="medium">Moyen</option>
              <option value="large">Grand</option>
            </select>
          </div>
        </div>

        <!-- Chat Settings -->
        <div class="settings-group">
          <h4>💬 Chat</h4>
          <label class="setting-item">
            <input
              v-model="settings.chatSoundEnabled"
              type="checkbox"
              class="setting-checkbox"
            />
            <span>Activer les sons du chat</span>
          </label>
          <label class="setting-item">
            <input
              v-model="settings.showTimestamps"
              type="checkbox"
              class="setting-checkbox"
            />
            <span>Afficher les horodatages</span>
          </label>
          <label class="setting-item">
            <input
              v-model="settings.enableEmojis"
              type="checkbox"
              class="setting-checkbox"
            />
            <span>Activer les emojis</span>
          </label>
        </div>

        <!-- Network Settings -->
        <div class="settings-group">
          <h4>🌐 Réseau</h4>
          <div class="setting-item">
            <label>Qualité de connexion</label>
            <select v-model="settings.connectionQuality" class="setting-select">
              <option value="auto">Automatique</option>
              <option value="high">Haute</option>
              <option value="medium">Moyenne</option>
              <option value="low">Basse</option>
            </select>
          </div>
          <div class="connection-info">
            <div class="info-item">
              <span>Latence:</span>
              <span :class="latencyClass">{{ latency }}ms</span>
            </div>
            <div class="info-item">
              <span>Statut:</span>
              <span :class="connectionStatusClass">{{ connectionStatusText }}</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="settings-actions">
          <button @click="resetSettings" class="action-btn reset">
            🔄 Réinitialiser
          </button>
          <button @click="saveSettings" class="action-btn save">
            💾 Sauvegarder
          </button>
        </div>
      </div>
    </div>

    <!-- Game Over Modal -->
    <div v-if="showGameOver" class="modal-overlay">
      <div class="game-over-modal">
        <div class="modal-header">
          <h2>🏆 Partie Terminée</h2>
        </div>
        <div class="modal-content">
          <div class="winner-announcement">
            <div class="winner-icon">👑</div>
            <h3>{{ winnerName }} a gagné !</h3>
            <p class="winner-score">Score: {{ winnerScore }}</p>
          </div>
          
          <div class="game-stats">
            <h4>Statistiques de la partie</h4>
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-label">Durée</span>
                <span class="stat-value">{{ gameDuration }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Coups joués</span>
                <span class="stat-value">{{ totalMoves }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Dés lancés</span>
                <span class="stat-value">{{ totalRolls }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Messages</span>
                <span class="stat-value">{{ totalMessages }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="playAgain" class="action-btn primary">
            🎮 Rejouer
          </button>
          <button @click="returnToLobby" class="action-btn secondary">
            🏠 Retour au lobby
          </button>
        </div>
      </div>
    </div>

    <!-- Connection Issues Toast -->
    <div v-if="showConnectionError" class="toast error">
      <div class="toast-content">
        <span class="toast-icon">⚠️</span>
        <span class="toast-message">Problème de connexion détecté</span>
        <button @click="dismissConnectionError" class="toast-close">✕</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'
import { useUserStore } from '@/stores/user'
import GameBoard from '@/components/GameBoard.vue'
import GameChat from '@/components/GameChat.vue'
import wsClient from '@/services/websocket.client'

export default {
  name: 'MultiplayerGame',
  components: {
    GameBoard,
    GameChat
  },
  
  setup() {
    const route = useRoute()
    const router = useRouter()
    const gameStore = useGameStore()
    const userStore = useUserStore()
    
    // Game state
    const gameStatus = ref('WAITING')
    const initialBoardState = ref('4HPwATDgc/ABMA')
    const currentUserId = ref(userStore.user?.id || 'guest')
    const currentUserName = ref(userStore.user?.username || 'Invité')
    const gameStartTime = ref(new Date())
    const totalMoves = ref(0)
    const totalRolls = ref(0)
    const totalMessages = ref(0)
    
    // UI state
    const isFullscreen = ref(false)
    const showSettings = ref(false)
    const showGameOver = ref(false)
    const showConnectionError = ref(false)
    const winnerName = ref('')
    const winnerScore = ref(0)
    
    // Network state
    const connectionStatus = ref('disconnected')
    const latency = ref(0)
    
    // Settings
    const settings = ref({
      soundEnabled: true,
      showHints: false,
      autoRoll: false,
      boardTheme: 'classic',
      pieceSize: 'medium',
      chatSoundEnabled: true,
      showTimestamps: true,
      enableEmojis: true,
      connectionQuality: 'auto'
    })
    
    // WebSocket connections
    let gameConnectionId = null
    let chatConnectionId = null
    let latencyInterval = null
    
    // Computed properties
    const gameStatusClass = computed(() => {
      switch (gameStatus.value) {
        case 'WAITING': return 'waiting'
        case 'PLAYING': return 'playing'
        case 'FINISHED': return 'finished'
        case 'ABORTED': return 'aborted'
        default: return 'unknown'
      }
    })
    
    const gameStatusText = computed(() => {
      switch (gameStatus.value) {
        case 'WAITING': return '⏳ En attente de joueurs'
        case 'PLAYING': return '🎮 Partie en cours'
        case 'FINISHED': return '✅ Partie terminée'
        case 'ABORTED': return '❌ Partie abandonnée'
        default: return '❓ État inconnu'
      }
    })
    
    const connectionStatusClass = computed(() => {
      switch (connectionStatus.value) {
        case 'connected': return 'connected'
        case 'connecting': return 'connecting'
        case 'disconnected': return 'disconnected'
        case 'error': return 'error'
        default: return 'unknown'
      }
    })
    
    const connectionStatusText = computed(() => {
      switch (connectionStatus.value) {
        case 'connected': return 'Connecté'
        case 'connecting': return 'Connexion...'
        case 'disconnected': return 'Déconnecté'
        case 'error': return 'Erreur'
        default: return 'Inconnu'
      }
    })
    
    const latencyClass = computed(() => {
      if (latency.value < 50) return 'good'
      if (latency.value < 150) return 'medium'
      return 'poor'
    })
    
    const gameDuration = computed(() => {
      const duration = Date.now() - gameStartTime.value.getTime()
      const minutes = Math.floor(duration / 60000)
      const seconds = Math.floor((duration % 60000) / 1000)
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    })
    
    // Initialize game
    const initializeGame = async () => {
      try {
        // Load game data
        await gameStore.loadGame(route.params.gameId)
        
        if (gameStore.currentGame) {
          gameStatus.value = gameStore.currentGame.status
          initialBoardState.value = gameStore.currentGame.board_state
          gameStartTime.value = new Date(gameStore.currentGame.created_at)
        }
        
        // Connect to WebSocket
        await connectToGame()
        
        // Start latency monitoring
        startLatencyMonitoring()
        
      } catch (error) {
        console.error('Failed to initialize game:', error)
        showConnectionError.value = true
      }
    }
    
    // Connect to game WebSocket
    const connectToGame = async () => {
      try {
        const token = localStorage.getItem('jwt_token')
        if (!token) {
          throw new Error('No authentication token')
        }
        
        // Connect to game channel
        gameConnectionId = await wsClient.connect('game', route.params.gameId, token)
        
        // Connect to chat channel
        chatConnectionId = await wsClient.connect('chat', route.params.gameId, token)
        
        setupWebSocketHandlers()
        connectionStatus.value = 'connected'
        
      } catch (error) {
        console.error('WebSocket connection failed:', error)
        connectionStatus.value = 'error'
        showConnectionError.value = true
      }
    }
    
    // Setup WebSocket handlers
    const setupWebSocketHandlers = () => {
      wsClient.on('connected', (data) => {
        console.log('Game WebSocket connected:', data)
        connectionStatus.value = 'connected'
      })
      
      wsClient.on('disconnected', () => {
        connectionStatus.value = 'disconnected'
        showConnectionError.value = true
      })
      
      wsClient.on('error', (data) => {
        console.error('WebSocket error:', data)
        connectionStatus.value = 'error'
        showConnectionError.value = true
      })
      
      // Game events
      wsClient.on('game_state_response', (data) => {
        handleGameStateChanged(data.state)
      })
      
      wsClient.on('game_finished', (data) => {
        handleGameFinished(data)
      })
    }
    
    // Event handlers
    const handleGameStateChanged = (state) => {
      gameStatus.value = state.status
      // Update other game state as needed
    }
    
    const handlePlayerJoined = (data) => {
      console.log('Player joined:', data)
      totalMoves.value++
    }
    
    const handlePlayerLeft = (data) => {
      console.log('Player left:', data)
    }
    
    const handleMessageSent = (data) => {
      totalMessages.value++
    }
    
    const handleGameFinished = (data) => {
      gameStatus.value = 'FINISHED'
      winnerName.value = data.winnerName || 'Joueur'
      winnerScore.value = data.winnerScore || 0
      showGameOver.value = true
    }
    
    // UI actions
    const toggleFullscreen = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen()
        isFullscreen.value = true
      } else {
        document.exitFullscreen()
        isFullscreen.value = false
      }
    }
    
    const toggleSettings = () => {
      showSettings.value = !showSettings.value
    }
    
    const leaveGame = () => {
      if (confirm('Êtes-vous sûr de vouloir quitter la partie ?')) {
        disconnectFromGame()
        router.push('/lobby')
      }
    }
    
    const playAgain = () => {
      showGameOver.value = false
      // Create new game or find another
      router.push('/create-game')
    }
    
    const returnToLobby = () => {
      showGameOver.value = false
      router.push('/lobby')
    }
    
    const dismissConnectionError = () => {
      showConnectionError.value = false
    }
    
    // Settings actions
    const resetSettings = () => {
      settings.value = {
        soundEnabled: true,
        showHints: false,
        autoRoll: false,
        boardTheme: 'classic',
        pieceSize: 'medium',
        chatSoundEnabled: true,
        showTimestamps: true,
        enableEmojis: true,
        connectionQuality: 'auto'
      }
    }
    
    const saveSettings = () => {
      // Save settings to localStorage or backend
      localStorage.setItem('gameSettings', JSON.stringify(settings.value))
      toggleSettings()
    }
    
    // Load settings from localStorage
    const loadSettings = () => {
      const saved = localStorage.getItem('gameSettings')
      if (saved) {
        try {
          settings.value = { ...settings.value, ...JSON.parse(saved) }
        } catch (error) {
          console.error('Failed to load settings:', error)
        }
      }
    }
    
    // Network monitoring
    const startLatencyMonitoring = () => {
      latencyInterval = setInterval(() => {
        if (connectionStatus.value === 'connected') {
          measureLatency()
        }
      }, 5000) // Measure every 5 seconds
    }
    
    const measureLatency = () => {
      const startTime = Date.now()
      
      // Send ping message (in a real implementation, you'd have a proper ping/pong)
      if (gameConnectionId) {
        wsClient.send(gameConnectionId, {
          type: 'ping',
          timestamp: startTime
        })
        
        // Wait for pong response (simplified)
        setTimeout(() => {
          latency.value = Date.now() - startTime
        }, 100)
      }
    }
    
    // Cleanup
    const disconnectFromGame = () => {
      if (gameConnectionId) {
        wsClient.disconnect(gameConnectionId)
      }
      if (chatConnectionId) {
        wsClient.disconnect(chatConnectionId)
      }
      if (latencyInterval) {
        clearInterval(latencyInterval)
      }
    }
    
    // Watch for connection quality changes
    watch(() => settings.value.connectionQuality, (newQuality) => {
      // Adjust WebSocket behavior based on quality
      console.log('Connection quality changed to:', newQuality)
    })
    
    // Lifecycle
    onMounted(() => {
      loadSettings()
      initializeGame()
      
      // Handle fullscreen changes
      document.addEventListener('fullscreenchange', () => {
        isFullscreen.value = !!document.fullscreenElement
      })
    })
    
    onUnmounted(() => {
      disconnectFromGame()
    })
    
    return {
      // Game state
      gameStatus,
      gameStatusClass,
      gameStatusText,
      initialBoardState,
      currentUserId,
      currentUserName,
      
      // UI state
      isFullscreen,
      showSettings,
      showGameOver,
      showConnectionError,
      winnerName,
      winnerScore,
      
      // Network state
      connectionStatus,
      connectionStatusClass,
      connectionStatusText,
      latency,
      latencyClass,
      
      // Settings
      settings,
      
      // Game stats
      gameDuration,
      totalMoves,
      totalRolls,
      totalMessages,
      
      // Methods
      toggleFullscreen,
      toggleSettings,
      leaveGame,
      playAgain,
      returnToLobby,
      dismissConnectionError,
      resetSettings,
      saveSettings,
      handleGameStateChanged,
      handlePlayerJoined,
      handlePlayerLeft,
      handleMessageSent
    }
  }
}
</script>

<style scoped>
.multiplayer-game-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: white;
}

.game-title h1 {
  margin: 0 0 10px 0;
  font-size: 1.5em;
  font-weight: bold;
}

.game-status {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9em;
  font-weight: bold;
}

.game-status.waiting {
  background: #ff9800;
  color: white;
}

.game-status.playing {
  background: #4caf50;
  color: white;
}

.game-status.finished {
  background: #2196f3;
  color: white;
}

.game-status.aborted {
  background: #f44336;
  color: white;
}

.game-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  padding: 10px 15px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  font-size: 1.2em;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.action-btn.leave:hover {
  background: rgba(244, 67, 54, 0.8);
}

.game-main {
  flex: 1;
  display: flex;
  gap: 20px;
  padding: 20px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.game-main.settings-open {
  transform: translateX(-300px);
}

.game-board-section {
  flex: 2;
  min-width: 0;
}

.game-chat-section {
  flex: 1;
  min-width: 300px;
  max-width: 400px;
}

.settings-panel {
  position: fixed;
  right: 0;
  top: 0;
  width: 300px;
  height: 100vh;
  background: white;
  box-shadow: -5px 0 20px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  overflow-y: auto;
  transform: translateX(0);
  transition: transform 0.3s ease;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.settings-header h3 {
  margin: 0;
  font-size: 1.2em;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.5em;
  cursor: pointer;
  padding: 5px;
  border-radius: 5px;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.settings-content {
  padding: 20px;
}

.settings-group {
  margin-bottom: 30px;
}

.settings-group h4 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 1.1em;
  border-bottom: 2px solid #667eea;
  padding-bottom: 5px;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.setting-item:hover {
  background: #e8eaf6;
}

.setting-checkbox {
  cursor: pointer;
}

.setting-select {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background: white;
  cursor: pointer;
}

.connection-info {
  margin-top: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.info-item span:first-child {
  font-weight: bold;
  color: #666;
}

.info-item span:last-child {
  font-weight: bold;
}

.info-item span.good {
  color: #4caf50;
}

.info-item span.medium {
  color: #ff9800;
}

.info-item span.poor {
  color: #f44336;
}

.info-item span.connected {
  color: #4caf50;
}

.info-item span.connecting {
  color: #ff9800;
}

.info-item span.disconnected,
.info-item span.error {
  color: #f44336;
}

.settings-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.action-btn.reset {
  background: #ff9800;
  color: white;
}

.action-btn.save {
  background: #4caf50;
  color: white;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.game-over-modal {
  background: white;
  border-radius: 15px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.modal-header h2 {
  margin: 0 0 20px 0;
  color: #667eea;
  font-size: 1.8em;
}

.winner-announcement {
  margin-bottom: 30px;
}

.winner-icon {
  font-size: 4em;
  margin-bottom: 15px;
}

.winner-announcement h3 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 1.5em;
}

.winner-score {
  color: #666;
  font-size: 1.2em;
}

.game-stats h4 {
  margin: 0 0 15px 0;
  color: #333;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.stat-item {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.9em;
  color: #666;
  margin-bottom: 5px;
}

.stat-value {
  display: block;
  font-size: 1.3em;
  font-weight: bold;
  color: #667eea;
}

.modal-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.action-btn.primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 12px 24px;
}

.action-btn.secondary {
  background: #6c757d;
  color: white;
  padding: 12px 24px;
}

.toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 3000;
  animation: slideIn 0.3s ease;
}

.toast.error {
  background: #f44336;
  color: white;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toast-icon {
  font-size: 1.2em;
}

.toast-message {
  flex: 1;
}

.toast-close {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1.2em;
  padding: 5px;
  border-radius: 5px;
  transition: all 0.3s ease;
}

.toast-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 1024px) {
  .game-main {
    flex-direction: column;
  }
  
  .game-chat-section {
    max-width: none;
    min-height: 300px;
  }
}

@media (max-width: 768px) {
  .game-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .game-main {
    padding: 10px;
  }
  
  .settings-panel {
    width: 100%;
  }
  
  .game-main.settings-open {
    transform: translateY(-100vh);
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>
