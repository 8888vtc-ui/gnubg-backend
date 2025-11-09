<template>
  <div class="doubling-cube-container">
    <div 
      class="doubling-cube"
      :class="{
        'can-double': canDouble,
        'is-owned': isOwned,
        'is-available': isAvailable,
        'rolling': isRolling
      }"
      @click="handleDoubling"
    >
      <!-- Face visible du videau -->
      <div class="cube-face" :class="`face-${currentValue}`">
        <div class="cube-number">{{ currentValue }}</div>
        <div v-if="isOwned" class="ownership-indicator" :class="`owned-by-${owner}`">
          {{ owner === 'white' ? '⚪' : '⚫' }}
        </div>
      </div>
      
      <!-- Animation de rotation -->
      <div v-if="isRolling" class="cube-rolling">
        <div class="rolling-face face-2">2</div>
        <div class="rolling-face face-4">4</div>
        <div class="rolling-face face-8">8</div>
        <div class="rolling-face face-16">16</div>
        <div class="rolling-face face-32">32</div>
        <div class="rolling-face face-64">64</div>
      </div>
    </div>
    
    <!-- Informations du videau -->
    <div class="doubling-info">
      <div class="cube-status">
        <span class="status-label">Videau:</span>
        <span class="status-value">{{ currentValue }}</span>
        <span v-if="owner" class="owner-info">(Possédé: {{ owner === 'white' ? 'Blanc' : 'Noir' }})</span>
      </div>
      
      <div v-if="canDouble" class="double-action">
        <button 
          @click="handleDoubling" 
          class="double-btn"
          :disabled="isRolling"
        >
          🎲 Doubler à {{ nextValue }}
        </button>
      </div>
      
      <div v-if="lastDouble" class="double-history">
        <span class="history-text">Dernier double: {{ lastDouble }}</span>
      </div>
    </div>
    
    <!-- Modal de confirmation du double -->
    <div v-if="showConfirmModal" class="modal-overlay" @click="cancelDoubling">
      <div class="modal-content" @click.stop>
        <h3>🎲 Proposition de double</h3>
        <div class="double-proposal">
          <p>Voulez-vous doubler la mise de <span class="current-value">{{ currentValue }}</span> à <span class="new-value">{{ nextValue }}</span> points ?</p>
          <div class="cube-preview">
            <div class="mini-cube face-{{ currentValue }}">{{ currentValue }}</div>
            <span class="arrow">→</span>
            <div class="mini-cube face-{{ nextValue }}">{{ nextValue }}</div>
          </div>
        </div>
        
        <div class="modal-actions">
          <button @click="confirmDoubling" class="confirm-btn">
            ✅ Confirmer le double
          </button>
          <button @click="cancelDoubling" class="cancel-btn">
            ❌ Annuler
          </button>
        </div>
      </div>
    </div>
    
    <!-- Notification de double reçu -->
    <div v-if="showDoubleNotification" class="double-notification" :class="notificationType">
      <div class="notification-content">
        <span class="notification-icon">{{ notificationIcon }}</span>
        <span class="notification-text">{{ notificationText }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface Props {
  currentValue: number
  owner?: 'white' | 'black' | null
  canDouble: boolean
  isPlayerTurn: boolean
  playerColor: 'white' | 'black'
  gameMode: 'AI_VS_PLAYER' | 'PLAYER_VS_PLAYER'
}

const props = withDefaults(defineProps<Props>(), {
  owner: null,
  canDouble: false,
  gameMode: 'AI_VS_PLAYER'
})

const emit = defineEmits<{
  double: [newValue: number]
  accept: []
  reject: []
}>()

// État local
const isRolling = ref(false)
const showConfirmModal = ref(false)
const showDoubleNotification = ref(false)
const lastDouble = ref<string | null>(null)
const notificationText = ref('')
const notificationType = ref<'info' | 'success' | 'warning'>('info')

// Computed
const isOwned = computed(() => !!props.owner)
const isAvailable = computed(() => props.canDouble && props.isPlayerTurn)
const nextValue = computed(() => props.currentValue * 2)
const notificationIcon = computed(() => {
  switch (notificationType.value) {
    case 'success': return '✅'
    case 'warning': return '⚠️'
    default: return '🎲'
  }
})

// Méthodes
const handleDoubling = () => {
  if (!props.canDouble || !props.isPlayerTurn || isRolling.value) return
  
  // En mode joueur vs IA, proposer directement
  if (props.gameMode === 'AI_VS_PLAYER') {
    showConfirmModal.value = true
  } else {
    // En multijoueur, envoyer la proposition
    proposeDoubling()
  }
}

const proposeDoubling = () => {
  showConfirmModal.value = true
}

const confirmDoubling = async () => {
  isRolling.value = true
  showConfirmModal.value = false
  
  // Animation du videau
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  isRolling.value = false
  emit('double', nextValue.value)
  
  // Historique
  lastDouble.value = `${props.currentValue} → ${nextValue.value}`
  
  // Notification
  showNotification(`Videau doublé à ${nextValue.value}!`, 'success')
}

const cancelDoubling = () => {
  showConfirmModal.value = false
}

const acceptDoubling = () => {
  emit('accept')
  showNotification('Double accepté!', 'success')
}

const rejectDoubling = () => {
  emit('reject')
  showNotification('Double refusé - partie perdue!', 'warning')
}

const showNotification = (text: string, type: 'info' | 'success' | 'warning' = 'info') => {
  notificationText.value = text
  notificationType.value = type
  showDoubleNotification.value = true
  
  setTimeout(() => {
    showDoubleNotification.value = false
  }, 3000)
}

// Gérer les doubles de l'adversaire (IA ou autre joueur)
const handleOpponentDoubling = (newValue: number) => {
  showNotification(`L'adversaire propose de doubler à ${newValue}!`, 'warning')
  // En mode automatique pour l'IA, on pourrait accepter/refuser automatiquement
}

// Exposer les méthodes pour le parent
defineExpose({
  handleOpponentDoubling,
  acceptDoubling,
  rejectDoubling
})
</script>

<style scoped>
.doubling-cube-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.doubling-cube {
  position: relative;
  width: 60px;
  height: 60px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.doubling-cube.can-double:hover {
  transform: scale(1.1) rotate(5deg);
}

.doubling-cube.is-owned {
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
}

.cube-face {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
  border: 2px solid #ffd700;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.5rem;
  color: #ffd700;
  position: relative;
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.4),
    inset 0 2px 4px rgba(255, 215, 0, 0.2);
}

.cube-face::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, transparent 0%, rgba(255, 215, 0, 0.1) 100%);
  border-radius: 6px;
  pointer-events: none;
}

