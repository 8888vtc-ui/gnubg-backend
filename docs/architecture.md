# 🏗️ GammonGuru Architecture

> **Technical architecture and system design**

---

## 📐 High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Vue 3 PWA  │  │ React Native │  │   Desktop    │      │
│  │   (Web/Mobile)│  │   (iOS/Android)│  │   (Future)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                    REST API + WebSocket
                            │
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND LAYER                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Node.js + TypeScript + Express             │   │
│  │                                                       │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │   │
│  │  │   Routes    │  │  Services   │  │ Middleware  │ │   │
│  │  │             │  │             │  │             │ │   │
│  │  │ • gnubg.ts  │  │ • gnubg     │  │ • auth      │ │   │
│  │  │ • analysis  │  │ • aiAnalyzer│  │ • quota     │ │   │
│  │  │ • game      │  │ • quota     │  │ • rateLimit │ │   │
│  │  │ • user      │  │ • session   │  │ • validation│ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘ │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌───────▼────────┐  ┌──────▼───────┐
│  GNUBG Engine  │  │   Claude API   │  │  PostgreSQL  │
│  (CLI/Native)  │  │   (OpenAI)     │  │    (Neon)    │
└────────────────┘  └────────────────┘  └──────────────┘
```

---

## 🧩 Component Architecture

### **Frontend (Vue 3 PWA)**

```typescript
src/
├── components/
│   ├── Board.vue              // Backgammon board display
│   ├── Dice.vue               // Dice animation
│   ├── Replay.vue             // Post-game replay
│   ├── Analysis.vue           // Error analysis display
│   ├── Quiz.vue               // Interactive quizzes
│   ├── Profile.vue            // User profile & stats
│   ├── Leaderboard.vue        // Rankings
│   └── BuyPoints.vue          // Point purchase
├── stores/
│   ├── gameStore.ts           // Game state (Pinia)
│   ├── userStore.ts           // User data & auth
│   ├── replayStore.ts         // Replay navigation
│   └── preferencesStore.ts    // UI preferences
├── composables/
│   ├── useWebSocket.ts        // WebSocket connection
│   ├── useGame.ts             // Game logic
│   └── useQuota.ts            // Quota management
├── services/
│   ├── api.ts                 // REST API client
│   ├── auth.ts                // Authentication
│   └── analytics.ts           // Google Analytics
└── router/
    └── index.ts               // Vue Router config
```

### **Backend (Node.js + TypeScript)**

```typescript
src/
├── cli/
│   ├── gnubgRunner.ts         // GNUBG CLI interface
│   └── commandBuilder.ts      // Command construction
├── services/
│   ├── aiAnalyzer.ts          // AI integration (Claude/GPT)
│   ├── quotaManager.ts        // Freemium quota tracking
│   ├── errorDatabase.ts       // Static error cache
│   ├── sessionManager.ts      // Game session handling
│   ├── fingerprint.ts         // Device fingerprinting
│   └── stripe.ts              // Payment processing
├── routes/
│   ├── gnubg.ts               // GNUBG endpoints
│   ├── analysis.ts            // Analysis endpoints
│   ├── game.ts                // Game management
│   ├── quiz.ts                // Quiz endpoints
│   ├── user.ts                // User management
│   └── payment.ts             // Stripe webhooks
├── middleware/
│   ├── auth.ts                // JWT authentication
│   ├── rateLimit.ts           // Rate limiting
│   ├── validation.ts          // Request validation (Zod)
│   └── errorHandler.ts        // Global error handling
├── models/
│   ├── User.ts                // User model
│   ├── Game.ts                // Game model
│   ├── Analysis.ts            // Analysis model
│   └── Transaction.ts         // Payment model
├── utils/
│   ├── parser.ts              // GNUBG output parser
│   ├── converter.ts           // JSON ↔ Position ID
│   ├── logger.ts              // Pino logger
│   └── cache.ts               // Redis cache
└── server.ts                  // Express app entry point
```

---

## 🔄 Data Flow

### **1. Move Validation Flow**

```
User plays move
      │
      ▼
Frontend validates basic rules
      │
      ▼
