<template>
  <div class="game-view">
    <div class="game-container">
      <BackgammonBoard
        :game-id="gameId"
        @game-created="onGameCreated"
        @game-loaded="onGameLoaded"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BackgammonBoard from '@/components/BackgammonBoard.vue'

const router = useRouter()
const route = useRoute()

// Get game ID from route params
const gameId = ref(route.params.id as string)

// Event handlers
const onGameCreated = (game: any) => {
  console.log('Game created:', game)
  // Update URL with game ID
  router.push(`/game/${game.id}`)
}

const onGameLoaded = (game: any) => {
  console.log('Game loaded:', game)
}

// Go back to dashboard
const goBack = () => {
  router.push('/dashboard')
}
</script>

<style scoped>
.game-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  padding: 2rem;
}

.game-container {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
