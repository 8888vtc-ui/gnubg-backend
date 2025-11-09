<template>
  <div class="gurubot-assistant">
    <!-- GuruBot Header -->
    <div class="gurubot-header">
      <div class="gurubot-avatar">
        <div class="avatar-circle">🤖</div>
        <div class="gurubot-status online"></div>
      </div>
      <div class="gurubot-info">
        <h2 class="gurubot-name">GuruBot</h2>
        <p class="gurubot-tagline">Your Personal Backgammon Master</p>
        <div class="gurubot-capabilities">
          <span class="capability">🧠 Analysis</span>
          <span class="capability">👨‍🏫 Coaching</span>
          <span class="capability">🎯 Strategy</span>
        </div>
      </div>
      <div class="gurubot-actions">
        <button @click="startCoaching" class="btn btn-coaching">
          🎓 Start Coaching
        </button>
        <button @click="askQuestion" class="btn btn-ask">
          💬 Ask Question
        </button>
      </div>
    </div>

    <!-- Main Interface -->
    <div class="gurubot-main">
      <!-- Chat Interface -->
      <div class="chat-section">
        <div class="chat-header">
          <h3>💬 Chat with GuruBot</h3>
          <div class="typing-indicator" v-if="isTyping">
            GuruBot is typing<span class="dots">...</span>
          </div>
        </div>
        
        <div class="chat-messages" ref="chatMessages">
          <div 
            v-for="message in messages" 
            :key="message.id"
            class="message"
            :class="{ 'user': message.sender === 'user', 'gurubot': message.sender === 'gurubot' }"
          >
            <div class="message-avatar">
              {{ message.sender === 'user' ? '👤' : '🤖' }}
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
              placeholder="Ask GuruBot anything about backgammon..."
              class="message-input"
              :disabled="isTyping"
            />
            <button 
              @click="sendMessage"
              class="btn-send"
              :disabled="!currentMessage.trim() || isTyping"
            >
              {{ isTyping ? '⏳' : '📤' }}
            </button>
          </div>
          
          <!-- Quick Questions -->
          <div class="quick-questions">
            <span class="quick-label">Quick questions:</span>
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

      <!-- Analysis Panel -->
      <div class="analysis-section">
        <div class="analysis-header">
          <h3>🧠 Position Analysis</h3>
          <button @click="analyzeCurrentPosition" class="btn btn-analyze">
            🎯 Analyze Position
          </button>
        </div>
        
        <div v-if="currentAnalysis" class="analysis-content">
          <div class="analysis-summary">
            <div class="summary-item">
              <span class="label">Best Move:</span>
              <span class="value">{{ currentAnalysis.best_move?.move || 'Loading...' }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Equity:</span>
              <span class="value equity" :class="getEquityClass(currentAnalysis.best_move?.equity)">
                {{ currentAnalysis.best_move?.equity?.toFixed(3) || '0.000' }}
              </span>
            </div>
            <div class="summary-item">
              <span class="label">Win Probability:</span>
              <span class="value">{{ ((currentAnalysis.probability_analysis?.win || 0) * 100).toFixed(1) }}%</span>
            </div>
          </div>
          
          <!-- Teaching Comments -->
          <div v-if="currentAnalysis.teaching_comments" class="teaching-comments">
            <h4>📚 GuruBot Teaching:</h4>
            <div 
              v-for="comment in currentAnalysis.teaching_comments"
              :key="comment.type"
              class="teaching-comment"
            >
              <span class="comment-icon">{{ comment.icon }}</span>
              <span class="comment-text">{{ comment.message }}</span>
            </div>
          </div>
          
          <!-- Pattern Recognition -->
          <div v-if="currentAnalysis.guruBot_insights?.pattern_recognition" class="pattern-insights">
            <h4>🔍 Pattern Recognition:</h4>
            <div 
              v-for="pattern in currentAnalysis.guruBot_insights.pattern_recognition"
              :key="pattern.name"
              class="pattern-item"
            >
              <div class="pattern-name">{{ pattern.name }}</div>
              <div class="pattern-description">{{ pattern.description }}</div>
              <div class="pattern-advice">{{ pattern.advice }}</div>
            </div>
          </div>
        </div>
        
        <!-- Analysis Settings -->
        <div class="analysis-settings">
          <div class="setting-group">
            <label>Player Level:</label>
            <select v-model="analysisSettings.playerLevel" @change="updateAnalysisSettings">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>
          <div class="setting-group">
            <label>Analysis Depth:</label>
            <select v-model="analysisSettings.depth" @change="updateAnalysisSettings">
              <option value="basic">Basic</option>
              <option value="detailed">Detailed</option>
              <option value="comprehensive">Comprehensive</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Coaching Modal -->
    <div v-if="showCoachingModal" class="modal-overlay" @click="closeCoachingModal">
      <div class="coaching-modal" @click.stop>
        <div class="modal-header">
          <h3>🎓 GuruBot Coaching Session</h3>
          <button @click="closeCoachingModal" class="btn-close">✖️</button>
        </div>
        
        <div class="coaching-content">
          <div class="player-profile">
            <h4>Your Profile:</h4>
            <div class="profile-form">
              <div class="form-group">
                <label>Name:</label>
                <input v-model="playerProfile.name" type="text" placeholder="Your name" />
              </div>
              <div class="form-group">
                <label>Skill Level:</label>
                <select v-model="playerProfile.level">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              <div class="form-group">
                <label>Learning Style:</label>
                <select v-model="playerProfile.learningStyle">
                  <option value="visual">Visual</option>
                  <option value="analytical">Analytical</option>
                  <option value="practical">Practical</option>
                </select>
              </div>
              <div class="form-group">
                <label>Focus Areas:</label>
                <div class="checkbox-group">
                  <label v-for="area in focusAreas" :key="area.value">
                    <input 
                      type="checkbox" 
                      v-model="playerProfile.focusAreas" 
                      :value="area.value"
                    />
                    {{ area.label }}
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div class="coaching-actions">
            <button @click="startPersonalCoaching" class="btn btn-start-coaching">
              🚀 Start Personal Coaching
            </button>
            <button @click="closeCoachingModal" class="btn btn-cancel">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Question Modal -->
    <div v-if="showQuestionModal" class="modal-overlay" @click="closeQuestionModal">
      <div class="question-modal" @click.stop>
        <div class="modal-header">
          <h3>💬 Ask GuruBot</h3>
          <button @click="closeQuestionModal" class="btn-close">✖️</button>
        </div>
        
        <div class="question-content">
          <div class="question-categories">
            <h4>Choose a topic:</h4>
            <div class="category-grid">
              <button 
                v-for="category in questionCategories"
                :key="category.value"
                @click="selectQuestionCategory(category)"
                class="category-btn"
                :class="{ active: selectedCategory === category.value }"
              >
                <span class="category-icon">{{ category.icon }}</span>
                <span class="category-label">{{ category.label }}</span>
              </button>
            </div>
          </div>
          
          <div class="question-input-area">
            <textarea 
              v-model="questionText"
              placeholder="Type your question here..."
              class="question-textarea"
              rows="4"
            ></textarea>
            
            <div class="question-actions">
              <button @click="submitQuestion" class="btn btn-submit-question">
                🤖 Ask GuruBot
              </button>
              <button @click="closeQuestionModal" class="btn btn-cancel">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'

// État
const messages = ref([
  {
    id: 1,
    sender: 'gurubot',
    text: 'Hello! I\'m GuruBot, your personal backgammon master. I can help you with strategy, analyze positions, and provide personalized coaching. How can I assist you today?',
    timestamp: new Date()
  }
])

const currentMessage = ref('')
const isTyping = ref(false)
const currentAnalysis = ref(null)

// Modals
const showCoachingModal = ref(false)
const showQuestionModal = ref(false)

// Settings
const analysisSettings = reactive({
  playerLevel: 'intermediate',
  depth: 'detailed'
})

// Player Profile
const playerProfile = reactive({
  name: '',
  level: 'intermediate',
  learningStyle: 'visual',
  focusAreas: []
})

// Question Modal
const selectedCategory = ref('')
const questionText = ref('')

// Quick Questions
const quickQuestions = [
  'What\'s the best opening move?',
  'When should I double?',
  'How do I build a prime?',
  'Race vs contact strategy?',
  'Cube take/drop decisions?'
]

// Focus Areas
const focusAreas = [
  { value: 'opening_theory', label: 'Opening Theory' },
  { value: 'middle_game', label: 'Middle Game Strategy' },
  { value: 'cube_strategy', label: 'Cube Decisions' },
  { value: 'endgame', label: 'Endgame Technique' },
  { value: 'probability', label: 'Probability & Math' },
  { value: 'psychology', label: 'Psychological Aspects' }
]

// Question Categories
const questionCategories = [
  { value: 'opening', label: 'Opening Moves', icon: '🎯' },
  { value: 'strategy', label: 'Strategy', icon: '🧠' },
  { value: 'cube', label: 'Cube Decisions', icon: '🎲' },
  { value: 'probability', label: 'Probability', icon: '📊' },
  { value: 'advanced', label: 'Advanced Play', icon: '⚡' },
  { value: 'general', label: 'General', icon: '💡' }
]

// Refs
const chatMessages = ref(null)

// Méthodes
const sendMessage = async () => {
  if (!currentMessage.value.trim() || isTyping.value) return
  
  // Add user message
  const userMessage = {
    id: Date.now(),
    sender: 'user',
    text: currentMessage.value,
    timestamp: new Date()
  }
  
  messages.value.push(userMessage)
  const question = currentMessage.value
  currentMessage.value = ''
  
  // Scroll to bottom
  await nextTick()
  scrollToBottom()
  
  // Show typing indicator
  isTyping.value = true
  
  // Get GuruBot response
  try {
    const response = await fetch('https://gammon-guru-backend.railway.app/api/gurubot/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        question: question,
        player_level: analysisSettings.playerLevel,
        language: 'en'
      })
    })
    
    const data = await response.json()
    
    if (data.success) {
      const gurubotMessage = {
        id: Date.now() + 1,
        sender: 'gurubot',
        text: data.answer.text,
        timestamp: new Date()
      }
      
      messages.value.push(gurubotMessage)
    } else {
      throw new Error(data.error)
    }
  } catch (error) {
    const errorMessage = {
      id: Date.now() + 1,
      sender: 'gurubot',
      text: 'I\'m having trouble connecting right now. Let me try to help you directly! What specific aspect of backgammon would you like to know about?',
      timestamp: new Date()
    }
    
    messages.value.push(errorMessage)
  }
  
  isTyping.value = false
  
  // Scroll to bottom
  await nextTick()
  scrollToBottom()
}

