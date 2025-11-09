<template>
  <div class="easybot-game">
    <!-- EasyBot Header -->
    <div class="easybot-header">
      <div class="bot-avatar">
        <div class="avatar-circle easy">🎯</div>
        <div class="bot-status friendly"></div>
      </div>
      <div class="bot-info">
        <h2 class="bot-name">EasyBot</h2>
        <p class="bot-description">Your Friendly Backgammon Teacher</p>
        <div class="bot-stats">
          <span class="stat">🏆 ELO: 1400</span>
          <span class="stat">🎯 Difficulty: Easy</span>
          <span class="stat">😊 Style: Friendly</span>
        </div>
      </div>
      <div class="bot-mood">
        <div class="mood-indicator">
          <span class="mood-emoji">{{ currentMood }}</span>
          <span class="mood-text">{{ moodText }}</span>
        </div>
      </div>
    </div>

    <!-- Game Board -->
    <div class="game-board-section">
      <div class="board-container">
        <div class="backgammon-board">
          <!-- Simplified board representation -->
          <div class="board-points">
            <div v-for="i in 24" :key="i" class="point" :class="getPointClass(i)">
              <div class="checkers" v-if="getCheckersCount(i) > 0">
                <span v-for="j in Math.min(getCheckersCount(i), 5)" :key="j" class="checker"></span>
                <span v-if="getCheckersCount(i) > 5" class="checker-count">+{{ getCheckersCount(i) - 5 }}</span>
              </div>
            </div>
          </div>
          
          <!-- Dice Area -->
          <div class="dice-area">
            <div class="dice-container">
              <div v-for="(die, index) in dice" :key="index" class="die" :class="getDieClass(die)">
                {{ die }}
              </div>
            </div>
            <button @click="rollDice" :disabled="isRolling || !isPlayerTurn" class="roll-btn">
              🎲 Roll Dice
            </button>
          </div>
          
          <!-- Game Info -->
          <div class="game-info">
            <div class="info-item">
              <span class="label">Turn:</span>
              <span class="value">{{ currentTurn }}</span>
            </div>
            <div class="info-item">
              <span class="label">Cube:</span>
              <span class="value">{{ cubeValue }}</span>
            </div>
            <div class="info-item">
              <span class="label">Score:</span>
              <span class="value">{{ playerScore }} - {{ easyBotScore }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- EasyBot Chat & Teaching -->
    <div class="interaction-section">
      <div class="chat-panel">
        <div class="chat-header">
          <h3>💬 Chat with EasyBot</h3>
          <div class="typing-indicator" v-if="easyBotIsTyping">
            EasyBot is thinking<span class="dots">...</span>
          </div>
        </div>
        
        <div class="chat-messages" ref="chatMessages">
          <div 
            v-for="message in chatMessages" 
            :key="message.id"
            class="message"
            :class="{ 'player': message.sender === 'player', 'easybot': message.sender === 'easybot' }"
          >
            <div class="message-avatar">
              {{ message.sender === 'player' ? '👤' : '🎯' }}
            </div>
            <div class="message-content">
              <div class="message-text">{{ message.text }}</div>
              <div class="message-time">{{ formatTime(message.timestamp) }}</div>
            </div>
          </div>
        </div>
        
        <div class="chat-input">
          <div class="input-group">
            <input 
              v-model="currentMessage"
              @keyup.enter="sendMessage"
              type="text"
              placeholder="Ask EasyBot anything about backgammon!"
              class="message-input"
              :disabled="easyBotIsTyping"
            />
            <button 
              @click="sendMessage"
              class="btn-send"
              :disabled="!currentMessage.trim() || easyBotIsTyping"
            >
              💬
            </button>
          </div>
          
          <!-- Quick Questions -->
          <div class="quick-questions">
            <span class="quick-label">Quick help:</span>
            <button 
              v-for="question in quickQuestions"
              :key="question"
              @click="askQuickQuestion(question)"
              class="quick-btn"
            >
              {{ question }}
            </button>
          </div>
        </div>
      </div>

      <!-- Teaching Panel -->
      <div class="teaching-panel">
        <div class="teaching-header">
          <h3>📚 EasyBot Teaching</h3>
          <button @click="requestTeaching" class="btn-teach">
            🎓 Teach Me
          </button>
        </div>
        
        <div v-if="currentTeaching" class="teaching-content">
          <div class="teaching-topic">
            <h4>{{ currentTeaching.topic }}</h4>
            <p class="teaching-explanation">{{ currentTeaching.explanation }}</p>
          </div>
          
          <div class="teaching-concepts">
            <h5>🔍 Key Concepts:</h5>
            <ul>
              <li v-for="concept in currentTeaching.key_concepts" :key="concept">
                {{ concept }}
              </li>
            </ul>
          </div>
          
          <div class="teaching-tips">
            <h5>💡 Practice Tips:</h5>
            <p>{{ currentTeaching.practice_tips }}</p>
          </div>
          
          <div class="teaching-example" v-if="currentTeaching.examples.length > 0">
            <h5>🎯 Example:</h5>
            <div class="example">
              <div class="example-dice">
                Dice: {{ currentTeaching.examples[0].dice.join('-') }}
              </div>
              <div class="example-move">
                Best move: {{ currentTeaching.examples[0].best_move }}
              </div>
              <div class="example-reasoning">
                {{ currentTeaching.examples[0].reasoning }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- Teaching Settings -->
        <div class="teaching-settings">
          <div class="setting-group">
            <label>Focus Area:</label>
            <select v-model="teachingSettings.focusArea" @change="updateTeachingSettings">
              <option value="general">General Strategy</option>
              <option value="opening">Opening Moves</option>
              <option value="safety">Safety First</option>
              <option value="racing">Racing</option>
              <option value="cube">Cube Decisions</option>
            </select>
          </div>
          <div class="setting-group">
            <label>Difficulty:</label>
            <select v-model="teachingSettings.level" @change="updateTeachingSettings">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Game Controls -->
    <div class="game-controls">
      <div class="control-buttons">
        <button @click="startNewGame" class="btn btn-new-game">
          🎮 New Game
        </button>
        <button @click="getHint" :disabled="!isPlayerTurn || dice.length === 0" class="btn btn-hint">
          💡 Get Hint
        </button>
        <button @click="undoMove" :disabled="!canUndo" class="btn btn-undo">
          ↩️ Undo Move
        </button>
        <button @click="askEasyBotMove" :disabled="!isPlayerTurn || dice.length === 0" class="btn btn-easybot-move">
          🎯 EasyBot Suggestion
        </button>
      </div>
      
      <div class="game-status">
        <div class="status-message">
          {{ statusMessage }}
        </div>
      </div>
    </div>

    <!-- Practice Modal -->
    <div v-if="showPracticeModal" class="modal-overlay" @click="closePracticeModal">
      <div class="practice-modal" @click.stop>
        <div class="modal-header">
          <h3>🎯 Practice with EasyBot</h3>
          <button @click="closePracticeModal" class="btn-close">✖️</button>
        </div>
        
        <div class="practice-content">
          <div class="practice-positions">
            <h4>Practice Positions:</h4>
            <div 
              v-for="(position, index) in practicePositions"
              :key="index"
              class="practice-position"
              @click="selectPracticePosition(position)"
            >
              <div class="position-name">{{ position.position_name }}</div>
              <div class="position-difficulty">{{ position.difficulty }}</div>
              <div class="position-focus">{{ position.focus_area }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'

// État du jeu
const dice = ref([])
const isRolling = ref(false)
const isPlayerTurn = ref(true)
const currentTurn = ref('Player')
const cubeValue = ref(1)
const playerScore = ref(0)
const easyBotScore = ref(0)

// État EasyBot
const currentMood = ref('😊')
const moodText = ref('Ready to play!')
const easyBotIsTyping = ref(false)

// Chat
const chatMessages = ref([
  {
    id: 1,
    sender: 'easybot',
    text: "Hi! I'm EasyBot, your friendly backgammon teacher! Let's have fun and learn together! 🎯😊",
    timestamp: new Date()
  }
])
const currentMessage = ref('')

// Teaching
const currentTeaching = ref(null)
const teachingSettings = reactive({
  focusArea: 'general',
  level: 'beginner'
})

// Quick Questions
const quickQuestions = [
  'Best opening?',
  'Safety tips?',
  'When to double?',
  'Race strategy?',
  'Help me learn!'
]

// Game state
const canUndo = ref(false)
const statusMessage = ref('Welcome! Roll the dice to start playing!')
const showPracticeModal = ref(false)
const practicePositions = ref([])

// Board state (simplified)
const boardState = reactive({
  points: new Array(24).fill(0).map(() => ({ white: 0, black: 0 })),
  bar: { white: 0, black: 0 },
  home: { white: 0, black: 0 }
})

// Refs
const chatMessages = ref(null)

// Méthodes
const rollDice = async () => {
  if (isRolling.value || !isPlayerTurn.value) return
  
  isRolling.value = true
  
  // Simulate dice rolling
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const die1 = Math.floor(Math.random() * 6) + 1
  const die2 = Math.floor(Math.random() * 6) + 1
  
  if (die1 === die2) {
    dice.value = [die1, die1, die1, die1]
  } else {
    dice.value = [die1, die2]
  }
  
  isRolling.value = false
  statusMessage.value = `You rolled ${die1}-${die2}! Make your move!`
  
  // Add encouraging message
  addEasyBotMessage(`Great roll! ${die1}-${die2} gives you some nice options. What would you like to do?`)
}

const sendMessage = async () => {
  if (!currentMessage.value.trim() || easyBotIsTyping.value) return
  
  // Add player message
  const playerMessage = {
    id: Date.now(),
    sender: 'player',
    text: currentMessage.value,
    timestamp: new Date()
  }
  
  chatMessages.value.push(playerMessage)
  const question = currentMessage.value
  currentMessage.value = ''
  
  // Scroll to bottom
  await nextTick()
  scrollToBottom()
  
  // Show typing indicator
  easyBotIsTyping.value = true
  updateMood('thinking', '🤔', 'Thinking...')
  
  try {
    const response = await fetch('https://gammon-guru-backend.railway.app/api/easybot/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: question,
        player_level: teachingSettings.level
      })
    })
    
    const data = await response.json()
    
    if (data.success) {
      const easyBotMessage = {
        id: Date.now() + 1,
        sender: 'easybot',
        text: data.response.text,
        timestamp: new Date()
      }
      
      chatMessages.value.push(easyBotMessage)
      updateMood('happy', '😊', 'Helpful!')
    } else {
      throw new Error(data.error)
    }
  } catch (error) {
    const errorMessage = {
      id: Date.now() + 1,
      sender: 'easybot',
      text: "I'm having trouble connecting, but I'm still here to help! What would you like to know about backgammon?",
      timestamp: new Date()
    }
    
    chatMessages.value.push(errorMessage)
  }
  
  easyBotIsTyping.value = false
  updateMood('friendly', '😊', 'Ready to help!')
  
  // Scroll to bottom
  await nextTick()
  scrollToBottom()
}

