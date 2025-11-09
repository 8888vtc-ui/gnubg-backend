<template>
  <div class="game-board">
    <!-- Header du jeu -->
    <div class="game-header">
      <div class="player-info white-player">
        <h3>Blanc: {{ whitePlayer.username }}</h3>
        <div class="elo">ELO: {{ whitePlayer.elo }}</div>
      </div>
      
      <div class="game-status">
        <h2>{{ gameStatus }}</h2>
        <div class="stake-info" v-if="stake > 1">
          <span class="stake-label">Mise:</span>
          <span class="stake-value">{{ stake }} point{{ stake > 1 ? 's' : '' }}</span>
        </div>
        <div class="dice-container">
          <Dice 
            :dice="dice" 
            :is-rolling="isRollingDice"
            @select-die="selectDie"
          />
        </div>
        <button v-if="canRollDice" @click="rollDice" class="roll-btn">
          🎲 Lancer les dés
        </button>
        
        <!-- Videau (Doubling Cube) -->
        <DoublingCube
          :current-value="doublingCubeValue"
          :owner="doublingCubeOwner"
          :can-double="canDouble"
          :is-player-turn="isPlayerTurn"
          :player-color="currentPlayer"
          :game-mode="gameMode"
          @double="handleDoubling"
          @accept="handleAcceptDouble"
          @reject="handleRejectDouble"
        />
      </div>
      
      <div class="player-info black-player">
        <h3>Noir: {{ blackPlayer.username }}</h3>
        <div class="elo">ELO: {{ blackPlayer.elo }}</div>
      </div>
    </div>

    <!-- Plateau de backgammon -->
    <div class="board-container">
      <svg class="backgammon-board" viewBox="0 0 800 600" @click="handleBoardClick">
        <!-- Fond du plateau -->
        <rect width="800" height="600" fill="#8B4513" />
        
        <!-- Barre du milieu -->
        <rect x="390" y="50" width="20" height="500" fill="#654321" />
        
        <!-- Points (triangles) -->
        <g v-for="point in points" :key="point.id">
          <path 
            :d="point.path" 
            :fill="point.color" 
            :class="{ 'highlighted': point.highlighted }"
            @click="handlePointClick(point.id)"
          />
          <text 
            :x="point.numberX" 
            :y="point.numberY" 
            fill="white" 
            font-size="12" 
            text-anchor="middle"
          >
            {{ point.number }}
          </text>
        </g>
        
        <!-- Pions (checkers) -->
        <g v-for="checker in checkers" :key="checker.id">
          <circle
            :cx="checker.x"
            :cy="checker.y"
            :r="20"
            :fill="checker.color"
            :class="{ 'selected': checker.selected, 'draggable': checker.draggable }"
            @mousedown="startDrag(checker, $event)"
            @touchstart="startDrag(checker, $event)"
          />
        </g>
        
        <!-- Zone bearing off -->
        <rect x="750" y="50" width="40" height="250" fill="#FFD700" opacity="0.3" />
        <rect x="750" y="300" width="40" height="250" fill="#FFD700" opacity="0.3" />
        <text x="770" y="30" fill="white" text-anchor="middle">OFF</text>
      </svg>
    </div>

    <!-- Mouvements possibles -->
    <div v-if="possibleMoves.length > 0" class="possible-moves">
      <h4>Mouvements possibles:</h4>
      <div class="moves-list">
        <button 
          v-for="move in possibleMoves" 
          :key="move.from + '-' + move.to"
          @click="makeMove(move)"
          class="move-btn"
        >
          {{ formatMove(move) }}
        </button>
      </div>
    </div>

    <!-- Messages du jeu -->
    <div v-if="message" class="game-message" :class="messageType">
      {{ message }}
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useGameStore } from '@/stores/game'
import Dice from './Dice.vue'
import Checker from './Checker.vue'
import DoublingCube from './DoublingCube.vue'