const askQuickQuestion = async (question) => {
  currentMessage.value = question
  await sendMessage()
}

const analyzeCurrentPosition = async () => {
  try {
    const response = await fetch('https://gammon-guru-backend.railway.app/api/gurubot/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        position_id: '4HPwATDgc/ABMA',
        dice: [3, 5],
        player_level: analysisSettings.playerLevel,
        analysis_type: analysisSettings.depth
      })
    })
    
    const data = await response.json()
    
    if (data.success) {
      currentAnalysis.value = data.guruBot_analysis
      
      // Add analysis message to chat
      const analysisMessage = {
        id: Date.now(),
        sender: 'gurubot',
        text: `I've analyzed the position! The best move is ${data.guruBot_analysis.analysis.best_move.move} with equity ${data.guruBot_analysis.analysis.best_move.equity.toFixed(3)}. Check the analysis panel for detailed insights!`,
        timestamp: new Date()
      }
      
      messages.value.push(analysisMessage)
      
      await nextTick()
      scrollToBottom()
    }
  } catch (error) {
    console.error('Analysis error:', error)
  }
}

const startCoaching = () => {
  showCoachingModal.value = true
}

const closeCoachingModal = () => {
  showCoachingModal.value = false
}

const startPersonalCoaching = async () => {
  try {
    const response = await fetch('https://gammon-guru-backend.railway.app/api/gurubot/coach', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        player_profile: playerProfile
      })
    })
    
    const data = await response.json()
    
    if (data.success) {
      // Add coaching message
      const coachingMessage = {
        id: Date.now(),
        sender: 'gurubot',
        text: data.guruBot.welcome_message,
        timestamp: new Date()
      }
      
      messages.value.push(coachingMessage)
      closeCoachingModal()
      
      await nextTick()
      scrollToBottom()
    }
  } catch (error) {
    console.error('Coaching error:', error)
  }
}

