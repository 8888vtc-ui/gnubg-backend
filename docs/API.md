# 🔌 GammonGuru API Documentation

> **REST API Reference - Version 1.0**

**Base URL**: `https://api.gammonguru.com` (production) or `http://localhost:3000` (development)

---

## 📋 Table of Contents

- [Authentication](#authentication)
- [Game Management](#game-management)
- [GNUBG Integration](#gnubg-integration)
- [Analysis](#analysis)
- [Quiz](#quiz)
- [User Management](#user-management)
- [Payment](#payment)
- [WebSocket (Multiplayer)](#websocket-multiplayer)
- [Error Codes](#error-codes)

---

## 🔐 Authentication

All authenticated endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

### POST `/api/auth/register`

Create a new user account.

**Request:**
```json
{
  "email": "player@example.com",
  "password": "SecurePassword123!"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "player@example.com",
    "points": 500,
    "isPremium": false,
    "aiQuotaRemaining": 5
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST `/api/auth/login`

Authenticate an existing user.

**Request:**
```json
{
  "email": "player@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "player@example.com",
    "points": 1250,
    "isPremium": true,
    "aiQuotaRemaining": "unlimited"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST `/api/auth/logout`

Invalidate the current session.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

### GET `/api/auth/me`

Get current authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": "uuid",
  "email": "player@example.com",
  "points": 1250,
  "isPremium": true,
  "aiQuotaRemaining": "unlimited",
  "createdAt": "2025-01-15T10:30:00Z"
}
```

---

## 🎮 Game Management

### POST `/api/game/start`

Start a new game against GNUBG or find a multiplayer match.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "gameType": "match",        // 'match' | 'money_game'
  "matchLength": 5,           // For match type (3, 5, 7, 11, 15)
  "opponentType": "gnubg",    // 'gnubg' | 'human'
  "stake": 200                // Points to wager (min 200)
}
```

**Response (201):**
```json
{
  "gameId": "uuid",
  "gameType": "match",
  "matchLength": 5,
  "opponentType": "gnubg",
  "stake": 200,
  "boardState": {
    "points": [2, 0, 0, 0, 0, -5, 0, -3, 0, 0, 0, 5, -5, 0, 0, 0, 3, 0, 5, 0, 0, 0, 0, -2],
    "bar": [0, 0],
    "off": [0, 0],
    "turn": "player",
    "cube": 1,
    "cubeOwner": null,
    "score": [0, 0]
  },
  "dice": [3, 5]
}
```

### POST `/api/game/:id/move`

Play a move in an active game.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "move": "8/5 6/5",
  "dice": [3, 1]
}
```

**Response (200):**
```json
{
  "valid": true,
  "boardState": { /* updated board */ },
  "opponentMove": "13/10 6/3",  // If vs GNUBG
  "opponentDice": [3, 3],
  "newBoardState": { /* after opponent */ }
}
```

### POST `/api/game/:id/resign`

Resign from the current game.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Game resigned",
  "pointsLost": 200,
  "newBalance": 1050
}
```

### GET `/api/game/:id`

Get the current state of a game.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "gameId": "uuid",
  "gameType": "match",
  "matchLength": 5,
  "score": [2, 1],
  "boardState": { /* current position */ },
  "turn": "player",
  "dice": [4, 2],
  "moveHistory": [
    { "move": "8/4 6/4", "dice": [4, 2], "player": "user" },
    { "move": "24/20 13/11", "dice": [4, 2], "player": "gnubg" }
  ]
}
```

### GET `/api/game/history`

Get user's game history.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `limit` (optional): Number of games (default: 20)
- `offset` (optional): Pagination offset (default: 0)

**Response (200):**
```json
{
  "games": [
    {
      "id": "uuid",
      "gameType": "match",
      "matchLength": 5,
      "opponentType": "gnubg",
      "result": "win",
      "finalScore": [5, 3],
      "stake": 200,
      "pointsWon": 160,
      "pr": 4.2,
      "errorCount": 3,
      "playedAt": "2025-01-15T14:30:00Z"
    }
  ],
  "total": 47,
  "limit": 20,
  "offset": 0
}
```

---

## 🎲 GNUBG Integration

### POST `/api/gnubg/validate-move`

Validate a move using GNUBG.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "boardState": "4HPwATDgc/ABMA:cIkKAQAAAAAAA",  // Position ID or JSON
  "move": "8/5 6/5",
  "dice": [3, 1]
}
```

**Response (200):**
```json
{
  "isValid": true,
  "equity": -0.234,
  "pr": 0.045,
  "bestMove": "8/5 6/5",
  "alternatives": [
    {
      "move": "13/10 6/5",
      "equity": -0.289,
      "equityLoss": 0.055,
      "rank": 2
    },
    {
      "move": "24/21 6/5",
      "equity": -0.312,
      "equityLoss": 0.078,
      "rank": 3
    }
  ]
}
```

### POST `/api/gnubg/play-move`

Request GNUBG to play its move.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "boardState": "4HPwATDgc/ABMA:cIkKAQAAAAAAA",
  "dice": [4, 2]
}
```

**Response (200):**
```json
{
  "move": "13/9 6/4",
  "equity": 0.187,
  "newBoardState": "..."
}
```

### POST `/api/gnubg/analyze-position`

Analyze a specific position.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "boardState": "4HPwATDgc/ABMA:cIkKAQAAAAAAA",
  "dice": [3, 1]
}
```

**Response (200):**
```json
{
  "topMoves": [
    { "move": "8/5 6/5", "equity": -0.234, "rank": 1 },
    { "move": "13/10 6/5", "equity": -0.289, "rank": 2 },
    { "move": "24/21 6/5", "equity": -0.312, "rank": 3 }
  ],
  "cubeAction": "no_double",
  "pipCount": [167, 152]
}
```

---

## 🧠 Analysis

### POST `/api/analysis/error`

Analyze an error and get AI explanation.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "boardState": "4HPwATDgc/ABMA:cIkKAQAAAAAAA",
  "playedMove": "8/5 6/5",
  "bestMove": "13/10 6/5",
  "equityLoss": 0.055,
  "gameContext": {
    "gameType": "match",
    "score": [2, 1],
    "matchLength": 5
  }
}
```

**Response (200):**
```json
{
  "explanation": {
    "situation": "Running game with pip count advantage",
    "mistake": "You broke your advanced anchor too early",
    "correctPlay": "Maintain pressure by keeping the 8-point",
    "reasoning": "In a running game with a lead, each advanced point you hold forces your opponent to play more pips to pass you. Breaking the 8-point reduces this pressure.",
    "difficulty": "intermediate"
  },
  "quotaRemaining": 4,
  "cached": false
}
```

**Response (403) - Quota Exceeded:**
```json
{
  "error": "AI quota exceeded",
  "quotaRemaining": 0,
  "message": "Upgrade to premium for unlimited AI analyses",
  "upgradeUrl": "/pricing"
}
```

### GET `/api/analysis/game/:id`

Get full post-game analysis.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "gameId": "uuid",
  "overallPR": 4.2,
  "errorCount": 3,
  "errors": [
    {
      "moveNumber": 12,
      "playedMove": "8/5 6/5",
      "bestMove": "13/10 6/5",
      "equityLoss": 0.055,
      "explanation": { /* AI explanation */ }
    }
  ],
  "equityGraph": [
    { "move": 1, "equity": 0.0 },
    { "move": 2, "equity": 0.05 },
    { "move": 12, "equity": -0.055 }
  ]
}
```

### GET `/api/analysis/replay/:id`

Get replay data for a game.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "gameId": "uuid",
  "moves": [
    {
      "moveNumber": 1,
      "player": "user",
      "dice": [3, 1],
      "move": "8/5 6/5",
      "boardState": "...",
      "equity": -0.234,
      "isError": false
    },
    {
      "moveNumber": 12,
      "player": "user",
      "dice": [3, 1],
      "move": "8/5 6/5",
      "boardState": "...",
      "equity": -0.289,
      "isError": true,
      "equityLoss": 0.055
    }
  ]
}
```

---

## 🎯 Quiz

### GET `/api/quiz/random`

Get a random quiz position.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `difficulty` (optional): 'beginner' | 'intermediate' | 'advanced' | 'expert'
- `category` (optional): 'running_game' | 'blitz' | 'holding_game' | 'cube_decision'

**Response (200):**
```json
{
  "quizId": "uuid",
  "boardState": "...",
  "dice": [3, 1],
  "question": "What is the best move?",
  "difficulty": "intermediate",
  "category": "running_game"
}
```

### GET `/api/quiz/personalized`

Get a personalized quiz based on user's weaknesses.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "quizId": "uuid",
  "boardState": "...",
  "dice": [4, 2],
  "question": "What is the best move?",
  "difficulty": "intermediate",
  "category": "running_game",
  "reason": "You frequently make errors in running game positions"
}
```

### POST `/api/quiz/:id/answer`

Submit an answer to a quiz.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "answer": "13/9 6/4"
}
```

**Response (200):**
```json
{
  "correct": false,
  "yourMove": "13/9 6/4",
  "bestMove": "13/11 13/9",
  "equityLoss": 0.032,
  "explanation": {
    "situation": "...",
    "mistake": "...",
    "correctPlay": "...",
    "reasoning": "..."
  }
}
```

---

## 👤 User Management

### GET `/api/user/profile`

Get user profile.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": "uuid",
  "email": "player@example.com",
  "points": 1250,
  "isPremium": true,
  "stats": {
    "gamesPlayed": 47,
    "winRate": 0.58,
    "averagePR": 4.2,
    "totalErrors": 142
  },
  "createdAt": "2025-01-01T00:00:00Z"
}
```

### PUT `/api/user/profile`

Update user profile.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "displayName": "BackgammonPro",
  "preferences": {
    "theme": "dark",
    "notation": "position",
    "showTimer": true
  }
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully"
}
```

### GET `/api/user/stats`

Get detailed user statistics.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "overall": {
    "gamesPlayed": 47,
    "winRate": 0.58,
    "averagePR": 4.2,
    "totalErrors": 142
  },
  "byGameType": {
    "match": { "played": 30, "winRate": 0.60 },
    "money_game": { "played": 17, "winRate": 0.55 }
  },
  "byOpponent": {
    "gnubg": { "played": 35, "winRate": 0.54 },
    "human": { "played": 12, "winRate": 0.67 }
  },
  "errorsByType": {
    "running_game": 45,
    "blitz": 23,
    "holding_game": 38,
    "cube_decision": 36
  }
}
```

### GET `/api/user/quota`

Get AI quota remaining.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "remaining": 3,
  "total": 5,
  "isPremium": false,
  "resetDate": "2025-02-01T00:00:00Z"
}
```

### GET `/api/user/export`

Export all user data (RGPD compliance).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "user": { /* user data */ },
  "games": [ /* all games */ ],
  "analyses": [ /* all analyses */ ],
  "transactions": [ /* all transactions */ ],
  "exportedAt": "2025-01-15T10:30:00Z"
}
```

### DELETE `/api/user/account`

Delete user account (soft delete + purge after 30 days).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Account scheduled for deletion",
  "deletionDate": "2025-02-14T10:30:00Z"
}
```

---

## 💳 Payment

### POST `/api/payment/create-checkout`

Create a Stripe checkout session for subscription.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "plan": "premium_monthly",  // 'premium_monthly' | 'lifetime'
  "successUrl": "https://app.gammonguru.com/success",
  "cancelUrl": "https://app.gammonguru.com/pricing"
}
```