const askQuickQuestion = async (question) => {
  currentMessage.value = question
  await sendMessage()
}

const requestTeaching = async () => {
  try {
    const response = await fetch('https://gammon-guru-backend.railway.app/api/easybot/teaching', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        position_id: '4HPwATDgc/ABMA',
        topic: teachingSettings.focusArea,
        player_level: teachingSettings.level
      })
    })
    
    const data = await response.json()
    
    if (data.success) {
      currentTeaching.value = data.teaching
      addEasyBotMessage(`Great! Let's learn about ${teachingSettings.focusArea}. I've prepared some helpful content for you!`)
    }
  } catch (error) {
    console.error('Teaching error:', error)
    addEasyBotMessage("I'd love to teach you! Let me prepare a great lesson about safety and basic strategy.")
  }
}

const getHint = async () => {
  if (dice.value.length === 0) return
  
  addEasyBotMessage("Let me think about the best move for you... Safety is usually the best approach when learning!")
  
  try {
    const response = await fetch('https://gammon-guru-backend.railway.app/api/easybot/move', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        position_id: '4HPwATDgc/ABMA',
        dice: dice.value.slice(0, 2), // Send only first 2 dice for hint
        player_color: 'white'
      })
    })
    
    const data = await response.json()
    
    if (data.success) {
      addEasyBotMessage(`💡 Hint: ${data.move.reasoning} The move ${data.move.move} looks pretty good!`)
    }
  } catch (error) {
    addEasyBotMessage("Try to make safe moves and avoid leaving blots where they can be hit!")
  }
}

