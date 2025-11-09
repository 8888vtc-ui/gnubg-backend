/**
 * GameChat Component - Real-time Multiplayer Chat
 * Handles WebSocket chat synchronization
 */

<template>
  <div class="game-chat-container">
    <!-- Chat Header -->
    <div class="chat-header">
      <h4>Chat de la partie #{{ gameId }}</h4>
      <div class="connection-status">
        <div class="status-indicator" :class="chatConnectionStatus">
          {{ chatConnectionStatusText }}
        </div>
      </div>
    </div>

    <!-- Messages Container -->
    <div class="messages-container" ref="messagesContainer">
      <div 
        v-for="message in messages" 
        :key="message.id || message.timestamp"
        class="message"
        :class="[
          message.messageType?.toLowerCase(),
          { 'own-message': message.userId === currentUserId }
        ]"
      >
        <div class="message-header">
          <span class="username">{{ message.username || 'Anonyme' }}</span>
          <span class="timestamp">{{ formatTime(message.timestamp) }}</span>
        </div>
        <div class="message-content">
          <span v-if="message.messageType === 'EMOJI'" class="emoji-message">
            {{ message.message }}
          </span>
          <span v-else-if="message.messageType === 'SYSTEM'" class="system-message">
            {{ message.message }}
          </span>
          <span v-else class="text-message">
            {{ message.message }}
          </span>
        </div>
      </div>
      
      <!-- Typing indicator -->
      <div v-if="typingUsers.length > 0" class="typing-indicator">
        <span class="typing-text">
          {{ getTypingText() }}
        </span>
        <div class="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>

    <!-- Message Input -->
    <div class="message-input-container">
      <div class="input-group">
        <input
          v-model="messageInput"
          @keyup.enter="sendMessage"
          @input="handleTyping"
          type="text"
          placeholder="Tapez votre message..."
          class="message-input"
          :disabled="!isConnected || isSending"
          maxlength="500"
        />
        <button
          @click="sendMessage"
          :disabled="!messageInput.trim() || !isConnected || isSending"
          class="send-button"
        >
          {{ isSending ? '...' : 'Envoyer' }}
        </button>
      </div>
      
      <!-- Quick Actions -->
      <div class="quick-actions">
        <button
          v-for="emoji in quickEmojis"
          :key="emoji"
          @click="sendEmoji(emoji)"
          class="emoji-button"
          :title="emoji"
        >
          {{ emoji }}
        </button>
        <button
          @click="showEmojis = !showEmojis"
          class="emoji-toggle"
          title="Plus d'emojis"
        >
          😊
        </button>
      </div>
      
      <!-- Emoji Picker -->
      <div v-if="showEmojis" class="emoji-picker">
        <button
          v-for="emoji in allEmojis"
          :key="emoji"
          @click="sendEmoji(emoji)"
          class="emoji-option"
        >
          {{ emoji }}
        </button>
      </div>
    </div>

    <!-- Chat Settings -->
    <div class="chat-settings">
      <label class="setting-item">
        <input
          v-model="soundEnabled"
          type="checkbox"
          class="setting-checkbox"
        />
        <span>Activer les sons</span>
      </label>
      <label class="setting-item">
        <input
          v-model="autoScroll"
          type="checkbox"
          class="setting-checkbox"
        />
        <span>Défilement automatique</span>
      </label>
      <button
        @click="clearMessages"
        class="clear-button"
        title="Effacer les messages"
      >
        🗑️ Effacer
      </button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import wsClient from '@/services/websocket.client'