export default {
  name: 'GameBoard',
  components: {
    Dice,
    Checker,
    DoublingCube
  },
  setup() {
    const gameStore = useGameStore()
    
    // État du jeu
    const dice = ref([])
    const currentPlayer = ref('white')
    const selectedChecker = ref(null)
    const possibleMoves = ref([])
    const message = ref('')
    const messageType = ref('info')
    const isRollingDice = ref(false)
    
    // État du videau (doubling cube)
    const doublingCubeValue = ref(1)
    const doublingCubeOwner = ref(null)
    const gameMode = ref('AI_VS_PLAYER')
    const stake = ref(1) // Mise actuelle de la partie
    
    // Joueurs
    const whitePlayer = ref({ username: 'Joueur Blanc', elo: 1500 })
    const blackPlayer = ref({ username: 'Joueur Noir', elo: 1500 })
    
    // ... rest of the code remains the same ...
    // Points du plateau (24 points)
    const points = ref([
      // Points du bas (12-23)
      { id: 12, number: 12, color: '#D2691E', path: 'M 50 550 L 90 350 L 130 550 Z', numberX: 90, numberY: 570 },
      { id: 13, number: 13, color: '#F4A460', path: 'M 140 550 L 180 350 L 220 550 Z', numberX: 180, numberY: 570 },
      { id: 14, number: 14, color: '#D2691E', path: 'M 230 550 L 270 350 L 310 550 Z', numberX: 270, numberY: 570 },
      { id: 15, number: 15, color: '#F4A460', path: 'M 320 550 L 360 350 L 400 550 Z', numberX: 360, numberY: 570 },
      { id: 16, number: 16, color: '#D2691E', path: 'M 420 550 L 460 350 L 500 550 Z', numberX: 460, numberY: 570 },
      { id: 17, number: 17, color: '#F4A460', path: 'M 510 550 L 550 350 L 590 550 Z', numberX: 550, numberY: 570 },
      { id: 18, number: 18, color: '#D2691E', path: 'M 600 550 L 640 350 L 680 550 Z', numberX: 640, numberY: 570 },
      { id: 19, number: 19, color: '#F4A460', path: 'M 690 550 L 730 350 L 770 550 Z', numberX: 730, numberY: 570 },
      
      // Points du haut (11-0)
      { id: 11, number: 11, color: '#F4A460', path: 'M 50 50 L 90 250 L 130 50 Z', numberX: 90, numberY: 30 },
      { id: 10, number: 10, color: '#D2691E', path: 'M 140 50 L 180 250 L 220 50 Z', numberX: 180, numberY: 30 },
      { id: 9, number: 9, color: '#F4A460', path: 'M 230 50 L 270 250 L 310 50 Z', numberX: 270, numberY: 30 },
      { id: 8, number: 8, color: '#D2691E', path: 'M 320 50 L 360 250 L 400 50 Z', numberX: 360, numberY: 30 },
      { id: 7, number: 7, color: '#F4A460', path: 'M 420 50 L 460 250 L 500 50 Z', numberX: 460, numberY: 30 },
      { id: 6, number: 6, color: '#D2691E', path: 'M 510 50 L 550 250 L 590 50 Z', numberX: 550, numberY: 30 },
      { id: 5, number: 5, color: '#F4A460', path: 'M 600 50 L 640 250 L 680 50 Z', numberX: 640, numberY: 30 },
      { id: 4, number: 4, color: '#D2691E', path: 'M 690 50 L 730 250 L 770 50 Z', numberX: 730, numberY: 30 },
      
      // Points supplémentaires pour la barre
      { id: 0, number: 0, color: '#F4A460', path: 'M 140 50 L 180 250 L 220 50 Z', numberX: 180, numberY: 30 },
      { id: 1, number: 1, color: '#D2691E', path: 'M 230 50 L 270 250 L 310 50 Z', numberX: 270, numberY: 30 },
      { id: 2, number: 2, color: '#F4A460', path: 'M 320 50 L 360 250 L 400 50 Z', numberX: 360, numberY: 30 },
      { id: 3, number: 3, color: '#D2691E', path: 'M 420 50 L 460 250 L 500 50 Z', numberX: 460, numberY: 30 },
    ])
    
    // Pions sur le plateau
    const checkers = ref([
      // Pions blancs (position initiale)
      { id: 'w1', x: 90, y: 450, color: 'white', player: 'white', point: 1 },
      { id: 'w2', x: 90, y: 420, color: 'white', player: 'white', point: 1 },
      { id: 'w3', x: 180, y: 450, color: 'white', player: 'white', point: 12 },
      { id: 'w4', x: 180, y: 420, color: 'white', player: 'white', point: 12 },
      { id: 'w5', x: 180, y: 390, color: 'white', player: 'white', point: 12 },
      { id: 'w6', x: 180, y: 360, color: 'white', player: 'white', point: 12 },
      { id: 'w7', x: 180, y: 330, color: 'white', player: 'white', point: 12 },
      { id: 'w8', x: 270, y: 450, color: 'white', player: 'white', point: 17 },
      { id: 'w9', x: 270, y: 420, color: 'white', player: 'white', point: 17 },
      { id: 'w10', x: 270, y: 390, color: 'white', player: 'white', point: 17 },
      { id: 'w11', x: 360, y: 450, color: 'white', player: 'white', point: 19 },
      { id: 'w12', x: 360, y: 420, color: 'white', player: 'white', point: 19 },
      { id: 'w13', x: 360, y: 390, color: 'white', player: 'white', point: 19 },
      { id: 'w14', x: 360, y: 360, color: 'white', player: 'white', point: 19 },
      { id: 'w15', x: 360, y: 330, color: 'white', player: 'white', point: 19 },
      
      // Pions noirs (position initiale)
      { id: 'b1', x: 640, y: 150, color: 'black', player: 'black', point: 6 },
      { id: 'b2', x: 640, y: 180, color: 'black', player: 'black', point: 6 },
      { id: 'b3', x: 640, y: 210, color: 'black', player: 'black', point: 6 },
      { id: 'b4', x: 640, y: 240, color: 'black', player: 'black', point: 6 },
      { id: 'b5', x: 550, y: 150, color: 'black', player: 'black', point: 8 },
      { id: 'b6', x: 550, y: 180, color: 'black', player: 'black', point: 8 },
      { id: 'b7', x: 550, y: 210, color: 'black', player: 'black', point: 8 },
      { id: 'b8', x: 460, y: 150, color: 'black', player: 'black', point: 13 },
      { id: 'b9', x: 460, y: 180, color: 'black', player: 'black', point: 13 },
      { id: 'b10', x: 460, y: 210, color: 'black', player: 'black', point: 13 },
      { id: 'b11', x: 460, y: 240, color: 'black', player: 'black', point: 13 },
      { id: 'b12', x: 460, y: 270, color: 'black', player: 'black', point: 13 },
      { id: 'b13', x: 460, y: 300, color: 'black', player: 'black', point: 13 },
      { id: 'b14', x: 460, y: 330, color: 'black', player: 'black', point: 13 },
      { id: 'b15', x: 460, y: 360, color: 'black', player: 'black', point: 13 },
    ])
    
    // Computed
    const gameStatus = computed(() => {
      if (dice.value.length === 0) return `${currentPlayer.value === 'white' ? 'Blanc' : 'Noir'} - Lancez les dés`
      return `${currentPlayer.value === 'white' ? 'Blanc' : 'Noir'} - Jouez votre coup`
    })
    
    const canRollDice = computed(() => {
      return dice.value.length === 0
    })
    
    // Logique du videau
    const isPlayerTurn = computed(() => {
      return currentPlayer.value === 'white' // Simplifié pour l'instant
    })
    
    const canDouble = computed(() => {
      // Règles du double :
      // 1. C'est le tour du joueur
      // 2. Le videau n'est pas possédé par l'adversaire
      // 3. Les dés n'ont pas été lancés ce tour
      // 4. La mise n'est pas déjà au maximum (64)
      return isPlayerTurn.value && 
             dice.value.length === 0 && 
             doublingCubeOwner.value !== 'black' && 
             doublingCubeValue.value < 64
    })
    
    // Méthodes
    const rollDice = () => {
      dice.value = [
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
      ]
      
      // Doubles : 4 mouvements
      if (dice.value[0] === dice.value[1]) {
        dice.value = [dice.value[0], dice.value[0], dice.value[0], dice.value[0]]
      }
      
      calculatePossibleMoves()
      showMessage(`Vous avez lancé : ${dice.value.join(', ')}`, 'success')
    }
    
    const calculatePossibleMoves = () => {
      // Logique simplifiée pour calculer les mouvements possibles
      possibleMoves.value = []
      
      if (dice.value.length === 0) return
      
      const playerCheckers = checkers.value.filter(c => c.player === currentPlayer.value)
      
      playerCheckers.forEach(checker => {
        dice.value.forEach(die => {
          const targetPoint = currentPlayer.value === 'white' 
            ? checker.point + die 
            : checker.point - die
            
          if (targetPoint >= 0 && targetPoint <= 23) {
            possibleMoves.value.push({
              from: checker.point,
              to: targetPoint,
              checker: checker.id,
              die: die
            })
          }
        })
      })
      
      // Éliminer les doublons
      possibleMoves.value = possibleMoves.value.filter((move, index, self) =>
        index === self.findIndex((m) => m.from === move.from && m.to === move.to)
      )
    }
    
    const makeMove = (move) => {
      const checker = checkers.value.find(c => c.id === move.checker)
      if (!checker) return
      
      // Mettre à jour la position du pion
      checker.point = move.to
      
      // Calculer nouvelles coordonnées X,Y
      const targetPointInfo = points.value.find(p => p.number === move.to)
      if (targetPointInfo) {
        checker.x = targetPointInfo.numberX
        checker.y = currentPlayer.value === 'white' ? 450 : 150
      }
      
      // Retirer le dé utilisé
      const dieIndex = dice.value.indexOf(move.die)
      if (dieIndex > -1) {
        dice.value.splice(dieIndex, 1)
      }
      
      // Vérifier si le tour est fini
      if (dice.value.length === 0) {
        endTurn()
      } else {
        calculatePossibleMoves()
      }
      
      showMessage(`Mouvement : ${move.from} → ${move.to}`, 'info')
    }
    
    const endTurn = () => {
      currentPlayer.value = currentPlayer.value === 'white' ? 'black' : 'white'
      dice.value = []
      possibleMoves.value = []
      showMessage(`Tour de ${currentPlayer.value === 'white' ? 'Blanc' : 'Noir'}`, 'info')
    }
    
    const startDrag = (checker, event) => {
      if (checker.player !== currentPlayer.value) {
        showMessage('Ce n\'est pas votre pion !', 'error')
        return
      }
      
      if (dice.value.length === 0) {
        showMessage('Lancez les d\'abord !', 'error')
        return
      }
      
      selectedChecker.value = checker
      // Logique de drag à implémenter
    }
    
    const handlePointClick = (pointId) => {
      if (selectedChecker.value) {
        const move = possibleMoves.value.find(m => 
          m.from === selectedChecker.value.point && m.to === pointId
        )
        if (move) {
          makeMove(move)
        } else {
          showMessage('Mouvement invalide !', 'error')
        }
        selectedChecker.value = null
      }
    }
    
    const handleBoardClick = (event) => {
      // Gérer les clics sur le plateau
    }
    
    const formatMove = (move) => {
      return `${move.from} → ${move.to} (dé: ${move.die})`
    }
    
    const showMessage = (text, type = 'info') => {
      message.value = text
      messageType.value = type
      setTimeout(() => {
        message.value = ''
      }, 3000)
    }
    
    // Méthodes du videau
    const handleDoubling = (newValue) => {
      doublingCubeValue.value = newValue
      doublingCubeOwner.value = currentPlayer.value
      stake.value = newValue
      
      showMessage(`Videau doublé à ${newValue}! Mise: ${newValue} point(s)`, 'success')
      
      // En mode IA, l'adversaire peut accepter ou refuser
      if (gameMode.value === 'AI_VS_PLAYER' && currentPlayer.value === 'white') {
        setTimeout(() => {
          // L'IA accepte le double 70% du temps
          if (Math.random() < 0.7) {
            handleAcceptDouble()
          } else {
            handleRejectDouble()
          }
        }, 2000)
      }
    }
    
    const handleAcceptDouble = () => {
      doublingCubeOwner.value = currentPlayer.value === 'white' ? 'black' : 'white'
      showMessage('Double accepté! La partie continue.', 'info')
    }
    
    const handleRejectDouble = () => {
      showMessage('Double refusé! Partie terminée.', 'warning')
      // Logique de fin de partie quand on refuse un double
      gameStatus.value = 'finished'
    }
    
    const selectDie = (index) => {
      // Logique pour sélectionner un dé spécifique
      showMessage(`Dé ${index + 1} sélectionné`, 'info')
    }
    
    // Lifecycle
    onMounted(() => {
      // Initialiser le jeu
      showMessage('Bienvenue ! Les blancs commencent.', 'success')
    })
    
    return {
      // État
      dice,
      currentPlayer,
      selectedChecker,
      possibleMoves,
      message,
      messageType,
      whitePlayer,
      blackPlayer,
      points,
      checkers,
      isRollingDice,
      
      // État du videau
      doublingCubeValue,
      doublingCubeOwner,
      gameMode,
      stake,
      
      // Computed
      gameStatus,
      canRollDice,
      isPlayerTurn,
      canDouble,
      
      // Méthodes
      rollDice,
      makeMove,
      startDrag,
      handlePointClick,
      handleBoardClick,
      formatMove,
      handleDoubling,
      handleAcceptDouble,
      handleRejectDouble,
      selectDie
    }
  }
}
</script>

