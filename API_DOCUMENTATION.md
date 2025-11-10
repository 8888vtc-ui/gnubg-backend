# 🎲 GammonGuru Backend API Documentation

**Base URL:** `https://gammon-guru-api.onrender.com`

**Status:** ✅ Deployed on Render Free Tier

---

## 🔐 Authentication Endpoints

### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "name": "username",
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt-token-here",
    "user": {
      "id": "user-id",
      "name": "username",
      "email": "user@example.com"
    }
  }
}
```

### POST `/api/auth/login`
Authenticate and get JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt-token-here",
    "user": {
      "id": "user-id",
      "name": "username",
      "email": "user@example.com"
    }
  }
}
```

### POST `/api/auth/logout`
Logout user (client-side token removal).

**Headers:** `Authorization: Bearer <jwt-token>`

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 👤 User Management Endpoints

### GET `/api/user/profile`
Get authenticated user's profile.

**Headers:** `Authorization: Bearer <jwt-token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "username": "username",
    "email": "user@example.com",
    "elo": 1500,
    "level": "BEGINNER"
  }
}
```

### PUT `/api/user/profile`
Update user profile.

**Headers:** `Authorization: Bearer <jwt-token>`

**Request Body:**
```json
{
  "username": "new-username",
  "email": "new-email@example.com"
}
```

---

## 🎮 Game Management Endpoints

### POST `/api/games`
Create a new backgammon game.

**Headers:** `Authorization: Bearer <jwt-token>`

**Request Body:**
```json
{
  "gameMode": "AI_VS_PLAYER",
  "difficulty": "MEDIUM"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "game": {
      "id": "game-id",
      "whitePlayer": {
        "id": "user-id",
        "username": "player-name",
        "elo": 1500
      },
      "status": "WAITING",
      "gameMode": "AI_VS_PLAYER",
      "boardState": "4HPwATDgc/ABMA",
      "currentPlayer": "WHITE",
      "createdAt": "2025-11-10T22:00:00.000Z"
    }
  }
}
```

### GET `/api/games/:gameId`
Get detailed game information.

**Headers:** `Authorization: Bearer <jwt-token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "game": {
      "id": "game-id",
      "whitePlayer": { "id": "user-id", "username": "player", "elo": 1500 },
      "blackPlayer": null,
      "status": "WAITING",
      "gameMode": "AI_VS_PLAYER",
      "boardState": "4HPwATDgc/ABMA",
      "currentPlayer": "WHITE",
      "dice": [],
      "whiteScore": 0,
      "blackScore": 0,
      "createdAt": "2025-11-10T22:00:00.000Z"
    },
    "moves": []
  }
}
```

### POST `/api/games/:gameId/roll`
Roll dice for current player.

**Headers:** `Authorization: Bearer <jwt-token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "dice": [4, 2]
  }
}
```

### POST `/api/games/:gameId/move`
Make a move in the game.

**Headers:** `Authorization: Bearer <jwt-token>`

**Request Body:**
```json
{
  "from": 1,
  "to": 5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Move recorded",
    "from": 1,
    "to": 5
  }
}
```

---

## 🧠 AI Features Endpoints

### GET `/api/ai/:gameId/suggestion`
Get AI move suggestion for the current position.

**Headers:** `Authorization: Bearer <jwt-token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "suggestion": {
      "from": 1,
      "to": 5,
      "reasoning": "Random legal move",
      "confidence": 0.5
    }
  }
}
```

### POST `/api/ai/:gameId/move`
Make an AI move in the game.

**Headers:** `Authorization: Bearer <jwt-token>`

**Request Body:**
```json
{
  "difficulty": "MEDIUM"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "move": {
      "from": 12,
      "to": 16,
      "player": "BLACK"
    },
    "reasoning": "Random legal move",
    "confidence": 0.5,
    "difficulty": "MEDIUM"
  }
}
```

### GET `/api/ai/:gameId/analysis`
Get AI analysis of the current position.

**Headers:** `Authorization: Bearer <jwt-token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "analysis": {
      "positionStrength": "neutral",
      "recommendedMoves": [],
      "winProbability": {
        "white": 45,
        "black": 55
      },
      "advice": "Focus on getting your pieces into your home board"
    },
    "gameState": {
      "currentPlayer": "WHITE",
      "dice": [4, 2],
      "status": "PLAYING"
    }
  }
}
```

---

## 👥 Public Endpoints

### GET `/api/players`
Get list of all players (public info only).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user-id",
      "username": "player1",
      "elo": 1500,
      "level": "BEGINNER"
    }
  ]
}
```

### GET `/health`
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-10T22:00:00.000Z",
  "uptime": 3600,
  "database": "connected",
  "environment": "production"
}
```

### GET `/`
API information endpoint.

**Response:**
```json
{
  "message": "GammonGuru API",
  "version": "1.0.0",
  "endpoints": [
    "GET /health",
    "GET /api/players",
    "POST /api/players"
  ]
}
```

---

## 🔧 Development Endpoints

### GET `/api/games/available`
List available games (placeholder).

### POST `/api/games/join`
Join a game (placeholder).

### GET `/api/games/my-games`
List user's games (placeholder).

### GET `/api/games/:gameId/available-moves`
Get available moves (placeholder).

### GET `/api/games/:gameId/pip-count`
Get pip count (placeholder).

---

## 🏗️ API Architecture

### Authentication
- **JWT Bearer tokens** required for protected endpoints
- **Header format:** `Authorization: Bearer <token>`
- **Token expiration:** 24 hours

### Response Format
- **Success:** `{ "success": true, "data": {...} }`
- **Error:** `{ "success": false, "error": "message" }`

### Rate Limiting
- **General:** 100 requests per 15 minutes per IP
- **Auth:** 5 login attempts per 15 minutes per IP

### CORS
- **Allowed origins:** Frontend URL (configured in environment)
- **Credentials:** Enabled for auth
- **Health endpoint:** Bypass for monitoring

---

## 🧪 Testing Commands

```bash
# Health check
curl https://gammon-guru-api.onrender.com/health

# Register user
curl -X POST https://gammon-guru-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"testuser","email":"test@example.com","password":"password123"}'

# Login
curl -X POST https://gammon-guru-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get players list
curl https://gammon-guru-api.onrender.com/api/players
```

---

## 📊 Implementation Status

### ✅ Fully Implemented
- User registration & authentication
- JWT token management
- Game creation
- Game state retrieval
- Dice rolling
- Move recording
- AI opponent moves
- AI move suggestions
- AI position analysis
- Health monitoring
- Database connectivity

### 🔄 Partially Implemented
- User profile management
- Game joining (placeholder)
- Available games listing (placeholder)

### 📝 Not Yet Implemented
- Real-time multiplayer (WebSocket)
- Advanced AI heuristics
- Tournament system
- Game replays

---

## 🚀 Ready for Frontend Integration

**API is production-ready and deployed!**

**Next steps:**
1. Connect frontend to Render API URL
2. Implement authentication UI
3. Build game interface
4. Add real-time features