export default {
  name: 'GameChat',
  props: {
    gameId: {
      type: String,
      required: true
    },
    currentUserId: {
      type: String,
      required: true
    },
    currentUsername: {
      type: String,
      default: 'Joueur'
    }
  },
  
  setup(props) {
    // Reactive state
    const messages = ref([])
    const messageInput = ref('')
    const isConnected = ref(false)
    const isSending = ref(false)
    const chatConnectionStatus = ref('disconnected')
    const typingUsers = ref(new Set())
    const showEmojis = ref(false)
    const soundEnabled = ref(true)
    const autoScroll = ref(true)
    const messagesContainer = ref(null)
    
    // WebSocket connection ID
    let wsConnectionId = null
    let typingTimeout = null
    
    // Emoji collections
    const quickEmojis = ['👍', '🎲', '🎯', '🏆', '😄', '😊', '🤔', '👏']
    const allEmojis = [
      '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
      '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
      '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
      '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
      '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮',
      '🎲', '🎯', '🎪', '🎨', '🎬', '🎤', '🎧', '🎼', '🎵', '🎶',
      '🏆', '🥇', '🥈', '🥉', '⚽', '🏀', '🏈', '⚾', '🥎', '🎾',
      '🏐', '🏉', '🥏', '🎱', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏',
      '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
      '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤝', '🙏'
    ]
    
    // Computed properties
    const chatConnectionStatusText = computed(() => {
      switch (chatConnectionStatus.value) {
        case 'connected': return 'Connecté'
        case 'connecting': return 'Connexion...'
        case 'disconnected': return 'Déconnecté'
        case 'error': return 'Erreur'
        default: return 'Inconnu'
      }
    })
    
    // Initialize WebSocket connection
    const connectWebSocket = async () => {
      try {
        const token = localStorage.getItem('jwt_token')
        if (!token) {
          console.error('No authentication token found')
          return
        }
        
        wsConnectionId = await wsClient.connect('chat', props.gameId, token)
        setupWebSocketHandlers()
        chatConnectionStatus.value = 'connected'
        isConnected.value = true
        
        // Send join message
        sendSystemMessage(`${props.currentUsername} a rejoint le chat`)
      } catch (error) {
        console.error('Chat WebSocket connection failed:', error)
        chatConnectionStatus.value = 'error'
        isConnected.value = false
      }
    }
    
    // Setup WebSocket event handlers
    const setupWebSocketHandlers = () => {
      wsClient.on('connected', (data) => {
        console.log('Chat WebSocket connected:', data)
        chatConnectionStatus.value = 'connected'
        isConnected.value = true
      })
      
      wsClient.on('disconnected', () => {
        chatConnectionStatus.value = 'disconnected'
        isConnected.value = false
      })
      
      wsClient.on('error', (data) => {
        console.error('Chat WebSocket error:', data)
        chatConnectionStatus.value = 'error'
        isConnected.value = false
      })
      
      // Handle chat messages
      wsClient.on('chat_message', (data) => {
        handleChatMessage(data)
      })
    }
    
    // Handle incoming chat messages
    const handleChatMessage = (data) => {
      console.log('Chat message received:', data)
      
      const message = {
        id: Date.now() + Math.random(),
        userId: data.userId,
        username: data.username,
        message: data.message,
        messageType: data.messageType || 'TEXT',
        timestamp: data.timestamp
      }
      
      messages.value.push(message)
      
      // Play sound if enabled and message is not from current user
      if (soundEnabled.value && data.userId !== props.currentUserId) {
        playMessageSound()
      }
      
      // Auto scroll to bottom if enabled
      if (autoScroll.value) {
        scrollToBottom()
      }
      
      // Remove user from typing indicators
      typingUsers.value.delete(data.userId)
    }
    
    // Send message
    const sendMessage = () => {
      if (!messageInput.value.trim() || !isConnected.value || isSending.value) {
        return
      }
      
      isSending.value = true
      
      const message = {
        message: messageInput.value.trim(),
        username: props.currentUsername,
        messageType: 'TEXT'
      }
      
      if (wsClient.send(wsConnectionId, message)) {
        messageInput.value = ''
        stopTyping()
      } else {
        console.error('Failed to send message')
      }
      
      isSending.value = false
    }
    
    // Send emoji
    const sendEmoji = (emoji) => {
      if (!isConnected.value || isSending.value) {
        return
      }
      
      isSending.value = true
      
      const message = {
        message: emoji,
        username: props.currentUsername,
        messageType: 'EMOJI'
      }
      
      if (wsClient.send(wsConnectionId, message)) {
        showEmojis.value = false
      } else {
        console.error('Failed to send emoji')
      }
      
      isSending.value = false
    }
    
    // Send system message
    const sendSystemMessage = (text) => {
      const message = {
        id: Date.now() + Math.random(),
        userId: 'system',
        username: 'Système',
        message: text,
        messageType: 'SYSTEM',
        timestamp: new Date().toISOString()
      }
      
      messages.value.push(message)
      
      if (autoScroll.value) {
        scrollToBottom()
      }
    }
    
    // Handle typing indicator
    const handleTyping = () => {
      if (messageInput.value.trim() && isConnected.value) {
        // Send typing indicator (in a real implementation, you'd send this to server)
        startTyping()
      } else {
        stopTyping()
      }
    }
    
    const startTyping = () => {
      // Clear existing timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout)
      }
      
      // Send typing start to server (simplified)
      // In a real implementation, you'd send this via WebSocket
      
      // Set timeout to stop typing after 3 seconds of inactivity
      typingTimeout = setTimeout(() => {
        stopTyping()
      }, 3000)
    }
    
    const stopTyping = () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout)
        typingTimeout = null
      }
      
      // Send typing stop to server (simplified)
      // In a real implementation, you'd send this via WebSocket
    }
    
    // Get typing indicator text
    const getTypingText = () => {
      const users = Array.from(typingUsers.value)
      if (users.length === 0) return ''
      if (users.length === 1) return `${users[0]} est en train d'écrire...`
      if (users.length === 2) return `${users[0]} et ${users[1]} sont en train d'écrire...`
      return `${users.length} joueurs sont en train d'écrire...`
    }
    
    // Utility functions
    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    const scrollToBottom = () => {
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
      })
    }
    
    const playMessageSound = () => {
      // Play a simple notification sound
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT')
        audio.volume = 0.3
        audio.play().catch(() => {
          // Ignore audio play errors
        })
      } catch (error) {
        // Ignore audio errors
      }
    }
    
    const clearMessages = () => {
      if (confirm('Êtes-vous sûr de vouloir effacer tous les messages ?')) {
        messages.value = []
        sendSystemMessage('Messages effacés')
      }
    }
    
    // Watch for auto scroll changes
    watch(autoScroll, (newValue) => {
      if (newValue) {
        scrollToBottom()
      }
    })
    
    // Lifecycle
    onMounted(() => {
      connectWebSocket()
      
      // Add some welcome messages
      setTimeout(() => {
        sendSystemMessage('Bienvenue dans le chat de la partie !')
        sendSystemMessage('Utilisez les emojis pour réagir rapidement aux coups')
      }, 1000)
    })
    
    onUnmounted(() => {
      if (wsConnectionId) {
        // Send leave message
        sendSystemMessage(`${props.currentUsername} a quitté le chat`)
        wsClient.disconnect(wsConnectionId)
      }
      
      if (typingTimeout) {
        clearTimeout(typingTimeout)
      }
    })
    
    return {
      // State
      messages,
      messageInput,
      isConnected,
      isSending,
      chatConnectionStatus,
      chatConnectionStatusText,
      typingUsers,
      showEmojis,
      soundEnabled,
      autoScroll,
      messagesContainer,
      quickEmojis,
      allEmojis,
      
      // Methods
      sendMessage,
      sendEmoji,
      handleTyping,
      getTypingText,
      formatTime,
      clearMessages
    }
  }
}
</script>

