<template>
  <div class="gurubot-chat-view">
    <GurubotAssistant />
  </div>
</template>

<script setup>
import GurubotAssistant from '@/components/GurubotAssistant.vue'
</script>

<style scoped>
.gurubot-chat-view {
  height: 100vh;
  overflow: hidden;
}
</style>
