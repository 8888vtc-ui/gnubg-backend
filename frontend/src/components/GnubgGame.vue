<template>
  <div class="gnubg-game-container">
    <!-- Header GNUBG -->
    <div class="gnubg-header">
      <div class="ai-info">
        <div class="ai-avatar">🤖</div>
        <div class="ai-details">
          <h3>GNUBG {{ difficulty }}</h3>
          <div class="ai-stats">
            <span class="elo">ELO: {{ gnubgOpponent?.elo || 2000 }}</span>
            <span class="version">v{{ gnubgOpponent?.version || '1.06.002' }}</span>
          </div>
        </div>
      </div>
      <div class="game-status">
        <div class="status-indicator" :class="{ 'thinking': isGnubgThinking }">
          {{ isGnubgThinking ? '🧠 GNUBG réfléchit...' : '⚡ Votre tour' }}
        </div>
      </div>
    </div>

    <!-- Plateau de jeu -->
    <GameBoard 
      :game="currentGame"
      :isPlayerTurn="isPlayerTurn"
      @roll-dice="handleRollDice"
      @make-move="handleMakeMove"
      @request-analysis="handleRequestAnalysis"
    />

    <!-- Panel GNUBG -->
    <div class="gnubg-panel">
      <div class="analysis-section">
        <h4>🧠 Analyse GNUBG</h4>
        
        <!-- Suggestions de coups -->
        <div v-if="moveSuggestions.length > 0" class="suggestions">
          <h5>Meilleurs coups:</h5>
          <div class="suggestion-list">
            <div 
              v-for="suggestion in moveSuggestions" 
              :key="suggestion.move"
              class="suggestion-item"
              :class="{ 'best': suggestion.rank === 1 }"
            >
              <span class="rank">#{{ suggestion.rank }}</span>
              <span class="move">{{ suggestion.move }}</span>
              <span class="equity">Equity: {{ suggestion.equity.toFixed(3) }}</span>
              <span class="win-rate">{{ (suggestion.winProbability * 100).toFixed(1) }}%</span>
            </div>
          </div>
        </div>

        <!-- Évaluation de position -->
        <div v-if="positionEvaluation" class="position-eval">
          <h5>Évaluation de position:</h5>
          <div class="eval-stats">
            <div class="stat">
              <span class="label">Win Probability:</span>
              <span class="value">{{ (positionEvaluation.winProbability * 100).toFixed(1) }}%</span>
            </div>
            <div class="stat">
              <span class="label">Equity:</span>
              <span class="value">{{ positionEvaluation.equity.toFixed(3) }}</span>
            </div>
            <div class="stat">
              <span class="label">Gammon:</span>
              <span class="value">{{ (positionEvaluation.gammonProbability * 100).toFixed(1) }}%</span>
            </div>
            <div class="stat">
              <span class="label">Cube Decision:</span>
              <span class="value cube-decision" :class="positionEvaluation.cubeDecision.toLowerCase()">
                {{ positionEvaluation.cubeDecision }}
              </span>
            </div>
          </div>
        </div>

        <!-- Dernier coup GNUBG -->
        <div v-if="lastGnubgMove" class="last-ai-move">
          <h5>Dernier coup GNUBG:</h5>
          <div class="ai-move">
            <span class="move">{{ lastGnubgMove.fullMove }}</span>
            <span class="thinking-time">⏱️ {{ lastGnubgMove.thinkingTime }}ms</span>
            <div class="analysis">
              <small>{{ lastGnubgMove.analysis?.reasoning }}</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Contrôles -->
      <div class="controls-section">
        <div class="difficulty-selector">
          <label>Difficulté GNUBG:</label>
          <select v-model="selectedDifficulty" @change="changeDifficulty">
            <option value="EASY">Easy (ELO: 1400)</option>
            <option value="MEDIUM">Medium (ELO: 1650)</option>
            <option value="HARD">Hard (ELO: 1850)</option>
            <option value="EXPERT">Expert (ELO: 2000)</option>
          </select>
        </div>

        <div class="action-buttons">
          <button @click="requestPositionAnalysis" class="btn btn-analysis">
            🧠 Analyser position
          </button>
          <button @click="getMoveSuggestions" class="btn btn-suggestions">
            💡 Suggestions de coups
          </button>
          <button @click="newGame" class="btn btn-new-game">
            🔄 Nouvelle partie
          </button>
        </div>
      </div>
    </div>

    <!-- Messages -->
    <div v-if="message" class="game-message" :class="messageType">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useGameStore } from '@/stores/game.js'
