<template>
  <div class="dice-container">
    <div 
      v-for="(die, index) in dice" 
      :key="index"
      class="die"
      :class="{ 
        'rolling': isRolling,
        'selected': selectedDie === index,
        'used': usedDice?.includes(index)
      }"
      @click="selectDie(index)"
    >
      <div class="die-face" :class="`die-${die}`">
        <div class="die-dots">
          <div 
            v-for="dot in getDots(die)" 
            :key="dot" 
            class="dot"
            :class="`dot-${dot}`"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  dice: number[]
  isRolling?: boolean
  selectedDie?: number | null
  usedDice?: number[]
}

const props = withDefaults(defineProps<Props>(), {
  isRolling: false,
  selectedDie: null,
  usedDice: () => []
})

const emit = defineEmits<{
  selectDie: [index: number]
}>()

const selectDie = (index: number) => {
  if (props.isRolling || props.usedDice?.includes(index)) return
  emit('selectDie', index)
}

const getDots = (value: number): number[] => {
  const dotPatterns: { [key: number]: number[] } = {
    1: [5],
    2: [1, 9],
    3: [1, 5, 9],
    4: [1, 3, 7, 9],
    5: [1, 3, 5, 7, 9],
    6: [1, 3, 4, 6, 7, 9]
  }
  return dotPatterns[value] || []
}
</script>

<style scoped>
.dice-container {
  display: flex;
  gap: 15px;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.die {
  width: 60px;
  height: 60px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

.die.rolling {
  animation: rollDice 0.6s ease-out;
}

.die.selected {
  transform: scale(1.1) translateY(-5px);
  filter: drop-shadow(0 5px 15px rgba(255, 215, 0, 0.6));
}

.die.used {
  opacity: 0.4;
  cursor: not-allowed;
  transform: scale(0.9);
}

.die:not(.rolling):not(.used):hover {
  transform: translateY(-2px);
}

@keyframes rollDice {
  0% { 
    transform: rotate(0deg) scale(1); 
  }
  25% { 
    transform: rotate(90deg) scale(1.1); 
  }
  50% { 
    transform: rotate(180deg) scale(1.2); 
  }
  75% { 
    transform: rotate(270deg) scale(1.1); 
  }
  100% { 
    transform: rotate(360deg) scale(1); 
  }
}

.die-face {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%);
  border: 2px solid #333;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.3),
    inset 0 2px 4px rgba(255, 255, 255, 0.8);
  position: relative;
  overflow: hidden;
}

.die-face::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, transparent 0%, rgba(0, 0, 0, 0.1) 100%);
  border-radius: 10px;
  pointer-events: none;
}

.die-dots {
  width: 100%;
  height: 100%;
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  padding: 8px;
}

.dot {
  width: 10px;
  height: 10px;
  background: radial-gradient(circle, #333 0%, #000 100%);
  border-radius: 50%;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.5);
  margin: auto;
}

/* Positions des points sur le dé */
.dot-1 { grid-area: 2 / 2; } /* Centre */
.dot-2 { grid-area: 1 / 1; } /* Coin supérieur gauche */
.dot-3 { grid-area: 1 / 3; } /* Coin supérieur droit */
.dot-4 { grid-area: 2 / 1; } /* Milieu gauche */
.dot-5 { grid-area: 2 / 3; } /* Milieu droit */
.dot-6 { grid-area: 3 / 1; } /* Coin inférieur gauche */
.dot-7 { grid-area: 3 / 3; } /* Coin inférieur droit */
.dot-8 { grid-area: 2 / 2; } /* Centre (pour le 6) */
.dot-9 { grid-area: 3 / 2; } /* Milieu inférieur (pour le 6) */

/* Styles spécifiques pour chaque valeur du dé */
.die-1 .dot { grid-area: 2 / 2; }

.die-2 .dot:nth-child(1) { grid-area: 1 / 1; }
.die-2 .dot:nth-child(2) { grid-area: 3 / 3; }

.die-3 .dot:nth-child(1) { grid-area: 1 / 1; }
.die-3 .dot:nth-child(2) { grid-area: 2 / 2; }
.die-3 .dot:nth-child(3) { grid-area: 3 / 3; }

.die-4 .dot:nth-child(1) { grid-area: 1 / 1; }
.die-4 .dot:nth-child(2) { grid-area: 1 / 3; }
.die-4 .dot:nth-child(3) { grid-area: 3 / 1; }
.die-4 .dot:nth-child(4) { grid-area: 3 / 3; }

.die-5 .dot:nth-child(1) { grid-area: 1 / 1; }
.die-5 .dot:nth-child(2) { grid-area: 1 / 3; }
.die-5 .dot:nth-child(3) { grid-area: 2 / 2; }
.die-5 .dot:nth-child(4) { grid-area: 3 / 1; }
.die-5 .dot:nth-child(5) { grid-area: 3 / 3; }

.die-6 .dot:nth-child(1) { grid-area: 1 / 1; }
.die-6 .dot:nth-child(2) { grid-area: 1 / 3; }
.die-6 .dot:nth-child(3) { grid-area: 2 / 1; }
.die-6 .dot:nth-child(4) { grid-area: 2 / 3; }
.die-6 .dot:nth-child(5) { grid-area: 3 / 1; }
.die-6 .dot:nth-child(6) { grid-area: 3 / 3; }

/* Responsive */
@media (max-width: 768px) {
  .dice-container {
    gap: 10px;
    padding: 15px;
  }
  
  .die {
    width: 50px;
    height: 50px;
  }
  
  .dot {
    width: 8px;
    height: 8px;
  }
}

/* Animation de victoire */
@keyframes diceWin {
  0%, 100% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.2) rotate(5deg); }
  75% { transform: scale(1.2) rotate(-5deg); }
}

.die.winning {
  animation: diceWin 1s ease-in-out;
}
</style>