**Response (200):**
```json
{
  "checkoutUrl": "https://checkout.stripe.com/pay/cs_test_...",
  "sessionId": "cs_test_..."
}
```

### POST `/api/payment/purchase-points`

Purchase additional points.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "package": "medium",  // 'small' (500pts, 5€) | 'medium' (1200pts, 10€) | 'large' (2600pts, 20€)
  "successUrl": "https://app.gammonguru.com/success",
  "cancelUrl": "https://app.gammonguru.com/points"
}
```

**Response (200):**
```json
{
  "checkoutUrl": "https://checkout.stripe.com/pay/cs_test_...",
  "sessionId": "cs_test_..."
}
```

### POST `/api/payment/webhook`

Stripe webhook endpoint (internal use).

**Headers:** `Stripe-Signature: <signature>`

**Request:** Stripe event payload

**Response (200):**
```json
{
  "received": true
}
```

### GET `/api/payment/history`

Get payment history.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "transactions": [
    {
      "id": "uuid",
      "type": "subscription",
      "amount": 9,
      "currency": "EUR",
      "status": "succeeded",
      "createdAt": "2025-01-15T10:30:00Z"
    },
    {
      "id": "uuid",
      "type": "purchase",
      "amount": 10,
      "currency": "EUR",
      "pointsAdded": 1200,
      "status": "succeeded",
      "createdAt": "2025-01-10T14:20:00Z"
    }
  ]
}
```