<style scoped>
.game-board {
  background: linear-gradient(135deg, #2c1810 0%, #4a2c1a 100%);
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  color: white;
}

.player-info {
  text-align: center;
  padding: 15px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  backdrop-filter: blur(10px);
}

.player-info h3 {
  margin: 0 0 5px 0;
  font-size: 1.2em;
}

.elo {
  font-size: 0.9em;
  color: #ffd700;
  font-weight: bold;
}

.game-status {
  text-align: center;
  color: white;
}

.game-status h2 {
  margin: 0 0 15px 0;
  color: #ffd700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.stake-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 10px;
  padding: 0.5rem 1rem;
  background: rgba(255, 215, 0, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 20px;
  font-size: 0.9rem;
}

.stake-label {
  opacity: 0.8;
}

.stake-value {
  font-weight: bold;
  color: #ffd700;
}

.dice-container {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin: 15px 0;
}

.die {
  width: 50px;
  height: 50px;
  background: white;
  border: 2px solid #333;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5em;
  font-weight: bold;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  animation: rollDice 0.5s ease-out;
}

@keyframes rollDice {
  0% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(180deg) scale(1.2); }
  100% { transform: rotate(360deg) scale(1); }
}

.roll-btn {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 25px;
  font-size: 1em;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(238, 90, 36, 0.4);
}

.roll-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(238, 90, 36, 0.6);
}

