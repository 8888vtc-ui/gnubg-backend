<template>
  <div class="game-view">
    <!-- Header -->
    <header class="game-header">
      <div class="header-content">
        <button @click="goBack" class="back-btn">
          ← Retour
        </button>
        <h1 class="game-title">🎲 GammonGuru</h1>
        <div class="game-actions">
          <button @click="showAnalysis = !showAnalysis" class="analysis-btn">
            🧠 Analyse
          </button>
          <button @click="showChat = !showChat" class="chat-btn">
            💬 Chat
          </button>
        </div>
      </div>
    </header>

    <!-- Contenu principal -->
    <main class="game-main">
      <!-- Panneau latéral gauche -->
      <aside class="side-panel left-panel" v-if="showAnalysis">
        <div class="panel-content">
          <h3>🧠 Analyse GNUBG</h3>
          
          <div v-if="!analysis" class="analysis-placeholder">
            <p>Lancez les dés et jouez un coup pour voir l'analyse</p>
            <button @click="analyzeCurrentPosition" class="analyze-btn" :disabled="!canAnalyze">
              Analyser position
            </button>
          </div>
          
          <div v-else class="analysis-results">
            <div class="equity-info">
              <h4>Equity: {{ analysis.equity?.toFixed(3) || 'N/A' }}</h4>
              <div class="win-probabilities">
                <div class="prob-item">
                  <span>Blanc:</span>
                  <span>{{ (analysis.winProbability?.white * 100 || 0).toFixed(1) }}%</span>
                </div>
                <div class="prob-item">
                  <span>Noir:</span>
                  <span>{{ (analysis.winProbability?.black * 100 || 0).toFixed(1) }}%</span>
                </div>
              </div>
            </div>
            
            <div class="best-move" v-if="analysis.bestMove">
              <h4>Meilleur coup:</h4>
              <p class="move-notation">{{ analysis.bestMove }}</p>
              <p class="move-explanation">{{ analysis.explanation }}</p>
            </div>
            
            <div class="alternatives" v-if="analysis.alternatives?.length">
              <h4>Alternatives:</h4>
              <ul>
                <li v-for="alt in analysis.alternatives" :key="alt.move">
                  {{ alt.move }} (equity: {{ alt.equity?.toFixed(3) }})
                </li>
              </ul>
            </div>
          </div>
          
          <!-- Quotas d'analyse -->
          <div class="analysis-quotas">
            <h4>Quotas d'analyse</h4>
            <div class="quota-info">
              <div class="quota-bar">
                <div class="quota-used" :style="{ width: quotaPercentage + '%' }"></div>
              </div>
              <p>{{ analysisQuota.used }} / {{ analysisQuota.total }} utilisés</p>
            </div>
          </div>
        </div>
      </aside>

      <!-- Plateau de jeu -->
      <section class="game-board-section">
        <div v-if="!gameStore.currentGame" class="game-setup">
          <h2>Nouvelle Partie</h2>
          <div class="setup-options">
            <div class="option-group">
              <h3>Mode de jeu</h3>
              <label>
                <input type="radio" v-model="gameMode" value="AI_VS_PLAYER" />
                🤖 vs Humain
              </label>
              <label>
                <input type="radio" v-model="gameMode" value="PLAYER_VS_PLAYER" />
                👥 vs Humain
              </label>
            </div>
            
            <div class="option-group" v-if="gameMode === 'AI_VS_PLAYER'">
              <h3>Difficulté IA</h3>
              <select v-model="aiDifficulty">
                <option value="EASY">🟢 Facile</option>
                <option value="MEDIUM">🟡 Moyen</option>
                <option value="HARD">🔴 Difficile</option>
              </select>
            </div>
            
            <div class="option-group">
              <h3>Options</h3>
              <label>
                <input type="checkbox" v-model="enableAnalysis" />
                Activer l'analyse GNUBG
              </label>
              <label>
                <input type="checkbox" v-model="enableChat" />
                Activer le chat
              </label>
            </div>
            
            <button @click="startNewGame" class="start-game-btn" :disabled="isLoading">
              {{ isLoading ? 'Création...' : '🎮 Commencer la partie' }}
            </button>
          </div>
        </div>
        
        <GameBoard v-else class="game-board-component" />
      </section>

      <!-- Panneau latéral droit -->
      <aside class="side-panel right-panel" v-if="showChat">
        <div class="panel-content">
          <h3>💬 Chat</h3>
          
          <div class="chat-messages" ref="chatMessagesRef">
            <div v-for="message in chatMessages" :key="message.id" class="chat-message" :class="message.type">
              <div class="message-header">
                <span class="message-author">{{ message.author }}</span>
                <span class="message-time">{{ formatTime(message.timestamp) }}</span>
              </div>
              <div class="message-content">{{ message.content }}</div>
            </div>
          </div>
          
          <div class="chat-input">
            <input 
              v-model="newMessage" 
              @keyup.enter="sendMessage"
              placeholder="Tapez votre message..."
              class="message-input"
            />
            <button @click="sendMessage" class="send-btn" :disabled="!newMessage.trim()">
              Envoyer
            </button>
          </div>
        </div>
      </aside>
    </main>

    <!-- Footer avec informations -->
    <footer class="game-footer">
      <div class="footer-content">
        <div class="game-info">
          <span v-if="gameStore.currentGame">
            Partie #{{ gameStore.currentGame.id?.slice(-8) }}
          </span>
          <span v-else>
            Prêt à jouer
          </span>
        </div>
        
        <div class="connection-status">
          <span class="status-dot" :class="{ connected: isConnected }"></span>
          {{ isConnected ? 'Connecté' : 'Déconnecté' }}
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'
import { useAuthStore } from '@/stores/auth'
import GameBoard from '@/components/GameBoard.vue'
import Dice from '@/components/Dice.vue'
import Checker from '@/components/Checker.vue'
import GameStatus from '@/components/GameStatus.vue'