const askEasyBotMove = async () => {
  if (dice.value.length === 0) return
  
  easyBotIsTyping.value = true
  updateMood('thinking', '🤔', 'Analyzing...')
  
  try {
    const response = await fetch('https://gammon-guru-backend.railway.app/api/easybot/move', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        position_id: '4HPwATDgc/ABMA',
        dice: dice.value.slice(0, 2),
        player_color: 'white'
      })
    })
    
    const data = await response.json()
    
    if (data.success) {
      addEasyBotMessage(`🎯 I would play: ${data.move.move}. ${data.move.reasoning} ${data.move.educational_comment}`)
    }
  } catch (error) {
    addEasyBotMessage("I'd suggest making safe points and building your inner board. Safety first!")
  }
  
  easyBotIsTyping.value = false
  updateMood('happy', '😊', 'Helpful!')
}

const startNewGame = async () => {
  try {
    const response = await fetch('https://gammon-guru-backend.railway.app/api/easybot/game', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        player_name: 'Player',
        player_color: 'white'
      })
    })
    
    const data = await response.json()
    
    if (data.success) {
      // Reset game state
      dice.value = []
      isPlayerTurn.value = true
      currentTurn.value = 'Player'
      playerScore.value = 0
      easyBotScore.value = 0
      
      addEasyBotMessage(data.easyBot.greeting)
      statusMessage.value = 'New game started! Roll the dice to begin!'
      updateMood('excited', '🎮', "Let's play!")
    }
  } catch (error) {
    addEasyBotMessage("Great! Let's start a fresh game. I'll help you learn as we play!")
    statusMessage.value = 'New game started! Roll the dice to begin!'
  }
}

