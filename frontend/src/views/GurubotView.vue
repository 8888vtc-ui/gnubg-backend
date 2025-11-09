<template>
  <div class="gurubot-view">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">
            🤖 Meet <span class="highlight">GuruBot</span>
          </h1>
          <p class="hero-subtitle">
            Your Personal Backgammon Master - AI-Powered Coaching & Analysis
          </p>
          <div class="hero-features">
            <div class="feature">
              <span class="feature-icon">🧠</span>
              <span class="feature-text">World-Class Analysis</span>
            </div>
            <div class="feature">
              <span class="feature-icon">👨‍🏫</span>
              <span class="feature-text">Personalized Coaching</span>
            </div>
            <div class="feature">
              <span class="feature-icon">🎯</span>
              <span class="feature-text">Strategic Insights</span>
            </div>
          </div>
        </div>
        <div class="hero-visual">
          <div class="gurubot-animation">
            <div class="gurubot-circle">
              <span class="gurubot-emoji">🤖</span>
              <div class="thinking-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
            <div class="floating-elements">
              <div class="element dice">🎲</div>
              <div class="element cube">🎯</div>
              <div class="element board">🏁</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Section -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">{{ stats.playersHelped }}</div>
          <div class="stat-label">Players Helped</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ stats.questionsAnswered }}</div>
          <div class="stat-label">Questions Answered</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ stats.accuracy }}%</div>
          <div class="stat-label">Accuracy Rate</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ stats.responseTime }}s</div>
          <div class="stat-label">Avg Response Time</div>
        </div>
      </div>
    </div>

    <!-- Capabilities Section -->
    <div class="capabilities-section">
      <h2 class="section-title">🚀 GuruBot Capabilities</h2>
      <div class="capabilities-grid">
        <div class="capability-card">
          <div class="capability-icon">🧠</div>
          <h3>Position Analysis</h3>
          <p>Deep neural network analysis with equity calculations and move recommendations</p>
          <ul class="capability-list">
            <li>Real-time position evaluation</li>
            <li>Best move identification</li>
            <li>Equity and win probability</li>
            <li>Alternative move comparison</li>
          </ul>
        </div>
        
        <div class="capability-card">
          <div class="capability-icon">👨‍🏫</div>
          <h3>Personalized Coaching</h3>
          <p>Adaptive teaching style based on your skill level and learning preferences</p>
          <ul class="capability-list">
            <li>Skill assessment</li>
            <li>Custom learning paths</li>
            <li>Interactive exercises</li>
            <li>Progress tracking</li>
          </ul>
        </div>
        
        <div class="capability-card">
          <div class="capability-icon">🎯</div>
          <h3>Strategic Insights</h3>
          <p>Pattern recognition and strategic recommendations for all game phases</p>
          <ul class="capability-list">
            <li>Pattern detection</li>
            <li>Strategic planning</li>
            <li>Cube decisions</li>
            <li>Psychological factors</li>
          </ul>
        </div>
        
        <div class="capability-card">
          <div class="capability-icon">📊</div>
          <h3>Probability & Math</h3>
          <p>Advanced probability calculations and mathematical modeling</p>
          <ul class="capability-list">
            <li>Hit probabilities</li>
            <li>Race calculations</li>
            <li>Equity modeling</li>
            <li>Risk assessment</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Interactive Demo Section -->
    <div class="demo-section">
      <h2 class="section-title">🎮 Try GuruBot Now</h2>
      <div class="demo-container">
        <div class="demo-panel">
          <h3>💬 Ask GuruBot</h3>
          <div class="demo-chat">
            <div class="demo-message gurubot">
              <span class="demo-avatar">🤖</span>
              <div class="demo-content">
                <p>Hello! I'm GuruBot. Ask me anything about backgammon strategy!</p>
              </div>
            </div>
            <div class="demo-input-area">
              <input 
                v-model="demoQuestion"
                @keyup.enter="askDemoQuestion"
                type="text" 
                placeholder="Type your question here..."
                class="demo-input"
              />
              <button @click="askDemoQuestion" class="demo-btn">Ask</button>
            </div>
          </div>
          
          <div class="quick-questions-demo">
            <h4>Quick Questions:</h4>
            <div class="quick-grid">
              <button 
                v-for="question in demoQuickQuestions"
                :key="question"
                @click="askQuickDemoQuestion(question)"
                class="quick-demo-btn"
              >
                {{ question }}
              </button>
            </div>
          </div>
        </div>
        
        <div class="demo-panel">
          <h3>🎯 Position Analysis</h3>
          <div class="demo-board">
            <div class="mini-board">
              <div class="board-points">
                <div v-for="i in 24" :key="i" class="point" :class="getPointClass(i)"></div>
              </div>
              <div class="board-info">
                <div class="dice-display">
                  <span class="die">{{ demoDice[0] }}</span>
                  <span class="die">{{ demoDice[1] }}</span>
                </div>
                <button @click="rollDemoDice" class="roll-btn">🎲 Roll Dice</button>
                <button @click="analyzeDemoPosition" class="analyze-btn">🧠 Analyze</button>
              </div>
            </div>
          </div>
          
          <div v-if="demoAnalysis" class="demo-analysis">
            <h4>Analysis Results:</h4>
            <div class="analysis-result">
              <div class="result-item">
                <span class="label">Best Move:</span>
                <span class="value">{{ demoAnalysis.bestMove }}</span>
              </div>
              <div class="result-item">
                <span class="label">Equity:</span>
                <span class="value">{{ demoAnalysis.equity }}</span>
              </div>
              <div class="result-item">
                <span class="label">Win %:</span>
                <span class="value">{{ demoAnalysis.winPercent }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Testimonials Section -->
    <div class="testimonials-section">
      <h2 class="section-title">💬 What Players Say</h2>
      <div class="testimonials-grid">
        <div class="testimonial-card">
          <div class="testimonial-content">
            <p>"GuruBot transformed my game! The personalized coaching helped me reach 1800 ELO in just 3 months."</p>
          </div>
          <div class="testimonial-author">
            <div class="author-avatar">👤</div>
            <div class="author-info">
              <div class="author-name">Sarah M.</div>
              <div class="author-level">Advanced Player</div>
            </div>
          </div>
        </div>
        
        <div class="testimonial-card">
          <div class="testimonial-content">
            <p>"The position analysis is incredibly accurate. It's like having a world-class grandmaster as your coach."</p>
          </div>
          <div class="testimonial-author">
            <div class="author-avatar">👤</div>
            <div class="author-info">
              <div class="author-name">Mike R.</div>
              <div class="author-level">Tournament Player</div>
            </div>
          </div>
        </div>
        
        <div class="testimonial-card">
          <div class="testimonial-content">
            <p>"As a beginner, GuruBot's patience and clear explanations made learning backgammon enjoyable and effective."</p>
          </div>
          <div class="testimonial-author">
            <div class="author-avatar">👤</div>
            <div class="author-info">
              <div class="author-name">Lisa K.</div>
              <div class="author-level">Intermediate Player</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- CTA Section -->
    <div class="cta-section">
      <div class="cta-content">
        <h2 class="cta-title">🚀 Start Your Journey with GuruBot</h2>
        <p class="cta-subtitle">
          Join thousands of players improving their game with AI-powered coaching
        </p>
        <div class="cta-buttons">
          <router-link to="/gurubot-chat" class="cta-btn primary">
            💬 Start Chatting with GuruBot
          </router-link>
          <router-link to="/gnubg" class="cta-btn secondary">
            🎮 Play vs GNUBG + GuruBot
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'

// État
const demoQuestion = ref('')
const demoDice = ref([3, 5])
const demoAnalysis = ref(null)

// Stats
const stats = reactive({
  playersHelped: 2847,
  questionsAnswered: 15678,
  accuracy: 94.7,
  responseTime: 1.2
})

// Demo Questions
const demoQuickQuestions = [
  'Best opening move?',
  'When to double?',
  'How to build prime?',
  'Race strategy?',
  'Cube decisions?'
]

// Méthodes
const askDemoQuestion = async () => {
  if (!demoQuestion.value.trim()) return
  
  // Simuler réponse GuruBot
  console.log('Question:', demoQuestion.value)
  demoQuestion.value = ''
}

const askQuickDemoQuestion = (question) => {
  demoQuestion.value = question
  askDemoQuestion()
}

const rollDemoDice = () => {
  demoDice.value = [
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1
  ]
}

const analyzeDemoPosition = () => {
  // Simuler analyse
  const moves = ['8/5 6/5', '13/9 6/5', '24/20 13/9', '13/8 24/20']
  const bestMove = moves[Math.floor(Math.random() * moves.length)]
  
  demoAnalysis.value = {
    bestMove: bestMove,
    equity: (Math.random() * 0.4 - 0.1).toFixed(3),
    winPercent: (45 + Math.random() * 20).toFixed(1)
  }
}

const getPointClass = (index) => {
  // Simuler plateau avec quelques checkers
  if (index === 6) return 'white-2'
  if (index === 8) return 'white-3'
  if (index === 13) return 'black-2'
  if (index === 17) return 'black-1'
  return ''
}

// Lifecycle
onMounted(() => {
  // Animation des stats
  const animateValue = (element, start, end, duration) => {
    const range = end - start
    const increment = range / (duration / 16)
    let current = start
    
    const timer = setInterval(() => {
      current += increment
      if (current >= end) {
        current = end
        clearInterval(timer)
      }
      
      if (element === stats.accuracy) {
        stats[element] = current.toFixed(1)
      } else if (element === stats.responseTime) {
        stats[element] = current.toFixed(1)
      } else {
        stats[element] = Math.floor(current)
      }
    }, 16)
  }
  
  // Animer stats au chargement
  setTimeout(() => {
    animateValue('playersHelped', 0, 2847, 2000)
    animateValue('questionsAnswered', 0, 15678, 2000)
    animateValue('accuracy', 0, 94.7, 2000)
    animateValue('responseTime', 0, 1.2, 2000)
  }, 500)
})
</script>

<style scoped>
.gurubot-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: white;
}