export default {
  name: 'GameView',
  components: {
    GameBoard,
    Dice,
    Checker,
    GameStatus
  },
  setup() {
    const router = useRouter()
    const gameStore = useGameStore()
    const authStore = useAuthStore()
    
    // État local
    const isLoading = ref(false)
    const showAnalysis = ref(true)
    const showChat = ref(true)
    const analysis = ref(null)
    const isConnected = ref(true)
    
    // Configuration de partie
    const gameMode = ref('AI_VS_PLAYER')
    const aiDifficulty = ref('MEDIUM')
    const enableAnalysis = ref(true)
    const enableChat = ref(true)
    
    // Chat
    const chatMessages = ref([])
    const newMessage = ref('')
    const chatMessagesRef = ref(null)
    
    // Quotas d'analyse
    const analysisQuota = ref({
      used: 0,
      total: 5 // Gratuit: 5 par jour
    })
    
    // Computed
    const canAnalyze = computed(() => {
      return gameStore.currentGame && 
             gameStore.dice.length > 0 && 
             analysisQuota.value.used < analysisQuota.value.total
    })
    
    const quotaPercentage = computed(() => {
      return (analysisQuota.value.used / analysisQuota.value.total) * 100
    })
    
    // Méthodes
    const goBack = () => {
      if (gameStore.currentGame) {
        if (confirm('Êtes-vous sûr de vouloir quitter la partie en cours ?')) {
          gameStore.resetGame()
          router.push('/dashboard')
        }
      } else {
        router.push('/dashboard')
      }
    }
    
    const startNewGame = async () => {
      isLoading.value = true
      
      try {
        const result = await gameStore.createGame(
          gameMode.value,
          null, // opponentId (null pour IA)
          aiDifficulty.value
        )
        
        if (result.success) {
          // Ajouter message de bienvenue dans le chat
          addChatMessage('Système', 'Partie créée ! Bonne chance !', 'system')
          
          // Si c'est contre l'IA et que c'est son tour
          if (gameMode.value === 'AI_VS_PLAYER' && gameStore.currentPlayer === 'black') {
            setTimeout(() => makeAIMove(), 1500)
          }
        } else {
          alert('Erreur lors de la création de la partie: ' + result.error)
        }
      } catch (error) {
        console.error('Erreur création partie:', error)
        alert('Erreur lors de la création de la partie')
      } finally {
        isLoading.value = false
      }
    }
    
    const analyzeCurrentPosition = async () => {
      if (!canAnalyze.value) return
      
      try {
        analysis.value = await gameStore.analyzePosition()
        analysisQuota.value.used++
        
        // Mettre à jour l'affichage
        await nextTick()
      } catch (error) {
        console.error('Erreur analyse:', error)
        alert('Erreur lors de l\'analyse de la position')
      }
    }
    
    const makeAIMove = async () => {
      try {
        await gameStore.makeAIMove()
        
        // Ajouter message dans le chat
        addChatMessage('IA', 'J\'ai joué mon coup !', 'ai')
      } catch (error) {
        console.error('Erreur mouvement IA:', error)
      }
    }
    
    const sendMessage = () => {
      if (!newMessage.value.trim()) return
      
      const message = newMessage.value.trim()
      addChatMessage(authStore.user?.username || 'Moi', message, 'user')
      newMessage.value = ''
      
      // Simuler réponse de l'IA si mode solo
      if (gameMode.value === 'AI_VS_PLAYER') {
        setTimeout(() => {
          const responses = [
            'Bon coup !',
            'Intéressant...',
            'Je vais devoir réfléchir à ça.',
            'Bien joué !',
            'Hmm, pas mal.'
          ]
          const randomResponse = responses[Math.floor(Math.random() * responses.length)]
          addChatMessage('IA', randomResponse, 'ai')
        }, 1000 + Math.random() * 2000)
      }
    }
    
    const addChatMessage = (author, content, type = 'user') => {
      chatMessages.value.push({
        id: Date.now() + Math.random(),
        author,
        content,
        type,
        timestamp: new Date()
      })
      
      // Scroller vers le bas
      nextTick(() => {
        if (chatMessagesRef.value) {
          chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
        }
      })
    }
    
    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    // WebSocket pour le temps réel (à implémenter)
    const setupWebSocket = () => {
      // Connexion WebSocket pour le multijoueur temps réel
      // Pour l'instant, simulation
      setTimeout(() => {
        isConnected.value = true
      }, 1000)
    }
    
    // Lifecycle
    onMounted(() => {
      setupWebSocket()
      
      // Ajouter message de bienvenue
      addChatMessage('Système', 'Bienvenue sur GammonGuru !', 'system')
    })
    
    return {
      // Stores
      gameStore,
      authStore,
      
      // État
      isLoading,
      showAnalysis,
      showChat,
      analysis,
      isConnected,
      gameMode,
      aiDifficulty,
      enableAnalysis,
      enableChat,
      chatMessages,
      newMessage,
      analysisQuota,
      
      // Computed
      canAnalyze,
      quotaPercentage,
      
      // Méthodes
      goBack,
      startNewGame,
      analyzeCurrentPosition,
      sendMessage,
      formatTime
    }
  }
}
</script>