POST /api/validate-move
      │
      ▼
Backend: gnubgRunner.executeCommand()
      │
      ▼
GNUBG CLI: analyse move
      │
      ▼
Parse output (equity, PR, alternatives)
      │
      ▼
Return JSON response
      │
      ▼
Frontend displays results
```

### **2. Error Analysis Flow**

```
Error detected (equity loss > threshold)
      │
      ▼
Check errorDatabase.ts (cached explanation?)
      │
      ├─ YES → Return cached explanation
      │
      └─ NO → Check user quota
               │
               ├─ Quota OK → Call Claude API
               │             │
               │             ▼
               │        Generate explanation
               │             │
               │             ▼
               │        Cache in database
               │             │
               │             ▼
               │        Decrement quota
               │             │
               │             ▼
               └────────→ Return explanation
```

### **3. Multiplayer Game Flow (WebSocket)**

```
Player A: Search for game
      │
      ▼
Matchmaking queue
      │
      ▼
Player B: Search for game
      │
      ▼
Match found (stake = min(A.stake, B.stake))
      │
      ▼
Create game session (Redis + DB)
      │
      ▼
WebSocket: /ws/game/:id
      │
      ├─ Player A plays move
      │       │
      │       ▼
      │  Validate with GNUBG
      │       │
      │       ▼
      │  Broadcast to Player B
      │       │
      │       ▼
      │  Player B plays move
      │       │
      │       └─ (loop)
      │
      ▼
Game ends
      │
      ▼
Calculate winner
      │
      ▼
Transfer points (winner +160, loser -200, house +40)
      │
      ▼
Save game to DB
      │
      ▼
Trigger post-game analysis
```

---

## 🗄️ Database Schema

### **PostgreSQL (Neon)**

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  device_fingerprint VARCHAR(255),
  points INTEGER DEFAULT 500,
  is_premium BOOLEAN DEFAULT false,
  ai_quota_used INTEGER DEFAULT 0,
  ai_quota_reset_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Games
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  opponent_type VARCHAR(20), -- 'gnubg' | 'human'
  opponent_id UUID REFERENCES users(id),
  game_type VARCHAR(20), -- 'match' | 'money_game'
  match_length INTEGER,
  stake INTEGER,
  winner_id UUID,
  moves JSONB, -- Array of moves with board states
  final_score JSONB,
  pr_player FLOAT,
  pr_opponent FLOAT,
  error_count INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP
);

-- Analyses
CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id),
  move_number INTEGER,
  board_state TEXT,
  played_move TEXT,
  best_move TEXT,
  equity_loss FLOAT,
  explanation JSONB, -- {situation, mistake, correctPlay, reasoning, difficulty}
  cached BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  type VARCHAR(20), -- 'subscription' | 'purchase' | 'game_win' | 'game_loss'
  amount INTEGER,
  balance_after INTEGER,
  stripe_payment_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Achievements
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100),
  description TEXT,
  type VARCHAR(50), -- 'games_played' | 'pr_threshold' | 'quiz_completed'
  threshold INTEGER,
  reward_points INTEGER,
  reward_cosmetic VARCHAR(100)
);

-- User Achievements
CREATE TABLE user_achievements (
  user_id UUID REFERENCES users(id),
  achievement_id UUID REFERENCES achievements(id),
  unlocked_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, achievement_id)
);

-- Quiz
CREATE TABLE quiz_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_state TEXT,
  dice VARCHAR(10),
  best_move TEXT,
  equity FLOAT,
  difficulty VARCHAR(20), -- 'beginner' | 'intermediate' | 'advanced' | 'expert'
  category VARCHAR(50), -- 'running_game' | 'blitz' | 'holding_game' | 'cube_decision'
  explanation JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔌 API Endpoints

### **Authentication**
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### **Game Management**
- `POST /api/game/start` - Start new game
- `POST /api/game/:id/move` - Play a move
- `POST /api/game/:id/resign` - Resign game
- `GET /api/game/:id` - Get game state
- `GET /api/game/history` - Get user's game history

### **GNUBG Integration**
- `POST /api/gnubg/validate-move` - Validate a move
- `POST /api/gnubg/play-move` - GNUBG plays its move
- `POST /api/gnubg/analyze-position` - Analyze a position

### **Analysis**
- `POST /api/analysis/error` - Analyze an error
- `GET /api/analysis/game/:id` - Get full game analysis
- `GET /api/analysis/replay/:id` - Get replay data

### **Quiz**
- `GET /api/quiz/random` - Get random quiz
- `GET /api/quiz/personalized` - Get personalized quiz
- `POST /api/quiz/:id/answer` - Submit quiz answer

### **User**
- `GET /api/user/profile` - Get profile
- `PUT /api/user/profile` - Update profile
- `GET /api/user/stats` - Get statistics
- `GET /api/user/quota` - Get AI quota remaining
- `GET /api/user/export` - Export user data (RGPD)
- `DELETE /api/user/account` - Delete account

### **Payment**
- `POST /api/payment/create-checkout` - Create Stripe checkout
- `POST /api/payment/purchase-points` - Buy points
- `POST /api/payment/webhook` - Stripe webhook
- `GET /api/payment/history` - Payment history

### **Multiplayer (WebSocket)**
- `WS /ws/game/:id` - Game session WebSocket

---

## 🚀 Deployment Architecture

### **Phase 1: MVP**

```
┌──────────────┐
│   Vercel     │  ← Vue 3 PWA (frontend)
└──────────────┘
        │
        │ REST API
        ▼