const undoMove = () => {
  // Simplified undo
  canUndo.value = false
  addEasyBotMessage("No problem! Let's try that move again. Practice makes perfect!")
}

const updateTeachingSettings = () => {
  console.log('Teaching settings updated:', teachingSettings)
}

const updateMood = (mood, emoji, text) => {
  currentMood.value = emoji
  moodText.value = text
}

const addEasyBotMessage = (text) => {
  const message = {
    id: Date.now(),
    sender: 'easybot',
    text: text,
    timestamp: new Date()
  }
  
  chatMessages.value.push(message)
  
  nextTick(() => {
    scrollToBottom()
  })
}

// Helper methods
const formatTime = (date) => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const scrollToBottom = () => {
  if (chatMessages.value) {
    chatMessages.value.scrollTop = chatMessages.value.scrollHeight
  }
}

const getPointClass = (index) => {
  // Simplified point styling
  if (index <= 6) return 'white-home'
  if (index >= 19) return 'black-home'
  if (index % 2 === 0) return 'dark'
  return 'light'
}

const getCheckersCount = (index) => {
  // Simplified checker count
  if (index === 1) return 2
  if (index === 6) return 5
  if (index === 8) return 3
  if (index === 12) return 5
  if (index === 13) return 5
  if (index === 17) return 3
  if (index === 19) return 5
  if (index === 24) return 2
  return 0
}

const getDieClass = (value) => {
  return `die-${value}`
}

const closePracticeModal = () => {
  showPracticeModal.value = false
}

const selectPracticePosition = (position) => {
  addEasyBotMessage(`Great choice! Let's work on "${position.position_name}". I'll guide you through it!`)
  closePracticeModal()
}

// Lifecycle
onMounted(() => {
  scrollToBottom()
  updateMood('friendly', '😊', 'Ready to help!')
})
</script>

<style scoped>
.easybot-game {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  overflow: hidden;
}

/* EasyBot Header */
.easybot-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.bot-avatar {
  position: relative;
}

.avatar-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.avatar-circle.easy {
  background: linear-gradient(135deg, #56ab2f 0%, #a8e063 100%);
}

.bot-status {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #667eea;
}

.bot-status.friendly {
  background: #56ab2f;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.bot-info h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.8rem;
  color: #ffd700;
}

.bot-description {
  margin: 0 0 1rem 0;
  opacity: 0.9;
}

.bot-stats {
  display: flex;
  gap: 1rem;
}

.stat {
  padding: 0.25rem 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  font-size: 0.9rem;
}

.mood-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
}

.mood-emoji {
  font-size: 1.5rem;
}

.mood-text {
  font-size: 0.9rem;
  opacity: 0.8;
}

/* Game Board */
.game-board-section {
  padding: 1rem;
  flex-shrink: 0;
}

.board-container {
  max-width: 800px;
  margin: 0 auto;
}