<style scoped>
.game-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  display: flex;
  flex-direction: column;
  color: white;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.game-header {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  padding: 1rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.back-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(-2px);
}

.game-title {
  font-size: 1.8rem;
  margin: 0;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.game-actions {
  display: flex;
  gap: 10px;
}

.analysis-btn, .chat-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.analysis-btn:hover, .chat-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.game-main {
  flex: 1;
  display: flex;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  padding: 2rem;
  gap: 2rem;
}

.side-panel {
  width: 300px;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.panel-content {
  padding: 1.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-content h3 {
  margin: 0 0 1rem 0;
  color: #ffd700;
  font-size: 1.2rem;
}

.game-board-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.game-setup {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2rem;
  text-align: center;
}

.game-setup h2 {
  margin: 0 0 2rem 0;
  color: #ffd700;
  font-size: 2rem;
}

.setup-options {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 400px;
  margin: 0 auto;
}

.option-group {
  text-align: left;
}

.option-group h3 {
  margin: 0 0 1rem 0;
  color: white;
  font-size: 1.1rem;
}

.option-group label {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 0.5rem;
  cursor: pointer;
}

.option-group input[type="radio"],
.option-group input[type="checkbox"] {
  width: 18px;
  height: 18px;
}

.option-group select {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
}

.start-game-btn {
  background: linear-gradient(135deg, #56ab2f 0%, #a8e063 100%);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(86, 171, 47, 0.4);
}

.start-game-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(86, 171, 47, 0.6);
}

.start-game-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.analysis-placeholder {
  text-align: center;
  opacity: 0.7;
}

.analyze-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.analyze-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.analyze-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.analysis-results {
  flex: 1;
  overflow-y: auto;
}

.equity-info {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.equity-info h4 {
  margin: 0 0 0.5rem 0;
  color: #ffd700;
}

.win-probabilities {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.prob-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.prob-item span:first-child {
  font-size: 0.9rem;
  opacity: 0.8;
}

.prob-item span:last-child {
  font-size: 1.1rem;
  font-weight: bold;
}

.best-move {
  background: rgba(255, 215, 0, 0.1);
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.best-move h4 {
  margin: 0 0 0.5rem 0;
  color: #ffd700;
}

.move-notation {
  font-family: 'Courier New', monospace;
  font-size: 1.1rem;
  font-weight: bold;
  margin: 0.5rem 0;
}

.move-explanation {
  margin: 0;
  opacity: 0.9;
  font-style: italic;
}

.alternatives ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.alternatives li {
  padding: 0.3rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.analysis-quotas {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.analysis-quotas h4 {
  margin: 0 0 0.5rem 0;
  color: #ffd700;
  font-size: 1rem;
}

.quota-info p {
  margin: 0.5rem 0 0 0;
  font-size: 0.9rem;
  opacity: 0.8;
}

.quota-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.quota-used {
  height: 100%;
  background: linear-gradient(90deg, #56ab2f 0%, #a8e063 100%);
  transition: width 0.3s ease;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 1rem;
  padding-right: 5px;
}

.chat-message {
  margin-bottom: 1rem;
  padding: 0.8rem;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
}

.chat-message.system {
  background: rgba(255, 215, 0, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.2);
}

.chat-message.ai {
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.3rem;
}

.message-author {
  font-weight: bold;
  color: #ffd700;
}

.message-time {
  font-size: 0.8rem;
  opacity: 0.6;
}

.message-content {
  margin: 0;
  line-height: 1.4;
}

.chat-input {
  display: flex;
  gap: 10px;
}

.message-input {
  flex: 1;
  padding: 10px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 0.9rem;
}

.message-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.send-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.game-footer {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  padding: 1rem 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  opacity: 0.8;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ff4444;
}

.status-dot.connected {
  background: #44ff44;
  box-shadow: 0 0 10px rgba(68, 255, 68, 0.5);
}

@media (max-width: 1200px) {
  .side-panel {
    width: 250px;
  }
}

@media (max-width: 768px) {
  .game-main {
    flex-direction: column;
    padding: 1rem;
  }
  
  .side-panel {
    width: 100%;
    order: 2;
  }
  
  .game-board-section {
    order: 1;
  }
  
  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .game-title {
    font-size: 1.5rem;
  }
}
</style>