import { gameApiService } from '@/services/game-api.js'
import GameBoard from './GameBoard.vue'

const gameStore = useGameStore()

// État
const currentGame = ref(null)
const isGnubgThinking = ref(false)
const selectedDifficulty = ref('EXPERT')
const moveSuggestions = ref([])
const positionEvaluation = ref(null)
const lastGnubgMove = ref(null)
const message = ref('')
const messageType = ref('info')

// Computed
const gnubgOpponent = computed(() => currentGame.value?.gnubgOpponent)
const isPlayerTurn = computed(() => {
  return currentGame.value?.currentPlayer === currentGame.value?.playerColor && !isGnubgThinking.value
})

// Méthodes
const showMessage = (text, type = 'info') => {
  message.value = text
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 3000)
}

const createGnubgGame = async (difficulty = 'EXPERT') => {
  try {
    const result = await gameApiService.createGnubgGame(difficulty, 'white')
    if (result.success) {
      currentGame.value = result.data.game
      gameStore.currentGame = result.data.game
      showMessage(`Partie créée contre GNUBG ${difficulty}!`, 'success')
    } else {
      showMessage(result.error, 'error')
    }
  } catch (error) {
    showMessage('Erreur lors de la création de la partie', 'error')
  }
}

const handleRollDice = async () => {
  if (!isPlayerTurn.value) return
  
  try {
    const result = await gameApiService.rollDice(currentGame.value.id)
    if (result.success) {
      currentGame.value.dice = result.data.dice
      
      // Demander les suggestions de coups automatiquement
      await getMoveSuggestions()
      
      showMessage(`Dés lancés: ${result.data.dice.join(', ')}`, 'info')
    } else {
      showMessage(result.error, 'error')
    }
  } catch (error) {
    showMessage('Erreur lors du lancer des dés', 'error')
  }
}

const handleMakeMove = async (moveData) => {
  if (!isPlayerTurn.value) return
  
  try {
    const result = await gameApiService.makeMove(
      currentGame.value.id, 
      moveData.from, 
      moveData.to
    )
    
    if (result.success) {
      // Mettre à jour le plateau
      currentGame.value.board = result.data.board
      
      // Changer de joueur
      currentGame.value.currentPlayer = 'black'
      
      // Faire jouer GNUBG
      await makeGnubgMove()
      
      showMessage('Coup joué avec succès', 'success')
    } else {
      showMessage(result.error, 'error')
    }
  } catch (error) {
    showMessage('Erreur lors du mouvement', 'error')
  }
}

const makeGnubgMove = async () => {
  isGnubgThinking.value = true
  
  try {
    // Lancer les dés pour GNUBG
    const diceResult = await gameApiService.rollDice(currentGame.value.id)
    
    if (diceResult.success) {
      currentGame.value.dice = diceResult.data.dice
      
      // Obtenir le coup de GNUBG
      const moveResult = await gameApiService.getGnubgMove(
        currentGame.value.id,
        currentGame.value.board,
        diceResult.data.dice,
        selectedDifficulty.value
      )
      
      if (moveResult.success) {
        lastGnubgMove.value = moveResult.data.move
        
        // Simuler le mouvement sur le plateau
        setTimeout(() => {
          currentGame.value.currentPlayer = 'white'
          isGnubgThinking.value = false
          showMessage(`GNUBG a joué: ${moveResult.data.move.fullMove}`, 'info')
        }, moveResult.data.thinkingTime)
      }
    }
  } catch (error) {
    showMessage('Erreur lors du coup GNUBG', 'error')
    isGnubgThinking.value = false
  }
}

const getMoveSuggestions = async () => {
  if (!currentGame.value?.dice || currentGame.value.dice.length === 0) return
  
  try {
    const result = await gameApiService.getMoveSuggestions(
      currentGame.value.board,
      currentGame.value.dice,
      'white'
    )
    
    if (result.success) {
      moveSuggestions.value = result.data.suggestions
      showMessage(`${result.data.suggestions.length} suggestions trouvées`, 'info')
    }
  } catch (error) {
    showMessage('Erreur lors de l\'obtention des suggestions', 'error')
  }
}