.roll-btn:active {
  transform: translateY(0);
}

.board-container {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.backgammon-board {
  border: 5px solid #654321;
  border-radius: 10px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
  cursor: pointer;
  max-width: 100%;
  height: auto;
}

.highlighted {
  opacity: 0.7;
  stroke: #ffd700;
  stroke-width: 3;
}

.selected {
  stroke: #ff6b6b;
  stroke-width: 3;
  filter: drop-shadow(0 0 10px rgba(255, 107, 107, 0.8));
}

.draggable {
  cursor: grab;
}

.draggable:active {
  cursor: grabbing;
}

.possible-moves {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 15px;
  margin: 20px 0;
  color: white;
}

.moves-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.move-btn {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 0.9em;
  cursor: pointer;
  transition: all 0.3s ease;
}

.move-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(78, 205, 196, 0.4);
}

.game-message {
  padding: 15px;
  border-radius: 10px;
  text-align: center;
  font-weight: bold;
  margin-top: 20px;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.game-message.info {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.game-message.success {
  background: linear-gradient(135deg, #56ab2f 0%, #a8e063 100%);
  color: white;
}

.game-message.error {
  background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);
  color: white;
}

@media (max-width: 768px) {
  .game-header {
    flex-direction: column;
    gap: 15px;
  }
  
  .backgammon-board {
    max-width: 100%;
    height: auto;
  }
  
  .dice-container {
    gap: 10px;
  }
  
  .die {
    width: 40px;
    height: 40px;
    font-size: 1.2em;
  }
}
</style>
