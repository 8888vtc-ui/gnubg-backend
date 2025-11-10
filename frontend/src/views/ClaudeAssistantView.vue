/**
 * Claude Assistant View - Full Page AI Coaching Interface
 * Dedicated page for Claude AI backgammon coaching and analysis
 */

<template>
  <div class="claude-assistant-view">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <button @click="goBack" class="back-btn">
          ← Retour
        </button>
        <h1>🤖 Claude - Coach Backgammon IA</h1>
        <div class="header-status">
          <span class="status-dot" :class="{ online: isOnline }"></span>
          {{ isOnline ? 'En ligne' : 'Hors ligne' }}
        </div>
      </div>
    </div>

    <!-- Main Assistant Interface -->
    <div class="assistant-main">
      <ClaudeAssistant
        :game-id="currentGameId"
        :user-id="currentUserId"
        @game-analysis-requested="handleGameAnalysis"
        @position-analysis-requested="handlePositionAnalysis"
        @move-suggestion-requested="handleMoveSuggestion"
      />
    </div>

    <!-- Game Context Panel -->
    <div v-if="showGameContext" class="game-context-panel">
      <h3>🎲 Contexte de la partie</h3>
      <div class="context-info">
        <p><strong>ID Partie:</strong> {{ currentGameId || 'Aucune' }}</p>
        <p><strong>Joueur:</strong> {{ currentUserId || 'Non connecté' }}</p>
        <p v-if="currentPosition"><strong>Position:</strong> {{ currentPosition }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'
import ClaudeAssistant from '@/components/ClaudeAssistant.vue'

const router = useRouter()
const gameStore = useGameStore()

// State
const isOnline = ref(false)
const currentGameId = ref<string>('')
const currentUserId = ref<string>('')
const currentPosition = ref<string>('')
const showGameContext = ref(false)

// Check Claude API availability
const checkClaudeStatus = async () => {
  try {
    const response = await fetch('/api/claude/status')
    const data = await response.json()
    isOnline.value = data.success && data.data.available
  } catch (error) {
    console.error('Claude status check failed:', error)
    isOnline.value = false
  }
}

// Event handlers
const handleGameAnalysis = (gameData: any) => {
  console.log('Game analysis requested:', gameData)
  currentGameId.value = gameData.gameId
  showGameContext.value = true
}

const handlePositionAnalysis = (positionData: any) => {
  console.log('Position analysis requested:', positionData)
  currentPosition.value = positionData.position
  showGameContext.value = true
}

const handleMoveSuggestion = (moveData: any) => {
  console.log('Move suggestion requested:', moveData)
  showGameContext.value = true
}

const goBack = () => {
  router.go(-1)
}

// Lifecycle
onMounted(async () => {
  await checkClaudeStatus()
  
  // Get current user from store
  if (gameStore.currentUser) {
    currentUserId.value = gameStore.currentUser.id
  }
  
  // Check for game context in route
  if (router.currentRoute.value.query.gameId) {
    currentGameId.value = router.currentRoute.value.query.gameId as string
    showGameContext.value = true
  }
  
  // Periodic status check
  const statusInterval = setInterval(checkClaudeStatus, 30000)
  
  onUnmounted(() => {
    clearInterval(statusInterval)
  })
})
</script>

<style scoped>
.claude-assistant-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
}

.page-header {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 1rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 2rem;
}

.back-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateX(-2px);
}

h1 {
  color: white;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.header-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  font-size: 0.9rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
  transition: background 0.3s ease;
}

.status-dot.online {
  background: #10b981;
}

.assistant-main {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.game-context-panel {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  margin: 0 2rem 2rem;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-width: 1168px;
  margin-left: auto;
  margin-right: auto;
}

.game-context-panel h3 {
  color: white;
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
}

.context-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.context-info p {
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  font-size: 0.9rem;
}

.context-info strong {
  color: white;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .assistant-main {
    padding: 1rem;
  }
  
  .game-context-panel {
    margin: 0 1rem 1rem;
  }
}
</style>
