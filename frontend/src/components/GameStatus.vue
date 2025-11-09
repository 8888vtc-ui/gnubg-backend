<template>
  <div class="game-status" :class="{ 'game-over': isGameOver }">
    <!-- Score et joueurs -->
    <div class="players-section">
      <div class="player-card white-player" :class="{ 'active': currentPlayer === 'white' }">
        <div class="player-avatar">
          <div class="avatar-circle white">
            <span v-if="whitePlayer.avatar">{{ whitePlayer.avatar }}</span>
            <span v-else>♟️</span>
          </div>
        </div>
        <div class="player-info">
          <h3>{{ whitePlayer.username || 'Joueur Blanc' }}</h3>
          <div class="player-stats">
            <span class="elo">ELO: {{ whitePlayer.elo || 1500 }}</span>
            <span class="score">Score: {{ whiteScore }}</span>
          </div>
        </div>
        <div v-if="currentPlayer === 'white'" class="turn-indicator">
          <div class="pulse-dot"></div>
          <span>Votre tour</span>
        </div>
      </div>

      <div class="vs-section">
        <div class="vs-text">VS</div>
        <div class="game-timer" v-if="gameTime > 0">
          {{ formatTime(gameTime) }}
        </div>
      </div>

      <div class="player-card black-player" :class="{ 'active': currentPlayer === 'black' }">
        <div class="player-avatar">
          <div class="avatar-circle black">
            <span v-if="blackPlayer.avatar">{{ blackPlayer.avatar }}</span>
            <span v-else>🤖</span>
          </div>
        </div>
        <div class="player-info">
          <h3>{{ blackPlayer.username || 'Joueur Noir' }}</h3>
          <div class="player-stats">
            <span class="elo">ELO: {{ blackPlayer.elo || 1500 }}</span>
            <span class="score">Score: {{ blackScore }}</span>
          </div>
        </div>
        <div v-if="currentPlayer === 'black'" class="turn-indicator">
          <div class="pulse-dot"></div>
          <span>Tour IA</span>
        </div>
      </div>
    </div>

    <!-- État du jeu -->
    <div class="game-info">
      <div class="status-message" :class="statusType">
        <div class="status-icon">{{ statusIcon }}</div>
        <div class="status-text">{{ statusText }}</div>
      </div>

      <!-- Actions du jeu -->
      <div class="game-actions" v-if="!isGameOver">
        <button 
          v-if="canRollDice" 
          @click="$emit('rollDice')" 
          class="action-btn roll-btn"
          :disabled="isRolling"
        >
          <span class="btn-icon">🎲</span>
          {{ isRolling ? 'Lancement...' : 'Lancer les dés' }}
        </button>

        <button 
          v-if="canResign" 
          @click="$emit('resign')" 
          class="action-btn resign-btn"
        >
          <span class="btn-icon">🏳️</span>
          Abandonner
        </button>

        <button 
          v-if="canAnalyze" 
          @click="$emit('analyze')" 
          class="action-btn analyze-btn"
          :disabled="isAnalyzing"
        >
          <span class="btn-icon">🧠</span>
          {{ isAnalyzing ? 'Analyse...' : 'Analyser position' }}
        </button>
      </div>

      <!-- Actions de fin de partie -->
      <div class="game-end-actions" v-else>
        <button @click="$emit('newGame')" class="action-btn new-game-btn">
          <span class="btn-icon">🔄</span>
          Nouvelle partie
        </button>
        <button @click="$emit('rematch')" class="action-btn rematch-btn">
          <span class="btn-icon">⚔️</span>
          Revanche
        </button>
        <button @click="$emit('viewAnalysis')" class="action-btn view-analysis-btn">
          <span class="btn-icon">📊</span>
          Voir l'analyse
        </button>
      </div>
    </div>

    <!-- Progression du match -->
    <div v-if="matchLength > 1" class="match-progress">
      <h4>Progression du match ({{ whiteScore + blackScore }}/{{ matchLength }})</h4>
      <div class="progress-bar">
        <div class="white-progress" :style="{ width: (whiteScore / matchLength) * 100 + '%' }"></div>
        <div class="black-progress" :style="{ width: (blackScore / matchLength) * 100 + '%' }"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Player {
  username: string
  elo: number
  avatar?: string
  isAI?: boolean
}

interface Props {
  whitePlayer: Player
  blackPlayer: Player
  currentPlayer: 'white' | 'black'
  whiteScore: number
  blackScore: number
  gameStatus: 'waiting' | 'playing' | 'finished' | 'aborted'
  gameTime: number
  canRollDice: boolean
  canResign: boolean
  canAnalyze: boolean
  isRolling: boolean
  isAnalyzing: boolean
  matchLength: number
  winner?: 'white' | 'black' | 'draw'
}

const props = withDefaults(defineProps<Props>(), {
  gameTime: 0,
  canRollDice: false,
  canResign: false,
  canAnalyze: false,
  isRolling: false,
  isAnalyzing: false,
  matchLength: 1
})