---

## 🌐 WebSocket (Multiplayer)

### Connection

```javascript
const ws = new WebSocket('wss://api.gammonguru.com/ws/game/:gameId?token=<jwt>');
```

### Events

#### Client → Server

**`play_move`**
```json
{
  "type": "play_move",
  "move": "8/5 6/5",
  "dice": [3, 1]
}
```

**`chat_message`**
```json
{
  "type": "chat_message",
  "message": "Good game!"
}
```

**`resign`**
```json
{
  "type": "resign"
}
```

#### Server → Client

**`game_state`**
```json
{
  "type": "game_state",
  "boardState": { /* current position */ },
  "turn": "opponent",
  "dice": [4, 2]
}
```

**`opponent_move`**
```json
{
  "type": "opponent_move",
  "move": "13/9 6/4",
  "newBoardState": { /* updated position */ }
}
```

**`game_end`**
```json
{
  "type": "game_end",
  "winner": "player",
  "pointsWon": 160,
  "newBalance": 1410
}
```

**`chat_message`**
```json
{
  "type": "chat_message",
  "from": "opponent",
  "message": "Good game!"
}
```

---

## ⚠️ Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Quota exceeded or insufficient points |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Game already in progress |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - GNUBG or server error |
| 503 | Service Unavailable - AI API unavailable |

### Error Response Format

```json
{
  "error": "Error type",
  "message": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": { /* optional additional info */ }
}
```

---

## 📊 Rate Limits

| Endpoint | Limit |
|----------|-------|
| `/api/auth/*` | 10 requests/minute |
| `/api/gnubg/*` | 30 requests/minute |
| `/api/analysis/error` | 10 requests/minute (free) / unlimited (premium) |
| `/api/game/*` | 60 requests/minute |
| All other endpoints | 100 requests/minute |

---

<div align="center">

**API Version 1.0 - Last updated: 2025-01-15**

</div>