const requestPositionAnalysis = async () => {
  try {
    const result = await gameApiService.evaluatePosition(
      currentGame.value.board,
      'white'
    )
    
    if (result.success) {
      positionEvaluation.value = result.data.evaluation
      showMessage('Position analysée avec succès', 'success')
    }
  } catch (error) {
    showMessage('Erreur lors de l\'analyse de position', 'error')
  }
}

const handleRequestAnalysis = async (boardState, dice) => {
  try {
    const result = await gameApiService.analyzePosition(boardState, dice, 'BEST_MOVE')
    if (result.success) {
      showMessage(`Meilleur coup: ${result.data.bestMove}`, 'info')
    }
  } catch (error) {
    showMessage('Erreur lors de l\'analyse GNUBG', 'error')
  }
}

const changeDifficulty = () => {
  showMessage(`Difficulté changée pour GNUBG ${selectedDifficulty.value}`, 'info')
}

const newGame = () => {
  createGnubgGame(selectedDifficulty.value)
  moveSuggestions.value = []
  positionEvaluation.value = null
  lastGnubgMove.value = null
}

// Lifecycle
onMounted(() => {
  createGnubgGame(selectedDifficulty.value)
})
</script>

<style scoped>
.gnubg-game-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.gnubg-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.ai-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.ai-avatar {
  font-size: 3rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-details h3 {
  margin: 0;
  color: #ffd700;
  font-size: 1.2rem;
}

.ai-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  opacity: 0.8;
}

.status-indicator {
  padding: 0.5rem 1rem;
  background: rgba(86, 171, 47, 0.2);
  border: 1px solid #56ab2f;
  border-radius: 25px;
  color: #56ab2f;
  font-weight: bold;
  transition: all 0.3s ease;
}

.status-indicator.thinking {
  background: rgba(255, 65, 108, 0.2);
  border-color: #ff416c;
  color: #ff416c;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.gnubg-panel {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.analysis-section h4 {
  color: #ffd700;
  margin: 0 0 1rem 0;
}

.suggestions, .position-eval, .last-ai-move {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

.suggestion-item {
  display: grid;
  grid-template-columns: 30px 1fr auto auto;
  gap: 1rem;
  padding: 0.5rem;
  margin: 0.25rem 0;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 5px;
  align-items: center;
}

.suggestion-item.best {
  background: rgba(255, 215, 0, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.suggestion-item .rank {
  font-weight: bold;
  color: #ffd700;
}

.suggestion-item .move {
  font-family: 'Courier New', monospace;
  font-weight: bold;
}

.eval-stats {
  display: grid;
  gap: 0.5rem;
}

.stat {
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0;
}

.stat .label {
  opacity: 0.8;
}

.stat .value {
  font-weight: bold;
}

.cube-decision.take {
  color: #56ab2f;
}

.cube-decision.drop {
  color: #ff416c;
}

.cube-decision.double {
  color: #ffd700;
}

.ai-move {
  padding: 0.5rem;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 5px;
  border: 1px solid rgba(102, 126, 234, 0.3);
}

.controls-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.difficulty-selector select {
  width: 100%;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 5px;
  color: white;
  font-size: 0.9rem;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.btn {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.btn-analysis {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-suggestions {
  background: linear-gradient(135deg, #56ab2f 0%, #a8e063 100%);
  color: white;
}

.btn-new-game {
  background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);
  color: white;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.game-message {
  padding: 1rem;
  border-radius: 10px;
  text-align: center;
  font-weight: bold;
}

.game-message.success {
  background: rgba(86, 171, 47, 0.2);
  border: 1px solid #56ab2f;
  color: #56ab2f;
}

.game-message.error {
  background: rgba(255, 65, 108, 0.2);
  border: 1px solid #ff416c;
  color: #ff416c;
}

.game-message.info {
  background: rgba(102, 126, 234, 0.2);
  border: 1px solid #667eea;
  color: #667eea;
}

@media (max-width: 1024px) {
  .gnubg-panel {
    grid-template-columns: 1fr;
  }
  
  .gnubg-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}
</style>