/* Différentes faces du videau */
.face-2 { background: linear-gradient(135deg, #4a4a4a 0%, #2a2a2a 100%); }
.face-4 { background: linear-gradient(135deg, #6a4a4a 0%, #4a2a2a 100%); }
.face-8 { background: linear-gradient(135deg, #8a6a4a 0%, #6a4a2a 100%); }
.face-16 { background: linear-gradient(135deg, #aa8a6a 0%, #8a6a4a 100%); }
.face-32 { background: linear-gradient(135deg, #caaa8a 0%, #aa8a6a 100%); }
.face-64 { background: linear-gradient(135deg, #ffcaaa 0%, #caaa8a 100%); }

.cube-number {
  font-size: 1.8rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.ownership-indicator {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  border: 2px solid #ffd700;
}

.owned-by-white {
  background: white;
  color: #333;
}

.owned-by-black {
  background: #1a1a1a;
  color: white;
}

/* Animation de rotation */
.cube-rolling {
  position: absolute;
  inset: 0;
  animation: cubeRoll 1s ease-in-out;
}

.rolling-face {
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #4a4a4a 0%, #2a2a2a 100%);
  border: 2px solid #ffd700;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.5rem;
  color: #ffd700;
}

@keyframes cubeRoll {
  0% { transform: rotateX(0deg) rotateY(0deg); }
  25% { transform: rotateX(90deg) rotateY(90deg); }
  50% { transform: rotateX(180deg) rotateY(180deg); }
  75% { transform: rotateX(270deg) rotateY(270deg); }
  100% { transform: rotateX(360deg) rotateY(360deg); }
}

/* Informations du videau */
.doubling-info {
  text-align: center;
  color: white;
}

.cube-status {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.9rem;
}

.status-label {
  opacity: 0.8;
}

.status-value {
  font-weight: bold;
  color: #ffd700;
  font-size: 1.1rem;
}

.owner-info {
  opacity: 0.8;
  font-size: 0.8rem;
}

.double-action {
  margin-top: 0.5rem;
}

.double-btn {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(238, 90, 36, 0.4);
}

.double-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(238, 90, 36, 0.6);
}

.double-history {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  opacity: 0.7;
}

/* Modal de confirmation */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
  border: 2px solid #ffd700;
  border-radius: 15px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  text-align: center;
  color: white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.modal-content h3 {
  margin: 0 0 1.5rem 0;
  color: #ffd700;
  font-size: 1.3rem;
}

.double-proposal p {
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.current-value {
  color: #4ecdc4;
  font-weight: bold;
}

.new-value {
  color: #ff6b6b;
  font-weight: bold;
}

.cube-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin: 1.5rem 0;
}

.mini-cube {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
  border: 2px solid #ffd700;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #ffd700;
  font-size: 1.2rem;
}

.arrow {
  color: #ffd700;
  font-size: 1.5rem;
  font-weight: bold;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.confirm-btn {
  background: linear-gradient(135deg, #56ab2f 0%, #a8e063 100%);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 25px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn {
  background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 25px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

/* Notification */
.double-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.9);
  border: 2px solid #ffd700;
  border-radius: 10px;
  padding: 1rem 1.5rem;
  color: white;
  z-index: 2000;
  animation: slideIn 0.3s ease-out;
  backdrop-filter: blur(10px);
}

.double-notification.success {
  border-color: #56ab2f;
  background: linear-gradient(135deg, rgba(86, 171, 47, 0.9) 0%, rgba(168, 224, 99, 0.9) 100%);
}

.double-notification.warning {
  border-color: #ff6b6b;
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.9) 0%, rgba(238, 90, 36, 0.9) 100%);
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.notification-icon {
  font-size: 1.2rem;
}

.notification-text {
  font-weight: bold;
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

/* Responsive */
@media (max-width: 768px) {
  .doubling-cube {
    width: 50px;
    height: 50px;
  }
  
  .cube-number {
    font-size: 1.5rem;
  }
  
  .modal-content {
    padding: 1.5rem;
  }
  
  .cube-preview {
    gap: 0.5rem;
  }
  
  .mini-cube {
    width: 35px;
    height: 35px;
    font-size: 1rem;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .double-notification {
    top: 10px;
    right: 10px;
    left: 10px;
  }
}
</style>
