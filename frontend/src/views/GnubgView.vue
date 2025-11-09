<template>
  <div class="gnubg-view">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          🤖 <span class="highlight">GNUBG</span> BACKGAMMON
        </h1>
        <p class="page-subtitle">
          Affrontez la meilleure IA de backgammon au monde
        </p>
      </div>
      <div class="header-stats">
        <div class="stat-item">
          <span class="stat-value">{{ totalGames }}</span>
          <span class="stat-label">Parties jouées</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ winRate }}%</span>
          <span class="stat-label">Taux de victoire</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ currentStreak }}</span>
          <span class="stat-label">Série actuelle</span>
        </div>
      </div>
    </div>

    <!-- Game Container -->
    <div class="game-container">
      <GnubgGame />
    </div>

    <!-- GNUBG Info Panel -->
    <div class="info-panel">
      <div class="ai-description">
        <h3>🧠 À propos de GNU Backgammon</h3>
        <p>
          GNU Backgammon est l'une des IA les plus puissantes au monde pour le jeu de backgammon. 
          Développée sur plus de 20 ans, elle utilise des algorithmes avancés de neural networks 
          et une base de données de milliards de positions pour atteindre un niveau de jeu 
          supérieur à celui des meilleurs joueurs humains.
        </p>
        <div class="ai-features">
          <div class="feature">
            <span class="icon">🎯</span>
            <span>Analyse de position en temps réel</span>
          </div>
          <div class="feature">
            <span class="icon">📊</span>
            <span>Calcul d'equity précis</span>
          </div>
          <div class="feature">
            <span class="icon">🎲</span>
            <span>Gestion optimale du videau</span>
          </div>
          <div class="feature">
            <span class="icon">🏆</span>
            <span>4 niveaux de difficulté</span>
          </div>
        </div>
      </div>

      <div class="difficulty-guide">
        <h3>⚡ Niveaux de difficulté</h3>
        <div class="difficulty-levels">
          <div class="level" :class="{ active: selectedLevel === 'EASY' }" @click="setDifficulty('EASY')">
            <div class="level-header">
              <span class="level-name">Easy</span>
              <span class="level-elo">ELO 1400</span>
            </div>
            <p>Idéal pour apprendre les bases du jeu</p>
          </div>
          
          <div class="level" :class="{ active: selectedLevel === 'MEDIUM' }" @click="setDifficulty('MEDIUM')">
            <div class="level-header">
              <span class="level-name">Medium</span>
              <span class="level-elo">ELO 1650</span>
            </div>
            <p>Joueur intermédiaire avec bonne stratégie</p>
          </div>
          
          <div class="level" :class="{ active: selectedLevel === 'HARD' }" @click="setDifficulty('HARD')">
            <div class="level-header">
              <span class="level-name">Hard</span>
              <span class="level-elo">ELO 1850</span>
            </div>
            <p>Joueur avancé, stratégie experte</p>
          </div>
          
          <div class="level" :class="{ active: selectedLevel === 'EXPERT' }" @click="setDifficulty('EXPERT')">
            <div class="level-header">
              <span class="level-name">Expert</span>
              <span class="level-elo">ELO 2000</span>
            </div>
            <p>Niveau mondial, aussi fort que les champions</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import GnubgGame from '@/components/GnubgGame.vue'

// État
const totalGames = ref(42)
const winRate = ref(67)
const currentStreak = ref(3)
const selectedLevel = ref('EXPERT')

// Méthodes
const setDifficulty = (level) => {
  selectedLevel.value = level
  // Émettre un événement pour changer la difficulté dans le composant de jeu
  console.log(`Difficulty changed to: ${level}`)
}

// Charger les statistiques depuis l'API ou le localStorage
const loadStats = () => {
  const saved = localStorage.getItem('gnubg_stats')
  if (saved) {
    const stats = JSON.parse(saved)
    totalGames.value = stats.totalGames || 0
    winRate.value = stats.winRate || 0
    currentStreak.value = stats.currentStreak || 0
  }
}

// Sauvegarder les statistiques
const saveStats = (gameResult) => {
  totalGames.value++
  if (gameResult === 'win') {
    currentStreak.value = Math.max(0, currentStreak.value) + 1
  } else {
    currentStreak.value = Math.min(0, currentStreak.value) - 1
  }
  
  // Recalculer le win rate
  winRate.value = Math.round((totalGames.value * winRate.value + (gameResult === 'win' ? 100 : 0)) / totalGames.value)
  
  const stats = {
    totalGames: totalGames.value,
    winRate: winRate.value,
    currentStreak: currentStreak.value
  }
  
  localStorage.setItem('gnubg_stats', JSON.stringify(stats))
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.gnubg-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  padding: 2rem;
  color: white;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.page-title {
  font-size: 3rem;
  margin: 0 0 1rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-title .highlight {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  font-size: 1.2rem;
  opacity: 0.8;
  margin: 0 0 2rem 0;
}

.header-stats {
  display: flex;
  justify-content: center;
  gap: 3rem;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  color: #ffd700;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.8;
}

.game-container {
  margin-bottom: 3rem;
}

.info-panel {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.ai-description, .difficulty-guide {
  padding: 2rem;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.ai-description h3, .difficulty-guide h3 {
  color: #ffd700;
  margin: 0 0 1rem 0;
}

.ai-description p {
  line-height: 1.6;
  margin-bottom: 1.5rem;
  opacity: 0.9;
}

.ai-features {
  display: grid;
  gap: 0.75rem;
}

.feature {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.feature .icon {
  font-size: 1.2rem;
}

.difficulty-levels {
  display: grid;
  gap: 1rem;
}

.level {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.level:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.level.active {
  background: rgba(255, 215, 0, 0.1);
  border-color: rgba(255, 215, 0, 0.3);
}

.level-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.level-name {
  font-weight: bold;
  color: #ffd700;
}

.level-elo {
  font-size: 0.9rem;
  opacity: 0.8;
}

.level p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.8;
}

@media (max-width: 1024px) {
  .info-panel {
    grid-template-columns: 1fr;
  }
  
  .header-stats {
    gap: 2rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
}

@media (max-width: 768px) {
  .gnubg-view {
    padding: 1rem;
  }
  
  .page-header {
    padding: 1.5rem;
  }
  
  .header-stats {
    gap: 1rem;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
}
</style>