const askQuestion = () => {
  showQuestionModal.value = true
}

const closeQuestionModal = () => {
  showQuestionModal.value = false
  selectedCategory.value = ''
  questionText.value = ''
}

const selectQuestionCategory = (category) => {
  selectedCategory.value = category.value
  questionText.value = `I have a question about ${category.label.toLowerCase()}: `
}

const submitQuestion = async () => {
  if (!questionText.value.trim()) return
  
  currentMessage.value = questionText.value
  closeQuestionModal()
  await sendMessage()
}

const updateAnalysisSettings = () => {
  // Settings updated, could trigger re-analysis
  console.log('Analysis settings updated:', analysisSettings)
}

const formatTime = (date) => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const getEquityClass = (equity) => {
  if (!equity) return ''
  if (equity > 0.2) return 'positive'
  if (equity < -0.2) return 'negative'
  return 'neutral'
}

const scrollToBottom = () => {
  if (chatMessages.value) {
    chatMessages.value.scrollTop = chatMessages.value.scrollHeight
  }
}

// Lifecycle
onMounted(() => {
  scrollToBottom()
})
</script>

<style scoped>
.gurubot-assistant {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: white;
}

.gurubot-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.gurubot-avatar {
  position: relative;
}

.avatar-circle {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
}

.gurubot-status {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 3px solid #1a1a2e;
}