<style scoped>
.game-chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 600px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.chat-header h4 {
  margin: 0;
  font-size: 1.1em;
}

.status-indicator {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: bold;
}

.status-indicator.connected {
  background: #4caf50;
  color: white;
}

.status-indicator.connecting {
  background: #ff9800;
  color: white;
}

.status-indicator.disconnected,
.status-indicator.error {
  background: #f44336;
  color: white;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f8f9fa;
}

.message {
  margin-bottom: 15px;
  padding: 12px 15px;
  border-radius: 10px;
  background: white;
  border-left: 4px solid #667eea;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.message:hover {
  transform: translateX(2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.message.own-message {
  background: linear-gradient(135deg, #667eea15, #764ba215);
  border-left-color: #764ba2;
}

.message.system {
  background: #fff3cd;
  border-left-color: #ffc107;
  text-align: center;
  font-style: italic;
}

.message.emoji {
  text-align: center;
  background: #e8f5e8;
  border-left-color: #4caf50;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.username {
  font-weight: bold;
  color: #667eea;
}

.timestamp {
  font-size: 0.8em;
  color: #666;
}

.message-content {
  line-height: 1.4;
}

.emoji-message {
  font-size: 2em;
}

.system-message {
  color: #856404;
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 15px;
  margin-bottom: 10px;
  background: white;
  border-radius: 20px;
  border-left: 4px solid #ff9800;
  font-size: 0.9em;
  color: #666;
}

.typing-dots {
  display: flex;
  gap: 3px;
}

.typing-dots span {
  width: 6px;
  height: 6px;
  background: #ff9800;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.7;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

.message-input-container {
  padding: 20px;
  background: white;
  border-top: 1px solid #e0e0e0;
}

.input-group {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.message-input {
  flex: 1;
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 25px;
  font-size: 1em;
  outline: none;
  transition: all 0.3s ease;
}

.message-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.message-input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.send-button {
  padding: 12px 20px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 25px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.send-button:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.send-button:disabled {
  background: #cccccc;
  cursor: not-allowed;
  transform: none;
}

.quick-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.emoji-button,
.emoji-toggle {
  padding: 8px 12px;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  cursor: pointer;
  font-size: 1.2em;
  transition: all 0.3s ease;
}

.emoji-button:hover,
.emoji-toggle:hover {
  background: #e8eaf6;
  transform: scale(1.1);
}

.emoji-toggle {
  background: linear-gradient(135deg, #667eea15, #764ba215);
  border-color: #667eea;
}

.emoji-picker {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 5px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
  border: 1px solid #e0e0e0;
  max-height: 200px;
  overflow-y: auto;
}

.emoji-option {
  padding: 8px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1.2em;
  transition: all 0.3s ease;
}

.emoji-option:hover {
  background: #e8eaf6;
  transform: scale(1.2);
}

.chat-settings {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #f8f9fa;
  border-top: 1px solid #e0e0e0;
  font-size: 0.9em;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.setting-checkbox {
  cursor: pointer;
}

.clear-button {
  padding: 6px 12px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  font-size: 0.8em;
  transition: all 0.3s ease;
}

.clear-button:hover {
  background: #d32f2f;
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .chat-header {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
  
  .input-group {
    flex-direction: column;
  }
  
  .quick-actions {
    justify-content: center;
  }
  
  .emoji-picker {
    grid-template-columns: repeat(6, 1fr);
  }
  
  .chat-settings {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
}
</style>