┌──────────────┐
│   Railway    │  ← Node.js backend + GNUBG CLI
└──────────────┘
        │
        ├─────→ Neon (PostgreSQL)
        ├─────→ Claude API
        └─────→ Stripe API
```

### **Phase 2: Microservices**

```
┌──────────────┐
│   Vercel     │  ← Frontend
└──────────────┘
        │
        ▼
┌──────────────────────────────────────┐
│         API Gateway (Railway)        │
└──────────────────────────────────────┘
        │
        ├─────→ GNUBG Engine Service
        ├─────→ Analysis Service (AI)
        ├─────→ Game Session Service
        ├─────→ User Service
        └─────→ Payment Service
                    │
                    ├─→ PostgreSQL (Neon)
                    ├─→ Redis (Upstash)
                    ├─→ Claude API
                    └─→ Stripe API
```

---

## 🔐 Security Architecture

### **Authentication**
- JWT tokens (access + refresh)
- HttpOnly cookies
- CORS configured
- Rate limiting per IP/user

### **Data Protection**
- Passwords: bcrypt (salt rounds: 12)
- Sensitive data: AES-256 encryption
- TLS/HTTPS everywhere
- Device fingerprinting (hashed)

### **Anti-Fraud**
- IP tracking
- Device fingerprinting
- Move validation server-side
- Transaction atomicity
- Audit logs

---

## 📊 Monitoring & Observability

### **Logs**
- Pino (structured JSON logs)
- Log levels: error, warn, info, debug
- Transports: Console, Sentry

### **Metrics**
- API response times
- GNUBG execution times
- AI API latency
- Active game sessions
- Error rates by endpoint

### **Alerts**
- Sentry for errors
- UptimeRobot for downtime
- Discord webhook for critical issues

---

## 🔄 Scalability Considerations

### **Horizontal Scaling**
- Stateless backend (sessions in Redis)
- Load balancer (Railway built-in)
- Database connection pooling

### **Caching Strategy**
- ERROR_DATABASE in memory
- Redis for sessions
- CDN for static assets (Vercel)

### **Performance Optimization**
- GNUBG process pooling
- AI response caching
- Database indexes on frequently queried fields
- Lazy loading in frontend

---

## 🧪 Testing Strategy

### **Unit Tests**
- GNUBG runner functions
- Parsers and converters
- Business logic (quota, points)

### **Integration Tests**
- API endpoints
- GNUBG integration
- AI integration

### **E2E Tests**
- User flows (Playwright)
- Payment flows
- Multiplayer scenarios

---

<div align="center">

**Architecture designed for simplicity, scalability, and maintainability**

</div>