.gurubot-status.online {
  background: #56ab2f;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.gurubot-info h2 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.gurubot-tagline {
  margin: 0 0 1rem 0;
  opacity: 0.8;
}

.gurubot-capabilities {
  display: flex;
  gap: 1rem;
}

.capability {
  padding: 0.25rem 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  font-size: 0.9rem;
}

.gurubot-actions {
  margin-left: auto;
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-coaching {
  background: linear-gradient(135deg, #56ab2f 0%, #a8e063 100%);
  color: white;
}

.btn-ask {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.gurubot-main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  padding: 2rem;
  flex: 1;
  overflow: hidden;
}

.chat-section {
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.chat-header {
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.message.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message.gurubot {
  align-self: flex-start;
}

.message-avatar {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.message-content {
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 10px;
  flex: 1;
}

.message.user .message-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.message-time {
  font-size: 0.8rem;
  opacity: 0.7;
  margin-top: 0.5rem;
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
  transition: all 0.3s ease;
}

.quick-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.analysis-section {
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.analysis-header {
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-analyze {
  background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);
  color: white;
}

.analysis-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.analysis-summary {
  display: grid;
  gap: 1rem;
  margin-bottom: 2rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 5px;
}

.equity.positive {
  color: #56ab2f;
}

.equity.negative {
  color: #ff416c;
}

.equity.neutral {
  color: #ffd700;
}

.teaching-comments, .pattern-insights {
  margin-bottom: 1.5rem;
}

.teaching-comments h4, .pattern-insights h4 {
  color: #ffd700;
  margin: 0 0 1rem 0;
}

.teaching-comment {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.comment-icon {
  font-size: 1.2rem;
}

.pattern-item {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  margin-bottom: 1rem;
}

.pattern-name {
  font-weight: bold;
  color: #ffd700;
  margin-bottom: 0.5rem;
}

.pattern-description {
  margin-bottom: 0.5rem;
  opacity: 0.9;
}

.pattern-advice {
  font-style: italic;
  opacity: 0.8;
}

.analysis-settings {
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

/* Modal Styles */
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

.coaching-modal, .question-modal {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  padding: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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

.coaching-content, .question-content {
  padding: 2rem;
}

.player-profile h4 {
  color: #ffd700;
  margin: 0 0 1rem 0;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.9rem;
  opacity: 0.8;
}

.form-group input, .form-group select {
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
}

.checkbox-group {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.coaching-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-start-coaching {
  background: linear-gradient(135deg, #56ab2f 0%, #a8e063 100%);
  color: white;
}

.btn-cancel {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.question-categories h4 {
  color: #ffd700;
  margin: 0 0 1rem 0;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.category-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.category-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
}

.category-icon {
  font-size: 1.5rem;
}

.question-textarea {
  width: 100%;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  resize: vertical;
  margin-bottom: 1rem;
}

.question-textarea::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.question-actions {
  display: flex;
  gap: 1rem;
}

.btn-submit-question {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

@media (max-width: 1024px) {
  .gurubot-main {
    grid-template-columns: 1fr;
  }
  
  .gurubot-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .gurubot-actions {
    margin-left: 0;
  }
}

@media (max-width: 768px) {
  .gurubot-assistant {
    padding: 1rem;
  }
  
  .gurubot-header {
    padding: 1rem;
  }
  
  .gurubot-main {
    padding: 1rem;
    gap: 1rem;
  }
  
  .category-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .checkbox-group {
    grid-template-columns: 1fr;
  }
}
</style>