.backgammon-board {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 15px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.board-points {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 2px;
  margin-bottom: 1.5rem;
  min-height: 200px;
}

.point {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px 4px 0 0;
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 0.5rem;
}

.point.dark {
  background: rgba(0, 0, 0, 0.3);
}

.point.light {
  background: rgba(255, 255, 255, 0.15);
}

.point.white-home {
  background: rgba(255, 255, 255, 0.2);
}

.point.black-home {
  background: rgba(0, 0, 0, 0.4);
}

.checkers {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.checker {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
}

.checker-count {
  font-size: 0.7rem;
  font-weight: bold;
}

.dice-area {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 1rem;
}

.dice-container {
  display: flex;
  gap: 1rem;
}

.die {
  width: 50px;
  height: 50px;
  background: white;
  color: #333;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.roll-btn {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #56ab2f 0%, #a8e063 100%);
  border: none;
  border-radius: 10px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.roll-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.roll-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.game-info {
  display: flex;
  justify-content: space-around;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

.info-item {
  text-align: center;
}

.info-item .label {
  display: block;
  font-size: 0.9rem;
  opacity: 0.8;
  margin-bottom: 0.25rem;
}

.info-item .value {
  font-size: 1.2rem;
  font-weight: bold;
  color: #ffd700;
}

/* Interaction Section */
.interaction-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding: 1rem;
  flex: 1;
  overflow: hidden;
}

.chat-panel, .teaching-panel {
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
}

.chat-header, .teaching-header {
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-header h3, .teaching-header h3 {
  margin: 0;
  color: #ffd700;
}

.typing-indicator {
  font-size: 0.9rem;
  opacity: 0.7;
}

.dots {
  animation: dots 1.5s infinite;
}

@keyframes dots {
  0%, 20% { content: '.'; }
  40% { content: '..'; }
  60%, 100% { content: '...'; }
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message {
  display: flex;
  gap: 1rem;
  max-width: 80%;
}

.message.player {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message.easybot {
  align-self: flex-start;
}

.message-avatar {
  width: 35px;
  height: 35px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.message-content {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.75rem;
  border-radius: 10px;
  flex: 1;
}

.message.player .message-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.message-time {
  font-size: 0.7rem;
  opacity: 0.7;
  margin-top: 0.25rem;
}

.chat-input {
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.input-group {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.message-input {
  flex: 1;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 1rem;
}

.message-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.btn-send {
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
}

.quick-questions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.quick-label {
  font-size: 0.9rem;
  opacity: 0.8;
}

.quick-btn {
  padding: 0.25rem 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  color: white;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background 0.3s ease;
}

.quick-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Teaching Panel */
.teaching-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.teaching-topic h4 {
  color: #ffd700;
  margin: 0 0 0.5rem 0;
}

.teaching-explanation {
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
}

.teaching-concepts, .teaching-tips, .teaching-example {
  margin-bottom: 1.5rem;
}

.teaching-concepts h5, .teaching-tips h5, .teaching-example h5 {
  color: #ffd700;
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
}

.teaching-concepts ul {
  margin: 0;
  padding-left: 1.5rem;
}

.teaching-concepts li {
  margin-bottom: 0.25rem;
}

.example {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.example-dice {
  font-weight: bold;
  color: #ffd700;
  margin-bottom: 0.5rem;
}

.example-move {
  margin-bottom: 0.5rem;
}

.teaching-settings {
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  gap: 1rem;
}

.setting-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.setting-group label {
  font-size: 0.9rem;
  opacity: 0.8;
}

.setting-group select {
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 5px;
  color: white;
}

.btn-teach {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #56ab2f 0%, #a8e063 100%);
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  font-weight: bold;
}

/* Game Controls */
.game-controls {
  padding: 1rem;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.control-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-new-game {
  background: linear-gradient(135deg, #56ab2f 0%, #a8e063 100%);
  color: white;
}

.btn-hint {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #333;
}

.btn-undo {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
  color: white;
}

.btn-easybot-move {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.game-status {
  text-align: center;
}

.status-message {
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  display: inline-block;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.practice-modal {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: #ffd700;
}

.btn-close {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  opacity: 0.7;
}

.btn-close:hover {
  opacity: 1;
}

.practice-content {
  padding: 1.5rem;
}

.practice-positions h4 {
  color: #ffd700;
  margin: 0 0 1rem 0;
}

.practice-position {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: background 0.3s ease;
}

.practice-position:hover {
  background: rgba(255, 255, 255, 0.2);
}

.position-name {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.position-difficulty, .position-focus {
  font-size: 0.9rem;
  opacity: 0.8;
}

/* Responsive */
@media (max-width: 1024px) {
  .interaction-section {
    grid-template-columns: 1fr;
  }
  
  .easybot-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .control-buttons {
    flex-wrap: wrap;
  }
}

@media (max-width: 768px) {
  .easybot-game {
    padding: 0.5rem;
  }
  
  .easybot-header {
    padding: 1rem;
  }
  
  .board-points {
    min-height: 150px;
  }
  
  .die {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }
  
  .bot-stats {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .info-item {
    font-size: 0.9rem;
  }
}
</style>