const emit = defineEmits<{
  rollDice: []
  resign: []
  analyze: []
  newGame: []
  rematch: []
  viewAnalysis: []
}>()

const isGameOver = computed(() => 
  props.gameStatus === 'finished' || props.gameStatus === 'aborted'
)

const statusType = computed(() => {
  switch (props.gameStatus) {
    case 'waiting': return 'waiting'
    case 'playing': return 'playing'
    case 'finished': return 'finished'
    case 'aborted': return 'aborted'
    default: return 'playing'
  }
})

const statusIcon = computed(() => {
  switch (props.gameStatus) {
    case 'waiting': return '⏳'
    case 'playing': return props.currentPlayer === 'white' ? '⚪' : '⚫'
    case 'finished': return props.winner === 'white' ? '🏆' : '🥈'
    case 'aborted': return '❌'
    default: return '🎮'
  }
})

const statusText = computed(() => {
  switch (props.gameStatus) {
    case 'waiting':
      return 'En attente de début de partie'
    case 'playing':
      return `Tour des ${props.currentPlayer === 'white' ? 'Blancs' : 'Noirs'}`
    case 'finished':
      if (props.winner === 'draw') return 'Match nul !'
      return `Victoire des ${props.winner === 'white' ? 'Blancs' : 'Noirs'} !`
    case 'aborted':
      return 'Partie abandonnée'
    default:
      return 'En cours'
  }
})

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.game-status {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.game-status.game-over {
  background: rgba(255, 215, 0, 0.1);
  border-color: rgba(255, 215, 0, 0.3);
}

.players-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 2rem;
}

.player-card {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.player-card.active {
  border-color: #ffd700;
  background: rgba(255, 215, 0, 0.1);
  transform: scale(1.02);
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.2);
}

.player-avatar {
  flex-shrink: 0;
}

.avatar-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  border: 3px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.avatar-circle.white {
  background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%);
  color: #333;
}

.avatar-circle.black {
  background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
  color: white;
}

.player-info {
  flex: 1;
}

.player-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  color: #ffd700;
}

.player-stats {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  font-size: 0.9rem;
  opacity: 0.9;
}

.elo {
  font-weight: bold;
}

.score {
  color: #4ecdc4;
}

.turn-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #56ab2f;
  font-weight: bold;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background: #56ab2f;
  border-radius: 50%;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { 
    transform: scale(1);
    opacity: 1;
  }
  50% { 
    transform: scale(1.5);
    opacity: 0.7;
  }
}

.vs-section {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.vs-text {
  font-size: 1.2rem;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.game-timer {
  font-size: 0.9rem;
  opacity: 0.8;
  font-family: 'Courier New', monospace;
}

.game-info {
  margin-bottom: 1.5rem;
}

.status-message {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 1rem;
  text-align: center;
  justify-content: center;
}

.status-message.waiting {
  background: rgba(255, 255, 255, 0.1);
}

.status-message.playing {
  background: rgba(78, 205, 196, 0.1);
  border: 1px solid rgba(78, 205, 196, 0.3);
}

.status-message.finished {
  background: rgba(255, 215, 0, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.status-message.aborted {
  background: rgba(255, 68, 68, 0.1);
  border: 1px solid rgba(255, 68, 68, 0.3);
}

.status-icon {
  font-size: 1.5rem;
}

.status-text {
  font-size: 1.1rem;
  font-weight: bold;
}

.game-actions,
.game-end-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 25px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.roll-btn {
  background: linear-gradient(135deg, #56ab2f 0%, #a8e063 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(86, 171, 47, 0.4);
}

.roll-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(86, 171, 47, 0.6);
}

.resign-btn {
  background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 65, 108, 0.4);
}

.resign-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 65, 108, 0.6);
}

.analyze-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.analyze-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.new-game-btn {
  background: linear-gradient(135deg, #56ab2f 0%, #a8e063 100%);
  color: white;
}

.rematch-btn {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.view-analysis-btn {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.match-progress {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.match-progress h4 {
  margin: 0 0 1rem 0;
  text-align: center;
  color: #ffd700;
  font-size: 1rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.white-progress,
.black-progress {
  height: 100%;
  position: absolute;
  top: 0;
  transition: width 0.5s ease;
}

.white-progress {
  left: 0;
  background: linear-gradient(90deg, #ffffff 0%, #e0e0e0 100%);
}

.black-progress {
  right: 0;
  background: linear-gradient(90deg, #2a2a2a 0%, #1a1a1a 100%);
}

@media (max-width: 768px) {
  .players-section {
    flex-direction: column;
    gap: 1rem;
  }
  
  .player-card {
    padding: 0.8rem;
  }
  
  .avatar-circle {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }
  
  .game-actions,
  .game-end-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .action-btn {
    justify-content: center;
  }
}
</style>