/* Hero Section */
.hero-section {
  padding: 4rem 2rem;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 50%, rgba(118, 75, 162, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.hero-title {
  font-size: 4rem;
  margin: 0 0 1rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-title .highlight {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.5rem;
  margin: 0 0 2rem 0;
  opacity: 0.9;
}

.hero-features {
  display: flex;
  gap: 2rem;
  justify-content: center;
}

.feature {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 25px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.feature-icon {
  font-size: 1.2rem;
}

/* GuruBot Animation */
.gurubot-animation {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
}

.gurubot-circle {
  width: 150px;
  height: 150px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  position: relative;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

.thinking-dots {
  position: absolute;
  bottom: -10px;
  right: -10px;
  display: flex;
  gap: 3px;
}

.thinking-dots span {
  width: 8px;
  height: 8px;
  background: #ffd700;
  border-radius: 50%;
  animation: thinking 1.5s infinite;
}

.thinking-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.thinking-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes thinking {
  0%, 60%, 100% { transform: scale(1); opacity: 1; }
  30% { transform: scale(1.3); opacity: 0.7; }
}

.floating-elements {
  position: absolute;
  width: 100%;
  height: 100%;
}

.element {
  position: absolute;
  font-size: 2rem;
  animation: float-around 4s ease-in-out infinite;
}

.element.dice {
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.element.cube {
  top: 60%;
  right: 10%;
  animation-delay: 1s;
}

.element.board {
  bottom: 20%;
  left: 20%;
  animation-delay: 2s;
}

@keyframes float-around {
  0%, 100% { transform: translate(0px, 0px) rotate(0deg); }
  33% { transform: translate(10px, -10px) rotate(5deg); }
  66% { transform: translate(-10px, 5px) rotate(-5deg); }
}

/* Stats Section */
.stats-section {
  padding: 4rem 2rem;
  background: rgba(0, 0, 0, 0.3);
}

.stats-grid {
  max-width: 1000px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
}

.stat-card {
  text-align: center;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-number {
  font-size: 3rem;
  font-weight: bold;
  color: #ffd700;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1rem;
  opacity: 0.8;
}

/* Capabilities Section */
.capabilities-section {
  padding: 4rem 2rem;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  margin: 0 0 3rem 0;
  color: #ffd700;
}

.capabilities-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}

.capability-card {
  padding: 2rem;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: transform 0.3s ease;
}

.capability-card:hover {
  transform: translateY(-5px);
}

.capability-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.capability-card h3 {
  color: #ffd700;
  margin: 0 0 1rem 0;
}

.capability-card p {
  margin: 0 0 1.5rem 0;
  opacity: 0.9;
}

.capability-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.capability-list li {
  padding: 0.5rem 0;
  padding-left: 1.5rem;
  position: relative;
}

.capability-list li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #56ab2f;
  font-weight: bold;
}

/* Demo Section */
.demo-section {
  padding: 4rem 2rem;
  background: rgba(0, 0, 0, 0.3);
}

.demo-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.demo-panel {
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.demo-panel h3 {
  color: #ffd700;
  margin: 0 0 1.5rem 0;
}

.demo-chat {
  margin-bottom: 2rem;
}

.demo-message {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  margin-bottom: 1rem;
}

.demo-avatar {
  font-size: 2rem;
}

.demo-content p {
  margin: 0;
}

.demo-input-area {
  display: flex;
  gap: 0.5rem;
}

.demo-input {
  flex: 1;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
}

.demo-btn {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
}

.quick-questions-demo h4 {
  margin: 0 0 1rem 0;
  color: #ffd700;
}

.quick-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.quick-demo-btn {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.3s ease;
}

.quick-demo-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.mini-board {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.board-points {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 2px;
  margin-bottom: 1rem;
}

.point {
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  position: relative;
}

.point.white-2::after,
.point.white-3::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
}

.point.white-3::before {
  content: '';
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
}

.point.black-2::after,
.point.black-1::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  background: #333;
  border-radius: 50%;
}

.point.black-2::before {
  content: '';
  position: absolute;
  bottom: 20%;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 20px;
  background: #333;
  border-radius: 50%;
}

.board-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.dice-display {
  display: flex;
  gap: 0.5rem;
}

.die {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: white;
  color: #333;
  border-radius: 8px;
  font-weight: bold;
  font-size: 1.2rem;
}

.roll-btn, .analyze-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}

.roll-btn {
  background: linear-gradient(135deg, #56ab2f 0%, #a8e063 100%);
  color: white;
}

.analyze-btn {
  background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);
  color: white;
}

.demo-analysis {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

.demo-analysis h4 {
  margin: 0 0 1rem 0;
  color: #ffd700;
}

.analysis-result {
  display: grid;
  gap: 0.5rem;
}

.result-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 5px;
}

.result-item .label {
  opacity: 0.8;
}

.result-item .value {
  font-weight: bold;
  color: #ffd700;
}

/* Testimonials Section */
.testimonials-section {
  padding: 4rem 2rem;
}

.testimonials-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.testimonial-card {
  padding: 2rem;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.testimonial-content {
  margin-bottom: 1.5rem;
  font-style: italic;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.author-avatar {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.author-name {
  font-weight: bold;
  color: #ffd700;
}

.author-level {
  font-size: 0.9rem;
  opacity: 0.8;
}

/* CTA Section */
.cta-section {
  padding: 4rem 2rem;
  background: rgba(0, 0, 0, 0.3);
  text-align: center;
}

.cta-title {
  font-size: 2.5rem;
  margin: 0 0 1rem 0;
  color: #ffd700;
}

.cta-subtitle {
  font-size: 1.2rem;
  margin: 0 0 2rem 0;
  opacity: 0.9;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.cta-btn {
  display: inline-block;
  padding: 1rem 2rem;
  border-radius: 10px;
  text-decoration: none;
  font-weight: bold;
  transition: transform 0.3s ease;
}

.cta-btn:hover {
  transform: translateY(-2px);
}

.cta-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.cta-btn.secondary {
  background: linear-gradient(135deg, #56ab2f 0%, #a8e063 100%);
  color: white;
}

/* Responsive */
@media (max-width: 1024px) {
  .hero-content {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
  }
  
  .hero-features {
    justify-content: center;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .capabilities-grid,
  .demo-container {
    grid-template-columns: 1fr;
  }
  
  .testimonials-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.2rem;
  }
  
  .hero-features {
    flex-direction: column;
    gap: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }
}
</style>
