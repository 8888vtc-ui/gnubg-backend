# 🌐 Roadmap ZERO ERROR - 100% Cloud & Online

> **Zéro installation locale - tout se fait dans le navigateur et le cloud**

---

## 🎯 **PHILOSOPHIE CLOUD-FIRST**

### **Principes fondamentaux**
- **Zéro setup local** : Pas d'installation PostgreSQL/GNUBG
- **Tout dans le navigateur** : Développement et utilisation
- **Services cloud managés** : Base de données, hébergement, API
- **Déploiement continu** : Chaque commit → production
- **Accès mondial** : Travaillez depuis n'importe où

---

## 🏗️ **ARCHITECTURE 100% CLOUD**

### **Frontend Development (GitHub Codespaces)**
```
GitHub Codespaces (VS Code online)
├── Développement Vue.js dans le navigateur
├── Terminal Linux intégré
├── Preview live dans le navigateur
├── Git intégré avec push automatique
└── Zéro installation requise
```

### **Backend Services (Serverless Cloud)**
```
Netlify Functions (Serverless)
├── API endpoints sans serveur
├── Base de données PostgreSQL managée
├── GNUBG CLI dans container Docker
├── Authentification JWT serverless
└── Scaling automatique inclus
```

### **Base de Données (Cloud Managé)**
```
Supabase PostgreSQL (Alternative: PlanetScale)
├── Base de données PostgreSQL managée
├── Interface web pour les requêtes
├── Migrations automatiques via Prisma
├── Backup automatique quotidien
└── Scaling automatique inclus
```

### **GNUBG (Container Cloud)**
```
Docker Container (Railway/Render)
├── GNUBG CLI pré-installé
├── API REST pour les analyses
├── Scaling automatique
├── Monitoring inclus
└── Zéro maintenance
```

---

## 📋 **ROADMAP ZERO ERROR CLOUD - 25 JOURS**

### **🔥 SEMAINE 1 : INFRASTRUCTURE CLOUD (Jour 17-21)**

#### **Jour 17 : GitHub Codespaces + Supabase (4-5 heures)**

```bash
# MATIN (2h) : Configuration GitHub Codespaces
1. Ouvrir le dépôt GitHub
2. Cliquer "Code" → "Codespaces" → "Create codespace"
3. VS Code s'ouvre DANS le navigateur
4. Terminal Linux déjà configuré avec Node.js 20
5. Extension Vue.js, Prisma, Git déjà installées

# .devcontainer/configuration.json (créé automatiquement)
{
  "name": "GammonGuru Development",
  "dockerFile": "Dockerfile",
  "customizations": {
    "vscode": {
      "extensions": [
        "vue.volar",
        "prisma.prisma",
        "bradlc.vscode-tailwindcss",
        "ms-vscode.vscode-typescript-next"
      ]
    }
  },
  "forwardPorts": [3000, 5432]
}

# APRÈS-MIDI (2h) : Configuration Supabase
1. Aller sur https://supabase.com
2. "Start your project" → New project
3. Configuration :
   - Database name: gammon_guru_db
   - Region: East US (ou Europe)
   - Password: généré automatiquement
4. Récupérer DATABASE_URL
5. Configurer Prisma avec Supabase

# .env (dans GitHub Codespaces)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
JWT_SECRET="[GENERATED_SECRET]"
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[ANON_KEY]"

# SOIR (1h) : Test Base de Données Cloud
- [ ] npx prisma db push (connecte à Supabase)
- [ ] npx prisma studio (ouvre dans le navigateur)
- [ ] Créer 3 utilisateurs de test
- [ ] Valider CRUD depuis VS Code

# VALIDATION : Infrastructure cloud 100% fonctionnelle
# RÉSULTAT : Travaillez depuis n'importe quel navigateur
```

#### **Jour 18 : Netlify Functions + API Cloud (5-6 heures)**

```bash
# MATIN (3h) : Configuration Netlify Functions
1. Compte Netlify (gratuit)
2. Connecter le dépôt GitHub
3. Activer "Functions" dans les settings
4. Structure des fonctions :

netlify/functions/
├── auth/
│   ├── login.js
│   ├── register.js
│   └── refresh.js
├── game/
│   ├── create.js
│   ├── move.js
│   └── status.js
├── gnubg/
│   ├── analyze.js
│   ├── hint.js
│   └── evaluate.js
└── user/
    ├── profile.js
    └── stats.js

# netlify/functions/auth/login.js
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async (event, context) => {
  try {
    const { email, password } = JSON.parse(event.body);
    
    // Recherche utilisateur dans Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !user) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid credentials' })
      };
    }
    
    // Validation mot de passe
    const bcrypt = require('bcrypt');
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid credentials' })
      };
    }
    
    // Génération token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data: { token, user: { id: user.id, email: user.email, username: user.username } }
      })
    };
    
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

# APRÈS-MIDI (2h) : Configuration Supabase Schema
# SQL exécuté directement dans l'interface Supabase

CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  avatar TEXT,
  level VARCHAR(20) DEFAULT 'BEGINNER',
  elo INTEGER DEFAULT 1500,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  white_player UUID REFERENCES users(id),
  black_player UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'PLAYING',
  board_state TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  finished_at TIMESTAMP
);

CREATE TABLE game_moves (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID REFERENCES games(id),
  player VARCHAR(10) NOT NULL,
  dice INTEGER[] NOT NULL,
  move TEXT NOT NULL,
  equity FLOAT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  board_state TEXT NOT NULL,
  dice INTEGER[] NOT NULL,
  move TEXT NOT NULL,
  best_move TEXT NOT NULL,
  equity FLOAT NOT NULL,
  pr FLOAT NOT NULL,
  explanation TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

# SOIR (1h) : Test API Cloud
- [ ] Déployer functions sur Netlify
- [ ] Tester POST /api/auth/login
- [ ] Tester POST /api/auth/register  
- [ ] Valider connexion Supabase

# VALIDATION : API cloud 100% fonctionnelle
# RÉSULTAT : Backend serverless opérationnel
```

#### **Jour 19 : GNUBG Cloud Container (6-8 heures)**

```bash
# MATIN (4h) : Configuration Railway avec GNUBG
1. Compte Railway (https://railway.app)
2. New Project → "Deploy from Dockerfile"
3. Créer Dockerfile avec GNUBG inclus

# Dockerfile
FROM node:18-alpine

# Installation GNUBG
RUN apk add --no-cache \
    gcc \
    musl-dev \
    wget \
    tar

WORKDIR /app

# Télécharger et compiler GNUBG
RUN wget https://ftp.gnu.org/gnu/gnubg/gnubg-1.06.002.tar.gz \
    && tar -xzf gnubg-1.06.002.tar.gz \
    && cd gnubg-1.06.002 \
    && ./configure \
    && make \
    && make install \
    && cd .. \
    && rm -rf gnubg-1.06.002.tar.gz gnubg-1.06.002

# Installation dépendances Node.js
COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Exposer API
EXPOSE 3000

CMD ["npm", "start"]

# railway.toml
[build]
builder = "NIXPACKS"

[deploy]
healthcheckPath = "/health"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

# APRÈS-MIDI (3h) : API GNUBG Serverless
# netlify/functions/gnubg/analyze.js
const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  try {
    const { boardState, dice, move } = JSON.parse(event.body);
    
    // Appel au service GNUBG sur Railway
    const response = await fetch(`${process.env.GNUBG_SERVICE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GNUBG_API_KEY}`
      },
      body: JSON.stringify({
        board: boardState,
        dice: dice,
        move: move
      })
    });
    
    const analysis = await response.json();
    
    // Sauvegarder l'analyse dans Supabase
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
    
    await supabase.from('analyses').insert({
      user_id: context.clientContext.user.sub,
      board_state: boardState,
      dice: dice,
      move: move,
      best_move: analysis.bestMove,
      equity: analysis.equity,
      pr: analysis.pr,
      explanation: analysis.explanation
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data: analysis
      })
    };
    
  } catch (error) {
    console.error('GNUBG analysis error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

# SOIR (1h) : Test GNUBG Cloud
- [ ] Déployer service GNUBG sur Railway
- [ ] Tester analyse depuis Netlify Functions
- [ ] Valider temps réponse <5 secondes
- [ ] Logger les erreurs dans Supabase

# VALIDATION : GNUBG cloud 100% fonctionnel
# RÉSULTAT : Analyse backgammon sans installation locale
```

#### **Jour 20 : Frontend Cloud Development (5-6 heures)**

```bash
# MATIN (3h) : Développement dans GitHub Codespaces
# Travaillez depuis n'importe quel ordinateur avec navigateur

1. Ouvrir GitHub Codespaces
2. VS Code dans le navigateur avec le projet
3. Terminal Linux intégré
4. Preview live du frontend

# frontend/src/views/GameView.vue (développé dans Codespaces)
<template>
  <div class="game-view">
    <GameBoard @move-made="onMoveMade" />
    <DiceRoller @dice-rolled="onDiceRolled" />
    
    <!-- Analyse depuis API cloud -->
    <AnalysisTooltip v-if="currentAnalysis" 
                     :analysis="currentAnalysis" />
    
    <!-- Mode multijoueur cloud -->
    <div v-if="multiplayerMode" class="multiplayer-info">
      <p>🌐 Partie en ligne avec {{ opponent.username }}</p>
      <WebsocketConnection :game-id="currentGameId" />
    </div>
  </div>
</template>

<script setup lang="ts">
// API cloud calls
import api from '@/services/api';

const currentAnalysis = ref(null);

async function onMoveMade(move: {from: number, to: number}) {
  try {
    // Appel API cloud Netlify Functions
    const response = await api.post('/gnubg/analyze', {
      boardState: gameStore.board,
      dice: gameStore.dice,
      move: `${move.from}/${move.to}`
    });
    
    currentAnalysis.value = response.data.data;
    
  } catch (error) {
    console.error('Cloud analysis failed:', error);
  }
}
</script>

# APRÈS-MIDI (2h) : Configuration API Cloud
# frontend/src/services/api.ts (connecté aux services cloud)

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
                    'https://gammon-guru.netlify.app/api';

const api = {
  async post(endpoint: string, data: any) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    
    return response.json();
  },
  
  // Authentification cloud
  async login(email: string, password: string) {
    return this.post('/auth/login', { email, password });
  },
  
  async register(userData: any) {
    return this.post('/auth/register', userData);
  },
  
  // Jeu cloud
  async createGame(opponentId?: string) {
    return this.post('/game/create', { opponentId });
  },
  
  async makeMove(gameId: string, move: any) {
    return this.post(`/game/${gameId}/move`, move);
  },
  
  // Analyse GNUBG cloud
  async analyzeMove(boardState: string, dice: number[], move: string) {
    return this.post('/gnubg/analyze', { boardState, dice, move });
  }
};

export default api;

# SOIR (1h) : Preview Cloud
- [ ] Preview dans Codespaces : https://preview-xxx.github.dev
- [ ] Test connexion API cloud
- [ ] Valider analyse GNUBG fonctionnelle
- [ ] Push vers GitHub → déploiement automatique

# VALIDATION : Frontend cloud 100% connecté
# RÉSULTAT : Développement entièrement dans le navigateur
```

#### **Jour 21 : Multijoueur Cloud WebSocket (4-5 heures)**

```bash
# MATIN (3h) : WebSocket Netlify Functions
# netlify/functions/websocket/game.js

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// WebSocket connection pour le jeu en temps réel
exports.handler = async (event, context) => {
  const { action, gameId, userId, move } = JSON.parse(event.body);
  
  switch (action) {
    case 'join-game':
      return await joinGame(gameId, userId);
    
    case 'make-move':
      return await makeGameMove(gameId, userId, move);
    
    case 'get-game-state':
      return await getGameState(gameId);
    
    default:
      return { statusCode: 400, body: 'Invalid action' };
  }
};

async function joinGame(gameId, userId) {
  // Ajouter joueur à la partie
  await supabase
    .from('game_players')
    .insert({ game_id: gameId, user_id: userId, joined_at: new Date() });
  
  // Notifier autres joueurs
  await broadcastToGame(gameId, {
    type: 'player-joined',
    userId: userId
  });
  
  return { statusCode: 200, body: 'Joined game' };
}

async function makeGameMove(gameId, userId, move) {
  // Sauvegarder le mouvement
  await supabase
    .from('game_moves')
    .insert({
      game_id: gameId,
      user_id: userId,
      move: move.move,
      dice: move.dice,
      created_at: new Date()
    });
  
  // Mettre à jour l'état du jeu
  await updateGameState(gameId, move);
  
  // Notifier l'adversaire
  await broadcastToGame(gameId, {
    type: 'move-made',
    userId: userId,
    move: move
  });
  
  return { statusCode: 200, body: 'Move recorded' };
}

# APRÈS-MIDI (2h) : Frontend WebSocket
# frontend/src/components/WebsocketGame.vue

<template>
  <div class="websocket-game">
    <div class="connection-status" :class="{ connected: isConnected }">
      {{ isConnected ? '🟢 Connecté' : '🔴 Connexion...' }}
    </div>
    
    <GameBoard @move-made="onMoveMade" />
    
    <!-- Messages temps réel -->
    <div class="game-messages">
      <div v-for="message in messages" :key="message.id" class="message">
        {{ message.text }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const isConnected = ref(false);
const messages = ref([]);
const websocket = ref<WebSocket | null>(null);

function connectWebSocket(gameId: string) {
  websocket.value = new WebSocket(
    `wss://gammon-guru.netlify.app/.netlify/functions/websocket`
  );
  
  websocket.value.onopen = () => {
    isConnected.value = true;
    
    // Rejoindre la partie
    websocket.value.send(JSON.stringify({
      action: 'join-game',
      gameId: gameId,
      userId: currentUserId.value
    }));
  };
  
  websocket.value.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    switch (data.type) {
      case 'player-joined':
        messages.value.push({
          id: Date.now(),
          text: `Un adversaire a rejoint la partie!`
        });
        break;
        
      case 'move-made':
        messages.value.push({
          id: Date.now(),
          text: `L'adversaire a joué: ${data.move.move}`
        });
        updateGameBoard(data.move);
        break;
        
      case 'game-over':
        messages.value.push({
          id: Date.now(),
          text: `Partie terminée! ${data.winner} a gagné!`
        });
        break;
    }
  };
  
  websocket.value.onclose = () => {
    isConnected.value = false;
    // Tentative de reconnexion automatique
    setTimeout(() => connectWebSocket(gameId), 5000);
  };
}

async function onMoveMade(move: any) {
  if (websocket.value && isConnected.value) {
    websocket.value.send(JSON.stringify({
      action: 'make-move',
      gameId: currentGameId.value,
      userId: currentUserId.value,
      move: move
    }));
  }
}
</script>

# SOIR (1h) : Test Multijoueur Cloud
- [ ] Ouvrir deux onglets navigateur
- [ ] Connecter deux joueurs différents
- [ ] Tester communication temps réel
- [ ] Valider synchronisation des mouvements

# VALIDATION : Multijoueur cloud 100% fonctionnel
# RÉSULTAT : Jeu en temps réel sans installation
```

---

### **🎮 SEMAINE 2 : JEU COMPLET CLOUD (Jour 22-26)**

#### **Jour 22 : Plateau Interactif Cloud (6-8 heures)**

```bash
# MATIN (4h) : GameBoard Component Cloud
# Développé entièrement dans GitHub Codespaces

# frontend/src/components/GameBoard.vue
<template>
  <div class="game-board" :class="{ 'multiplayer': isMultiplayer }">
    <!-- 24 points du plateau -->
    <div class="board-container">
      <div v-for="pointIndex in 24" :key="pointIndex" 
           class="point"
           :class="getPointClass(pointIndex)"
           @click="onPointClick(pointIndex)"
           @drop="onDrop($event, pointIndex)"
           @dragover.prevent>
        
        <!-- Pions sur le point -->
        <div v-for="checkerIndex in getCheckersOnPoint(pointIndex)" 
             :key="`${pointIndex}-${checkerIndex}`"
             class="checker"
             :class="getCheckerClass(pointIndex, checkerIndex)"
             draggable="true"
             @dragstart="onDragStart($event, pointIndex, checkerIndex)"
             @dragend="onDragEnd">
          
          <!-- Numéro du pion pour debug -->
          <span v-if="showDebug" class="checker-number">
            {{ getCheckerNumber(pointIndex, checkerIndex) }}
          </span>
        </div>
      </div>
    </div>
    
    <!-- Zone bar (pions frappés) -->
    <div class="bar-area" 
         @drop="onBarDrop" 
         @dragover.prevent>
      <h4>Bar</h4>
      <div v-for="checker in barCheckers" :key="checker.id" 
           class="checker bar-checker"
           draggable="true">
        {{ checker.player }}
      </div>
    </div>
    
    <!-- Zone off (pions sortis) -->
    <div class="off-area" 
         @drop="onOffDrop" 
         @dragover.prevent>
      <h4>Off</h4>
      <div class="off-checkers">
        <div>Blanc: {{ whiteOffCount }}/15</div>
        <div>Noir: {{ blackOffCount }}/15</div>
      </div>
    </div>
    
    <!-- Overlay pour le tour actuel -->
    <div v-if="showTurnOverlay" class="turn-overlay">
      <h3>Tour: {{ currentPlayer === 'white' ? '⚪ Blanc' : '⚫ Noir' }}</h3>
      <p v-if="currentDice.length > 0">
        Dés: {{ currentDice.join(', ') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useGameStore } from '@/stores/gameStore';

// Props et emits
interface Props {
  isMultiplayer?: boolean;
  showDebug?: boolean;
}

interface Emits {
  (e: 'move-made', move: { from: number; to: number; player: string }): void;
  (e: 'turn-ended', player: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  isMultiplayer: false,
  showDebug: false
});

const emit = defineEmits<Emits>();

// Store du jeu
const gameStore = useGameStore();

// État local du composant
const selectedPoint = ref<number | null>(null);
const validMoves = ref<number[]>([]);
const isDragging = ref(false);

// État computed depuis le store
const currentPlayer = computed(() => gameStore.currentPlayer);
const currentDice = computed(() => gameStore.dice);
const board = computed(() => gameStore.board);
const whiteOffCount = computed(() => gameStore.whiteOff);
const blackOffCount = computed(() => gameStore.blackOff);
const barCheckers = computed(() => gameStore.barCheckers);

// Classes CSS dynamiques pour les points
function getPointClass(pointIndex: number): string {
  const classes = [`point-${pointIndex}`];
  
  // Couleur du point (triangles alternés)
  if (pointIndex <= 11) {
    classes.push(pointIndex % 2 === 0 ? 'dark-triangle' : 'light-triangle');
  } else {
    classes.push(pointIndex % 2 === 0 ? 'light-triangle' : 'dark-triangle');
  }
  
  // Mouvements valides
  if (validMoves.value.includes(pointIndex)) {
    classes.push('valid-move');
  }
  
  // Point sélectionné
  if (selectedPoint.value === pointIndex) {
    classes.push('selected');
  }
  
  return classes.join(' ');
}

// Classes CSS pour les pions
function getCheckerClass(pointIndex: number, checkerIndex: number): string {
  const checker = board.value.points[pointIndex];
  const player = checker > 0 ? 'white' : 'black';
  
  const classes = [`checker-${player}`];
  
  // Pion le plus haut (draggable)
  if (Math.abs(checkerIndex) === Math.abs(checker)) {
    classes.push('draggable');
  }
  
  // Animation si c'est le dernier mouvement
  if (isLastMove(pointIndex, checkerIndex)) {
    classes.push('last-move');
  }
  
  return classes.join(' ');
}

// Logique de clic sur un point
function onPointClick(pointIndex: number) {
  if (selectedPoint.value === null) {
    // Sélectionner un point avec des pions
    if (hasPlayerCheckers(pointIndex)) {
      selectPoint(pointIndex);
    }
  } else {
    // Tenter de déplacer vers ce point
    if (validMoves.value.includes(pointIndex)) {
      makeMove(selectedPoint.value, pointIndex);
    } else {
      // Désélectionner
      selectedPoint.value = null;
      validMoves.value = [];
    }
  }
}

// Sélectionner un point et calculer mouvements valides
function selectPoint(pointIndex: number) {
  selectedPoint.value = pointIndex;
  validMoves.value = calculateValidMoves(pointIndex);
}

// Calculer les mouvements valides depuis un point
function calculateValidMoves(from: number): number[] {
  const moves: number[] = [];
  const player = currentPlayer.value;
  const direction = player === 'white' ? 1 : -1;
  
  for (const die of currentDice.value) {
    const to = from + (die * direction);
    
    if (isValidMove(from, to)) {
      moves.push(to);
    }
  }
  
  // Bearing off (sortir les pions)
  if (canBearOff(player)) {
    const bearingOffMoves = calculateBearingOffMoves(from);
    moves.push(...bearingOffMoves);
  }
  
  return [...new Set(moves)]; // Éviter les doublons
}

// Validation complète des règles backgammon
function isValidMove(from: number, to: number): boolean {
  const player = currentPlayer.value;
  const direction = player === 'white' ? 1 : -1;
  
  // 1. Direction correcte
  if ((to - from) * direction <= 0) return false;
  
  // 2. Dans les limites du plateau
  if (to < 0 || to > 23) return false;
  
  // 3. Distance correspond à un dé disponible
  const moveDistance = Math.abs(to - from);
  if (!currentDice.value.includes(moveDistance)) return false;
  
  // 4. Destination valide (pas trop de pions adverses)
  const destinationCheckers = board.value.points[to];
  if (player === 'white' && destinationCheckers < -1) return false;
  if (player === 'black' && destinationCheckers > 1) return false;
  
  // 5. Pas de pions bloquant le chemin
  if (hasBlockingCheckers(from, to, direction)) return false;
  
  // 6. Pions sur le bar doivent entrer d'abord
  if (hasCheckersOnBar(player) && !isEnteringFromBar(from, to)) {
    return false;
  }
  
  return true;
}

// Exécuter un mouvement
async function makeMove(from: number, to: number) {
  try {
    // Créer l'objet mouvement
    const move = {
      from,
      to,
      player: currentPlayer.value,
      dice: currentDice.value,
      timestamp: Date.now()
    };
    
    // Appeler l'API cloud pour enregistrer le mouvement
    const api = (await import('@/services/api')).default;
    const response = await api.makeMove(gameStore.currentGameId, move);
    
    if (response.success) {
      // Mettre à jour le store local
      gameStore.makeMove(from, to);
      
      // Émettre l'événement
      emit('move-made', move);
      
      // Si multijoueur, le WebSocket gérera la synchronisation
      if (!props.isMultiplayer) {
        // Mode solo : changer de joueur
        if (!hasRemainingMoves()) {
          setTimeout(() => endTurn(), 1000);
        }
      }
    }
    
  } catch (error) {
    console.error('Move failed:', error);
    // Rollback local si erreur API
    gameStore.rollbackMove(from, to);
  }
  
  // Réinitialiser la sélection
  selectedPoint.value = null;
  validMoves.value = [];
}

// Fin du tour
function endTurn() {
  gameStore.switchPlayer();
  emit('turn-ended', currentPlayer.value);
}

// Drag and Drop handlers
function onDragStart(event: DragEvent, pointIndex: number, checkerIndex: number) {
  if (!canDragChecker(pointIndex, checkerIndex)) {
    event.preventDefault();
    return;
  }
  
  isDragging.value = true;
  selectedPoint.value = pointIndex;
  validMoves.value = calculateValidMoves(pointIndex);
  
  // Stocker les données du drag
  event.dataTransfer?.setData('text/plain', JSON.stringify({
    from: pointIndex,
    checkerIndex
  }));
}

function onDrop(event: DragEvent, toPointIndex: number) {
  event.preventDefault();
  
  if (!isDragging.value || selectedPoint.value === null) return;
  
  const dragData = JSON.parse(event.dataTransfer?.getData('text/plain') || '{}');
  const from = dragData.from;
  
  if (validMoves.value.includes(toPointIndex)) {
    makeMove(from, toPointIndex);
  }
  
  isDragging.value = false;
}

function onDragEnd() {
  isDragging.value = false;
  selectedPoint.value = null;
  validMoves.value = [];
}

// Fonctions utilitaires
function hasPlayerCheckers(pointIndex: number): boolean {
  const checkers = board.value.points[pointIndex];
  const player = currentPlayer.value;
  return player === 'white' ? checkers > 0 : checkers < 0;
}

function canDragChecker(pointIndex: number, checkerIndex: number): boolean {
  return hasPlayerCheckers(pointIndex) && 
         Math.abs(checkerIndex) === Math.abs(board.value.points[pointIndex]);
}

function hasRemainingMoves(): boolean {
  return gameStore.availableDice.length > 0;
}

function canBearOff(player: string): boolean {
  return gameStore.canBearOff(player);
}

function hasCheckersOnBar(player: string): boolean {
  return player === 'white' ? gameStore.whiteBar > 0 : gameStore.blackBar > 0;
}

function isEnteringFromBar(from: number, to: number): boolean {
  // Logique pour entrer depuis le bar
  return from === -1 && to >= 0 && to <= 5;
}

function hasBlockingCheckers(from: number, to: number, direction: number): boolean {
  // Vérifier si des pions bloquent le chemin
  const start = Math.min(from, to);
  const end = Math.max(from, to);
  
  for (let i = start + 1; i < end; i++) {
    const checkers = board.value.points[i];
    if (direction === 1 && checkers < -1) return true; // Pions noirs bloquent
    if (direction === -1 && checkers > 1) return true;  // Pions blancs bloquent
  }
  
  return false;
}

function isLastMove(pointIndex: number, checkerIndex: number): boolean {
  // Vérifier si c'est le dernier mouvement effectué
  return gameStore.lastMove?.from === pointIndex;
}

// Watch pour les changements de jeu
watch(() => gameStore.currentPlayer, () => {
  selectedPoint.value = null;
  validMoves.value = [];
});

watch(() => gameStore.dice, () => {
  selectedPoint.value = null;
  validMoves.value = [];
});
</script>

<style scoped>
.game-board {
  width: 100%;
  max-width: 900px;
  height: 600px;
  background: linear-gradient(135deg, #8B4513, #D2691E);
  border-radius: 15px;
  position: relative;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: 1fr auto 1fr;
  gap: 2px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.board-container {
  grid-column: 1 / -1;
  grid-row: 1 / -1;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1px;
}

.point {
  width: 100%;
  height: 100%;
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.dark-triangle {
  background: linear-gradient(135deg, #654321, #8B4513);
}

.light-triangle {
  background: linear-gradient(135deg, #DEB887, #F5DEB3);
}

.point:hover {
  opacity: 0.8;
  transform: scale(1.02);
}

.valid-move {
  background: rgba(46, 204, 113, 0.6) !important;
  animation: pulse 1s infinite;
}

.selected {
  background: rgba(52, 152, 219, 0.6) !important;
}

.checker {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  position: absolute;
  cursor: grab;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  z-index: 10;
}

.checker-white {
  background: radial-gradient(circle at 30% 30%, #ffffff, #e0e0e0);
  border: 2px solid #cccccc;
}

.checker-black {
  background: radial-gradient(circle at 30% 30%, #4a4a4a, #1a1a1a);
  border: 2px solid #000000;
}

.checker.draggable {
  cursor: grab;
  z-index: 20;
}

.checker.draggable:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0,0,0,0.4);
}

.checker.dragging {
  opacity: 0.7;
  cursor: grabbing;
  z-index: 100;
}

.last-move {
  animation: highlight 1s ease-out;
}

.bar-area {
  position: absolute;
  left: 50%;
  top: 20px;
  bottom: 20px;
  width: 60px;
  transform: translateX(-50%);
  background: rgba(139, 69, 19, 0.3);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  gap: 5px;
}

.off-area {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(46, 204, 113, 0.2);
  border-radius: 8px;
  padding: 15px;
  min-width: 100px;
}

.turn-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0,0,0,0.8);
  color: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  z-index: 1000;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

@keyframes highlight {
  0% { box-shadow: 0 0 0 0 rgba(52, 152, 219, 0.8); }
  50% { box-shadow: 0 0 20px 10px rgba(52, 152, 219, 0.4); }
  100% { box-shadow: 0 0 0 0 rgba(52, 152, 219, 0); }
}

/* Responsive */
@media (max-width: 768px) {
  .game-board {
    height: 500px;
    padding: 10px;
  }
  
  .checker {
    width: 28px;
    height: 28px;
  }
  
  .bar-area {
    width: 40px;
  }
}

/* Multiplayer mode */
.game-board.multiplayer {
  border: 3px solid #3498db;
  box-shadow: 0 0 20px rgba(52, 152, 219, 0.3);
}
</style>

# APRÈS-MIDI (2h) : GameStore Cloud
# frontend/src/stores/gameStore.ts

import { defineStore } from 'pinia';
import api from '@/services/api';

interface GameState {
  id: string | null;
  board: BoardState;
  currentPlayer: 'white' | 'black';
  dice: number[];
  availableDice: number[];
  selectedPoint: number | null;
  validMoves: number[];
  gameStatus: 'waiting' | 'playing' | 'finished';
  moveHistory: Move[];
  whiteBar: number;
  blackBar: number;
  whiteOff: number;
  blackOff: number;
  lastMove: Move | null;
}

interface Move {
  id: string;
  from: number;
  to: number;
  player: 'white' | 'black';
  dice: number[];
  timestamp: number;
}

interface BoardState {
  points: number[]; // 24 points, positif = blanc, negatif = noir
}

export const useGameStore = defineStore('game', {
  state: (): GameState => ({
    id: null,
    board: getInitialBoard(),
    currentPlayer: 'white',
    dice: [],
    availableDice: [],
    selectedPoint: null,
    validMoves: [],
    gameStatus: 'waiting',
    moveHistory: [],
    whiteBar: 0,
    blackBar: 0,
    whiteOff: 0,
    blackOff: 0,
    lastMove: null
  }),
  
  getters: {
    currentGameId: (state) => state.id,
    isPlayerTurn: (state) => (player: 'white' | 'black') => state.currentPlayer === player,
    canRollDice: (state) => state.dice.length === 0 && state.gameStatus === 'playing',
    hasValidMoves: (state) => state.validMoves.length > 0,
    
    // Calculer pip count (distance totale des pions)
    whitePipCount: (state) => {
      let count = 0;
      state.board.points.forEach((checkers, index) => {
        if (checkers > 0) {
          count += checkers * (24 - index);
        }
      });
      return count + state.whiteBar * 25; // Pions sur le bar
    },
    
    blackPipCount: (state) => {
      let count = 0;
      state.board.points.forEach((checkers, index) => {
        if (checkers < 0) {
          count += Math.abs(checkers) * (index + 1);
        }
      });
      return count + state.blackBar * 25; // Pions sur le bar
    }
  },
  
  actions: {
    // Créer une nouvelle partie (cloud)
    async createNewGame(opponentId?: string) {
      try {
        const response = await api.createGame(opponentId);
        
        if (response.success) {
          this.id = response.data.id;
          this.board = response.data.boardState;
          this.currentPlayer = response.data.currentPlayer;
          this.gameStatus = 'playing';
          
          return response.data;
        }
      } catch (error) {
        console.error('Failed to create game:', error);
        throw error;
      }
    },
    
    // Lancer les dés
    rollDice() {
      if (!this.canRollDice) return;
      
      const die1 = Math.floor(Math.random() * 6) + 1;
      const die2 = Math.floor(Math.random() * 6) + 1;
      
      if (die1 === die2) {
        // Doubles : 4 dés identiques
        this.dice = [die1, die1, die1, die1];
        this.availableDice = [...this.dice];
      } else {
        this.dice = [die1, die2];
        this.availableDice = [...this.dice];
      }
    },
    
    // Jouer un mouvement
    async makeMove(from: number, to: number) {
      try {
        // Valider le mouvement localement
        if (!this.isValidMove(from, to)) {
          throw new Error('Invalid move');
        }
        
        // Enregistrer le mouvement dans l'API cloud
        const move = {
          from,
          to,
          player: this.currentPlayer,
          dice: this.dice
        };
        
        const response = await api.makeMove(this.id!, move);
        
        if (response.success) {
          // Appliquer le mouvement localement
          this.applyMove(from, to);
          
          // Ajouter à l'historique
          this.moveHistory.push({
            id: response.data.moveId,
            from,
            to,
            player: this.currentPlayer,
            dice: this.dice,
            timestamp: Date.now()
          });
          
          this.lastMove = this.moveHistory[this.moveHistory.length - 1];
          
          // Utiliser le dé
          const moveDistance = Math.abs(to - from);
          const dieIndex = this.availableDice.indexOf(moveDistance);
          if (dieIndex !== -1) {
            this.availableDice.splice(dieIndex, 1);
          }
          
          // Vérifier fin de partie
          if (this.checkWinCondition()) {
            this.gameStatus = 'finished';
            await this.endGame();
          } else if (this.availableDice.length === 0) {
            // Fin du tour
            this.switchPlayer();
          }
        }
        
      } catch (error) {
        console.error('Move failed:', error);
        throw error;
      }
    },
    
    // Appliquer un mouvement au plateau
    applyMove(from: number, to: number) {
      const player = this.currentPlayer;
      const direction = player === 'white' ? 1 : -1;
      
      // Gérer le bearing off
      if (to === -1 || to === 24) {
        // Sortir un pion
        if (player === 'white') {
          this.whiteOff++;
        } else {
          this.blackOff++;
        }
        this.board.points[from] -= direction;
        return;
      }
      
      // Mouvement normal
      this.board.points[from] -= direction;
      
      // Gérer les frappes (hit)
      if (this.board.points[to] * direction < 0 && Math.abs(this.board.points[to]) === 1) {
        // Frapper un pion adverse
        if (player === 'white') {
          this.blackBar++;
        } else {
          this.whiteBar++;
        }
        this.board.points[to] = direction; // Un seul pion
      } else {
        // Mouvement normal
        this.board.points[to] += direction;
      }
    },
    
    // Validation des mouvements
    isValidMove(from: number, to: number): boolean {
      const player = this.currentPlayer;
      const direction = player === 'white' ? 1 : -1;
      
      // Direction correcte
      if ((to - from) * direction <= 0 && to !== -1 && to !== 24) return false;
      
      // Distance correspond à un dé disponible
      const moveDistance = Math.abs(to - from);
      if (!this.availableDice.includes(moveDistance)) return false;
      
      // Destination valide
      if (to >= 0 && to <= 23) {
        const destination = this.board.points[to];
        if (player === 'white' && destination < -1) return false;
        if (player === 'black' && destination > 1) return false;
      }
      
      // Pions sur le bar doivent entrer d'abord
      if ((player === 'white' && this.whiteBar > 0) || 
          (player === 'black' && this.blackBar > 0)) {
        return from === -1 && to >= 0 && to <= 5;
      }
      
      return true;
    },
    
    // Changer de joueur
    switchPlayer() {
      this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
      this.dice = [];
      this.availableDice = [];
      this.selectedPoint = null;
      this.validMoves = [];
    },
    
    // Vérifier conditions de victoire
    checkWinCondition(): boolean {
      return this.whiteOff === 15 || this.blackOff === 15;
    },
    
    // Peut faire bearing off
    canBearOff(player: 'white' | 'black'): boolean {
      if (player === 'white') {
        // Tous les pions dans les 6 derniers points
        return this.board.points.slice(18, 24).every(p => p >= 0) && this.whiteBar === 0;
      } else {
        // Tous les pions dans les 6 premiers points
        return this.board.points.slice(0, 6).every(p => p <= 0) && this.blackBar === 0;
      }
    },
    
    // Fin de partie
    async endGame() {
      try {
        const winner = this.whiteOff === 15 ? 'white' : 'black';
        const response = await api.endGame(this.id!, { winner });
        
        if (response.success) {
          // Mettre à jour les statistiques des joueurs
          await this.updatePlayerStats(response.data);
        }
      } catch (error) {
        console.error('Failed to end game:', error);
      }
    },
    
    // Mettre à jour les statistiques (ELO, etc.)
    async updatePlayerStats(gameResult: any) {
      try {
        await api.updateUserStats(gameResult);
      } catch (error) {
        console.error('Failed to update stats:', error);
      }
    },
    
    // Rejoindre une partie existante
    async joinGame(gameId: string) {
      try {
        const response = await api.getGameState(gameId);
        
        if (response.success) {
          this.id = response.data.id;
          this.board = response.data.boardState;
          this.currentPlayer = response.data.currentPlayer;
          this.gameStatus = response.data.status;
          this.moveHistory = response.data.moveHistory || [];
          
          return response.data;
        }
      } catch (error) {
        console.error('Failed to join game:', error);
        throw error;
      }
    },
    
    // Quitter une partie
    async leaveGame() {
      if (this.id) {
        try {
          await api.leaveGame(this.id);
        } catch (error) {
          console.error('Failed to leave game:', error);
        }
      }
      
      // Reset l'état
      this.$reset();
    },
    
    // Reset le jeu
    resetGame() {
      this.$reset();
    }
  }
});

// Position initiale du backgammon
function getInitialBoard(): BoardState {
  return {
    points: [
      2, 0, 0, 0, 0, -5,    // Points 1-6
      0, -3, 0, 0, 0, 5,    // Points 7-12
      -5, 0, 0, 0, 3, 0,    // Points 13-18
      5, 0, 0, 0, 0, -2     // Points 19-24
    ]
  };
}

# SOIR (2h) : Tests Plateau Interactif
- [ ] Tester drag & drop des pions
- [ ] Valider règles backgammon complètes
- [ ] Test bearing off (sortie des pions)
- [ ] Test frappes (hits)
- [ ] Test fin de partie et score

# VALIDATION : Plateau interactif 100% fonctionnel
# RÉSULTAT : Vrai jeu backgammon dans le navigateur
```

#### **Jour 23 : IA Cloud + Analyse GNUBG (6-8 heures)**

```bash
# MATIN (4h) : IA Computer Player Cloud
# frontend/src/services/aiService.ts

export interface AIMove {
  from: number;
  to: number;
  confidence: number;
  thinkingTime: number;
}

export class CloudAIService {
  private apiUrl: string;
  
  constructor() {
    this.apiUrl = process.env.VITE_AI_SERVICE_URL || 
                 'https://gammon-guru-ai.railway.app';
  }
  
  async getMove(board: BoardState, dice: number[], difficulty: 'easy' | 'medium' | 'hard'): Promise<AIMove> {
    try {
      const response = await fetch(`${this.apiUrl}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.VITE_AI_API_KEY}`
        },
        body: JSON.stringify({
          board,
          dice,
          difficulty,
          analysisDepth: difficulty === 'hard' ? '3-ply' : '2-ply'
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        return {
          from: result.data.from,
          to: result.data.to,
          confidence: result.data.confidence,
          thinkingTime: result.data.thinkingTime
        };
      } else {
        throw new Error(result.error);
      }
      
    } catch (error) {
      console.error('AI service error:', error);
      // Fallback to local simple AI
      return this.getFallbackMove(board, dice);
    }
  }
  
  private getFallbackMove(board: BoardState, dice: number[]): AIMove {
    // AI simple locale en cas d'échec du service cloud
    const validMoves = this.getAllValidMoves(board, dice);
    
    if (validMoves.length === 0) {
      throw new Error('No valid moves available');
    }
    
    // Choisir aléatoirement parmi les coups valides
    const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
    
    return {
      from: randomMove.from,
      to: randomMove.to,
      confidence: 0.5,
      thinkingTime: 1000
    };
  }
  
  private getAllValidMoves(board: BoardState, dice: number[]): Array<{from: number, to: number}> {
    const moves: Array<{from: number, to: number}> = [];
    
    // Parcourir tous les points avec des pions
    board.points.forEach((checkers, from) => {
      if (checkers !== 0) {
        const player = checkers > 0 ? 'white' : 'black';
        const direction = player === 'white' ? 1 : -1;
        
        for (const die of dice) {
          const to = from + (die * direction);
          
          if (this.isValidMove(board, from, to, player)) {
            moves.push({ from, to });
          }
        }
      }
    });
    
    return moves;
  }
  
  private isValidMove(board: BoardState, from: number, to: number, player: 'white' | 'black'): boolean {
    // Implémentation simplifiée des règles
    if (to < 0 || to > 23) return false;
    
    const destination = board.points[to];
    if (player === 'white' && destination < -1) return false;
    if (player === 'black' && destination > 1) return false;
    
    return true;
  }
}

# frontend/src/components/ComputerPlayer.vue
<template>
  <div class="computer-player">
    <div v-if="isThinking" class="thinking-overlay">
      <div class="thinking-animation">
        <div class="brain">🧠</div>
        <p>L'IA réfléchit...</p>
        <div class="progress-bar">
          <div class="progress" :style="{ width: thinkingProgress + '%' }"></div>
        </div>
      </div>
    </div>
    
    <div class="ai-info">
      <h3>🤖 Adversaire IA</h3>
      <div class="difficulty-selector">
        <label>Difficulté:</label>
        <select v-model="selectedDifficulty" @change="onDifficultyChange">
          <option value="easy">Facile</option>
          <option value="medium">Moyen</option>
          <option value="hard">Difficile</option>
        </select>
      </div>
      
      <div class="ai-stats">
        <p>ELO IA: {{ getAIELO(selectedDifficulty) }}</p>
        <p>Temps réflexion: {{ getThinkingTime(selectedDifficulty) }}s</p>
        <p>Précision: {{ getAccuracy(selectedDifficulty) }}%</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { CloudAIService } from '@/services/aiService';
import { useGameStore } from '@/stores/gameStore';

interface Props {
  currentPlayer: 'white' | 'black';
  isAITurn: boolean;
}

interface Emits {
  (e: 'move-made', move: { from: number; to: number }): void;
  (e: 'thinking-started'): void;
  (e: 'thinking-ended'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const gameStore = useGameStore();
const aiService = new CloudAIService();

const isThinking = ref(false);
const thinkingProgress = ref(0);
const selectedDifficulty = ref<'easy' | 'medium' | 'hard'>('medium');

// Computed
const aiColor = computed(() => props.currentPlayer);

// Watcher pour le tour de l'IA
watch(() => props.isAITurn, async (isAITurn) => {
  if (isAITurn && aiColor.value !== gameStore.currentPlayer) {
    await playAITurn();
  }
});

async function playAITurn() {
  if (!props.isAITurn) return;
  
  isThinking.value = true;
  thinkingProgress.value = 0;
  emit('thinking-started');
  
  try {
    // Simulation de la réflexion
    const thinkingTime = getThinkingTime(selectedDifficulty.value) * 1000;
    const progressInterval = setInterval(() => {
      thinkingProgress.value = Math.min(100, thinkingProgress.value + 10);
    }, thinkingTime / 10);
    
    // Obtenir le coup de l'IA depuis le service cloud
    const aiMove = await aiService.getMove(
      gameStore.board,
      gameStore.dice,
      selectedDifficulty.value
    );
    
    clearInterval(progressInterval);
    thinkingProgress.value = 100;
    
    // Pause pour l'effet dramatique
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Jouer le coup
    emit('move-made', {
      from: aiMove.from,
      to: aiMove.to
    });
    
  } catch (error) {
    console.error('AI move failed:', error);
    // TODO: Gérer l'erreur (passer le tour, etc.)
  } finally {
    isThinking.value = false;
    thinkingProgress.value = 0;
    emit('thinking-ended');
  }
}

function onDifficultyChange() {
  // Sauvegarder la préférence
  localStorage.setItem('ai-difficulty', selectedDifficulty.value);
}

function getAIELO(difficulty: 'easy' | 'medium' | 'hard'): number {
  switch (difficulty) {
    case 'easy': return 1200;
    case 'medium': return 1500;
    case 'hard': return 1800;
    default: return 1500;
  }
}

function getThinkingTime(difficulty: 'easy' | 'medium' | 'hard'): number {
  switch (difficulty) {
    case 'easy': return 1;
    case 'medium': return 2;
    case 'hard': return 3;
    default: return 2;
  }
}

function getAccuracy(difficulty: 'easy' | 'medium' | 'hard'): number {
  switch (difficulty) {
    case 'easy': return 60;
    case 'medium': return 80;
    case 'hard': return 95;
    default: return 80;
  }
}

// Charger la préférence sauvegardée
onMounted(() => {
  const saved = localStorage.getItem('ai-difficulty');
  if (saved && ['easy', 'medium', 'hard'].includes(saved)) {
    selectedDifficulty.value = saved as 'easy' | 'medium' | 'hard';
  }
});
</script>

<style scoped>
.computer-player {
  position: relative;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  color: white;
}

.thinking-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.thinking-animation {
  text-align: center;
  background: white;
  color: #333;
  padding: 30px;
  border-radius: 15px;
  min-width: 300px;
}

.brain {
  font-size: 48px;
  animation: pulse 1s infinite;
}

.progress-bar {
  width: 100%;
  height: 10px;
  background: #e0e0e0;
  border-radius: 5px;
  overflow: hidden;
  margin-top: 15px;
}

.progress {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.3s ease;
}

.ai-info h3 {
  margin: 0 0 15px 0;
  font-size: 18px;
}

.difficulty-selector {
  margin-bottom: 15px;
}

.difficulty-selector select {
  margin-left: 10px;
  padding: 5px 10px;
  border-radius: 5px;
  border: none;
  background: rgba(255,255,255,0.2);
  color: white;
}

.ai-stats p {
  margin: 5px 0;
  font-size: 14px;
  opacity: 0.9;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
</style>

# APRÈS-MIDI (3h) : Analyse GNUBG Cloud Intégrée
# netlify/functions/gnubg/analyze.js (version cloud)

const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  try {
    const { boardState, dice, move, userId } = JSON.parse(event.body);
    
    // Vérifier le quota utilisateur
    const quotaCheck = await checkUserQuota(userId);
    if (!quotaCheck.allowed) {
      return {
        statusCode: 429,
        body: JSON.stringify({
          error: 'Quota exceeded',
          message: quotaCheck.message
        })
      };
    }
    
    // Appeler le service GNUBG sur Railway
    const gnubgResponse = await fetch(`${process.env.GNUBG_SERVICE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GNUBG_API_KEY}`
      },
      body: JSON.stringify({
        board: boardState,
        dice: dice,
        move: move,
        analysisType: 'full',
        includeAlternatives: true
      }),
      timeout: 10000 // 10 secondes timeout
    });
    
    if (!gnubgResponse.ok) {
      throw new Error(`GNUBG service error: ${gnubgResponse.status}`);
    }
    
    const analysis = await gnubgResponse.json();
    
    // Sauvegarder l'analyse dans Supabase
    const supabase = require('@supabase/supabase-js');
    const supabaseClient = supabase.createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
    
    const { data: savedAnalysis, error: saveError } = await supabaseClient
      .from('analyses')
      .insert({
        user_id: userId,
        board_state: boardState,
        dice: dice,
        move: move,
        best_move: analysis.bestMove,
        equity: analysis.equity,
        pr: analysis.pr,
        explanation: analysis.explanation,
        alternatives: analysis.alternatives,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (saveError) {
      console.error('Failed to save analysis:', saveError);
      // Continuer quand même, l'analyse est réussie
    }
    
    // Mettre à jour le quota utilisateur
    await updateUserQuota(userId);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data: {
          ...analysis,
          analysisId: savedAnalysis?.id,
          quotaRemaining: quotaCheck.remaining - 1
        }
      })
    };
    
  } catch (error) {
    console.error('GNUBG analysis error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Analysis failed',
        message: error.message
      })
    };
  }
};

// Vérifier le quota utilisateur
async function checkUserQuota(userId) {
  const supabase = require('@supabase/supabase-js');
  const supabaseClient = supabase.createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
  
  // Récupérer le type d'abonnement
  const { data: user } = await supabaseClient
    .from('users')
    .select('subscription_type')
    .eq('id', userId)
    .single();
  
  // Compter les analyses ce mois-ci
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const { count } = await supabaseClient
    .from('analyses')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .gte('created_at', startOfMonth.toISOString());
  
  const quota = user.subscription_type === 'premium' ? 1000 : 5;
  const remaining = quota - count;
  
  return {
    allowed: remaining > 0,
    remaining: Math.max(0, remaining),
    message: remaining <= 0 ? 
      'Quota atteint. Passez à Premium pour des analyses illimitées.' : 
      null
  };
}

# SOIR (1h) : Test Analyse Cloud
- [ ] Test analyse GNUBG depuis frontend
- [ ] Validation quota utilisateur
- [ ] Test temps réponse <5 secondes
- [ ] Vérification sauvegarde Supabase

# VALIDATION : IA + Analyse cloud 100% fonctionnelles
# RÉSULTAT : Intelligence artificielle et analyse GNUBG intégrées
```

#### **Jour 24 : Multijoueur WebSocket Cloud (5-6 heures)**

```bash
# MATIN (3h) : WebSocket Netlify Functions
# netlify/functions/websocket/index.js

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Gestionnaire WebSocket pour le jeu en temps réel
exports.handler = async (event, context) => {
  if (event.requestContext.eventType === 'CONNECT') {
    return await handleConnect(event, context);
  } else if (event.requestContext.eventType === 'DISCONNECT') {
    return await handleDisconnect(event, context);
  } else if (event.requestContext.eventType === 'MESSAGE') {
    return await handleMessage(event, context);
  }
  
  return { statusCode: 400, body: 'Unknown event type' };
};

async function handleConnect(event, context) {
  const connectionId = event.requestContext.connectionId;
  const userId = JSON.parse(event.body).userId;
  
  // Sauvegarder la connexion
  await supabase.from('websocket_connections').insert({
    connection_id: connectionId,
    user_id: userId,
    connected_at: new Date().toISOString()
  });
  
  return { statusCode: 200, body: 'Connected' };
}

async function handleMessage(event, context) {
  const connectionId = event.requestContext.connectionId;
  const message = JSON.parse(event.body);
  
  switch (message.type) {
    case 'join-game':
      return await handleJoinGame(connectionId, message);
    
    case 'game-move':
      return await handleGameMove(connectionId, message);
    
    case 'chat-message':
      return await handleChatMessage(connectionId, message);
    
    case 'game-invite':
      return await handleGameInvite(connectionId, message);
    
    default:
      return { statusCode: 400, body: 'Unknown message type' };
  }
}

async function handleJoinGame(connectionId, message) {
  const { gameId, userId } = message;
  
  // Ajouter le joueur à la partie
  await supabase.from('game_players').insert({
    game_id: gameId,
    user_id: userId,
    connection_id: connectionId,
    joined_at: new Date().toISOString()
  });
  
  // Notifier les autres joueurs
  await broadcastToGame(gameId, {
    type: 'player-joined',
    userId: userId,
    playerCount: await getPlayerCount(gameId)
  });
  
  // Envoyer l'état actuel du jeu
  const gameState = await getGameState(gameId);
  await sendToConnection(connectionId, {
    type: 'game-state',
    state: gameState
  });
  
  return { statusCode: 200, body: 'Joined game' };
}

async function handleGameMove(connectionId, message) {
  const { gameId, userId, move } = message;
  
  // Sauvegarder le mouvement
  await supabase.from('game_moves').insert({
    game_id: gameId,
    user_id: userId,
    move_data: move,
    created_at: new Date().toISOString()
  });
  
  // Mettre à jour l'état du jeu
  await updateGameState(gameId, move);
  
  // Diffuser le mouvement aux autres joueurs
  await broadcastToGame(gameId, {
    type: 'game-move',
    userId: userId,
    move: move,
    timestamp: Date.now()
  });
  
  return { statusCode: 200, body: 'Move processed' };
}

// Diffuser un message à tous les joueurs d'une partie
async function broadcastToGame(gameId, message) {
  const { data: connections } = await supabase
    .from('game_players')
    .select('connection_id')
    .eq('game_id', gameId);
  
  const promises = connections.map(conn => 
    sendToConnection(conn.connection_id, message)
  );
  
  await Promise.all(promises);
}

// Envoyer un message à une connexion spécifique
async function sendToConnection(connectionId, message) {
  const { postToConnection } = require('@aws-sdk/client-apigatewaymanagementapi');
  
  const apiClient = new postToConnection({
    endpoint: process.env.WEBSOCKET_API_ENDPOINT
  });
  
  try {
    await apiClient.send({
      ConnectionId: connectionId,
      Data: JSON.stringify(message)
    });
  } catch (error) {
    // La connexion peut être fermée, nettoyer
    await supabase
      .from('websocket_connections')
      .delete()
      .eq('connection_id', connectionId);
  }
}

# APRÈS-MIDI (2h) : Frontend WebSocket Cloud
# frontend/src/services/websocketService.ts

export interface WebSocketMessage {
  type: string;
  data?: any;
  timestamp?: number;
}

export class CloudWebSocketService {
  private ws: WebSocket | null = null;
  private connectionId: string | null = null;
  private messageHandlers: Map<string, Function[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  
  constructor(private gameId: string) {}
  
  async connect(userId: string): Promise<void> {
    try {
      // Créer la connexion WebSocket
      this.ws = new WebSocket(
        `${process.env.VITE_WEBSOCKET_URL}/${this.gameId}`
      );
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        
        // Envoyer le message de connexion
        this.send({
          type: 'connect',
          userId: userId
        });
      };
      
      this.ws.onmessage = (event) => {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handleMessage(message);
      };
      
      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.attemptReconnect(userId);
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      throw error;
    }
  }
  
  private handleMessage(message: WebSocketMessage) {
    const handlers = this.messageHandlers.get(message.type) || [];
    handlers.forEach(handler => handler(message.data));
  }
  
  private attemptReconnect(userId: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect(userId);
      }, 1000 * this.reconnectAttempts);
    }
  }
  
  send(message: WebSocketMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, message not sent:', message);
    }
  }
  
  on(messageType: string, handler: Function): void {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, []);
    }
    this.messageHandlers.get(messageType)!.push(handler);
  }
  
  off(messageType: string, handler: Function): void {
    const handlers = this.messageHandlers.get(messageType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }
  
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.messageHandlers.clear();
  }
}

# frontend/src/components/MultiplayerGame.vue
<template>
  <div class="multiplayer-game">
    <div class="connection-status" :class="{ connected: isConnected }">
      {{ isConnected ? '🟢 Connecté' : '🔴 Connexion...' }}
    </div>
    
    <GameBoard 
      :is-multiplayer="true"
      @move-made="onMoveMade" />
    
    <!-- Panneau adversaire -->
    <div class="opponent-panel" v-if="opponent">
      <div class="opponent-info">
        <img :src="opponent.avatar" :alt="opponent.username" />
        <div class="opponent-details">
          <h3>{{ opponent.username }}</h3>
          <p>ELO: {{ opponent.elo }}</p>
          <span class="status" :class="{ online: opponent.isOnline }">
            {{ opponent.isOnline ? '🟢 En ligne' : '⚫ Hors ligne' }}
          </span>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="game-actions">
        <button @click="sendChatMessage" class="chat-button">
          💬 Chat
        </button>
        <button @click="offerDraw" class="draw-button">
          🤝 Nulle
        </button>
        <button @click="resignGame" class="resign-button">
          🏳️ Abandonner
        </button>
      </div>
    </div>
    
    <!-- Chat -->
    <div v-if="showChat" class="chat-panel">
      <div class="chat-messages">
        <div v-for="msg in chatMessages" :key="msg.id" class="chat-message">
          <span class="author">{{ msg.author }}:</span>
          <span class="content">{{ msg.content }}</span>
          <span class="time">{{ formatTime(msg.timestamp) }}</span>
        </div>
      </div>
      
      <div class="chat-input">
        <input 
          v-model="newChatMessage" 
          @keyup.enter="sendChatMessage"
          placeholder="Tapez votre message..." />
        <button @click="sendChatMessage">Envoyer</button>
      </div>
    </div>
    
    <!-- Notifications -->
    <div class="notifications">
      <div v-for="notification in notifications" 
           :key="notification.id"
           class="notification"
           :class="notification.type">
        {{ notification.message }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { CloudWebSocketService } from '@/services/websocketService';
import { useGameStore } from '@/stores/gameStore';
import { useUserStore } from '@/stores/userStore';

interface Props {
  gameId: string;
  opponentId?: string;
}

const gameStore = useGameStore();
const userStore = useUserStore();

const isConnected = ref(false);
const opponent = ref(null);
const showChat = ref(false);
const chatMessages = ref([]);
const newChatMessage = ref('');
const notifications = ref([]);

let websocketService: CloudWebSocketService | null = null;

onMounted(async () => {
  await initializeMultiplayer();
});

onUnmounted(() => {
  if (websocketService) {
    websocketService.disconnect();
  }
});

async function initializeMultiplayer() {
  try {
    // Initialiser le service WebSocket
    websocketService = new CloudWebSocketService(props.gameId);
    
    // Configurer les handlers
    websocketService.on('player-joined', handlePlayerJoined);
    websocketService.on('game-move', handleGameMove);
    websocketService.on('chat-message', handleChatMessage);
    websocketService.on('game-invite', handleGameInvite);
    websocketService.on('connection-status', handleConnectionStatus);
    
    // Se connecter
    await websocketService.connect(userStore.currentUser.id);
    
    // Charger les informations de l'adversaire
    if (props.opponentId) {
      opponent.value = await loadOpponentInfo(props.opponentId);
    }
    
  } catch (error) {
    console.error('Failed to initialize multiplayer:', error);
    addNotification('Erreur de connexion multijoueur', 'error');
  }
}

function handlePlayerJoined(data: any) {
  addNotification(`${data.username} a rejoint la partie!`, 'success');
  
  if (data.userId !== userStore.currentUser.id) {
    opponent.value = data;
  }
}

function handleGameMove(data: any) {
  // Mettre à jour le plateau avec le mouvement de l'adversaire
  gameStore.applyOpponentMove(data.from, data.to);
  
  addNotification(`Adversaire a joué: ${data.move}`, 'info');
}

function handleChatMessage(data: any) {
  chatMessages.value.push({
    id: Date.now(),
    author: data.author,
    content: data.content,
    timestamp: data.timestamp
  });
}

function handleConnectionStatus(data: any) {
  isConnected.value = data.connected;
  
  if (!data.connected) {
    addNotification('Connexion perdue, tentative de reconnexion...', 'warning');
  }
}

async function onMoveMade(move: { from: number; to: number }) {
  if (websocketService && isConnected.value) {
    // Envoyer le mouvement via WebSocket
    websocketService.send({
      type: 'game-move',
      data: {
        gameId: props.gameId,
        move: move,
        userId: userStore.currentUser.id
      }
    });
  }
}

function sendChatMessage() {
  if (!newChatMessage.value.trim() || !websocketService) return;
  
  const message = {
    id: Date.now(),
    author: userStore.currentUser.username,
    content: newChatMessage.value,
    timestamp: Date.now()
  };
  
  // Envoyer via WebSocket
  websocketService.send({
    type: 'chat-message',
    data: message
  });
  
  // Ajouter localement
  chatMessages.value.push(message);
  newChatMessage.value = '';
}

function addNotification(message: string, type: 'success' | 'error' | 'warning' | 'info') {
  notifications.value.push({
    id: Date.now(),
    message,
    type
  });
  
  // Auto-supprimer après 5 secondes
  setTimeout(() => {
    const index = notifications.value.findIndex(n => n.message === message);
    if (index > -1) {
      notifications.value.splice(index, 1);
    }
  }, 5000);
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString();
}

// Autres fonctions...
async function loadOpponentInfo(opponentId: string) {
  // Charger depuis l'API
  return await api.getUserProfile(opponentId);
}

function offerDraw() {
  if (websocketService) {
    websocketService.send({
      type: 'draw-offer',
      data: { gameId: props.gameId }
    });
  }
}

function resignGame() {
  if (websocketService) {
    websocketService.send({
      type: 'resign',
      data: { gameId: props.gameId }
    });
  }
}
</script>

<style scoped>
.multiplayer-game {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
  height: 100vh;
}

.connection-status {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 10px 20px;
  border-radius: 20px;
  font-weight: bold;
  z-index: 1000;
}

.connection-status.connected {
  background: #27ae60;
  color: white;
}

.connection-status:not(.connected) {
  background: #e74c3c;
  color: white;
}

.opponent-panel {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  padding: 20px;
  color: white;
}

.opponent-info {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.opponent-info img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 15px;
}

.game-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.game-actions button {
  padding: 10px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.chat-panel {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 300px;
  height: 400px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  display: flex;
  flex-direction: column;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
}

.chat-message {
  margin-bottom: 10px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 8px;
}

.chat-input {
  display: flex;
  padding: 10px;
  border-top: 1px solid #e0e0e0;
}

.chat-input input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.notifications {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 1000;
}

.notification {
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 10px;
  font-weight: bold;
}

.notification.success {
  background: #27ae60;
  color: white;
}

.notification.error {
  background: #e74c3c;
  color: white;
}

.notification.warning {
  background: #f39c12;
  color: white;
}

.notification.info {
  background: #3498db;
  color: white;
}
</style>

# SOIR (1h) : Test Multijoueur Cloud
- [ ] Ouvrir deux onglets navigateur
- [ ] Connecter deux joueurs différents
- [ ] Tester communication temps réel
- [ ] Valider chat et mouvements synchronisés

# VALIDATION : Multijoueur cloud 100% fonctionnel
# RÉSULTAT : Jeu en temps réel sans aucune installation
```

#### **Jour 25 : Déploiement Production Cloud (4-5 heures)**

```bash
# MATIN (2h) : Configuration Production Complète

# 1. Netlify Functions Production
netlify.toml :
[build]
  base = "frontend/"
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions/"

[build.environment]
  NODE_VERSION = "18"
  VITE_API_BASE_URL = "https://gammon-guru.netlify.app/api"
  VITE_WEBSOCKET_URL = "wss://gammon-guru.netlify.app/.netlify/functions/websocket"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"

[dev]
  framework = "vue"
  targetPort = 3000

# 2. Railway Service GNUBG Production
railway.toml :
[build]
builder = "NIXPACKS"

[deploy]
healthcheckPath = "/health"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[[services]]
name = "gnubg-service"

[services.variables]
NODE_ENV = "production"
PORT = "3000"

[[services.ports]]
port = 3000
handlers = ["http"]

# 3. Supabase Production
# Variables environnement dans Supabase Settings:
VITE_SUPABASE_URL = "https://votre-projet.supabase.co"
VITE_SUPABASE_ANON_KEY = "votre-anon-key"
SUPABASE_SERVICE_ROLE_KEY = "votre-service-key"
JWT_SECRET = "votre-jet-secret-robuste"
GNUBG_SERVICE_URL = "https://gammon-guru-gnu.railway.app"
GNUBG_API_KEY = "votre-api-key"

# APRÈS-MIDI (2h) : Tests Production Complets

# Test 1 : API Functions
curl -X POST https://gammon-guru.netlify.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

# Test 2 : GNUBG Service
curl -X POST https://gammon-guru-gnu.railway.app/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer votre-api-key" \
  -d '{"board": "4HPwATDgc/ABMA", "dice": [3, 1], "move": "8/5 6/5"}'

# Test 3 : WebSocket Connection
wscat -c wss://gammon-guru.netlify.app/.netlify/functions/websocket

# Test 4 : Frontend Production
- Visiter https://gammon-guru.netlify.app
- Tester toutes les fonctionnalités
- Valider mobile responsive

# SOIR (1h) : Monitoring Production
- [ ] Configurer Netlify Analytics
- [ ] Activer Railway monitoring
- [ ] Configurer Supabase logs
- [ ] Tester erreurs handling
- [ ] Valider performance globale

# VALIDATION FINALE : Application 100% cloud
# RÉSULTAT : GammonGuru disponible mondialement sans installation
```

---

### **📈 SEMAINE 3 : CROISSANCE ET MONÉTISATION (Jour 26-30)**

#### **Jour 26 : Analytics Cloud et Optimisation (4-5 heures)**

```bash
# MATIN (2h) : Google Analytics 4 Cloud
# frontend/src/analytics.ts

import gtag from 'ga-gtag';

export interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

class CloudAnalytics {
  private initialized = false;
  
  constructor() {
    this.initialize();
  }
  
  private initialize() {
    if (typeof window !== 'undefined' && !this.initialized) {
      gtag('js', new Date());
      gtag('config', process.env.VITE_GA_MEASUREMENT_ID);
      this.initialized = true;
    }
  }
  
  trackGameStart(difficulty: string, gameMode: string) {
    this.trackEvent('game_start', 'engagement', `${difficulty}_${gameMode}`);
  }
  
  trackMoveAnalysis(equity: number, pr: number, analysisTime: number) {
    this.trackEvent('move_analysis', 'gameplay', 'analysis_completed', analysisTime);
    
    // Analytics personnalisés
    this.trackEvent('equity_recorded', 'gameplay', 
      this.getEquityRange(equity));
  }
  
  trackMultiplayerConnection(success: boolean, connectionTime: number) {
    this.trackEvent('multiplayer_connect', 'social', 
      success ? 'success' : 'failed', connectionTime);
  }
  
  trackSubscriptionUpgrade(plan: string, revenue: number) {
    this.trackEvent('subscription_upgrade', 'monetization', plan, revenue);
  }
  
  trackTutorialStep(step: number, completed: boolean) {
    this.trackEvent('tutorial_step', 'onboarding', `step_${step}`, completed ? 1 : 0);
  }
  
  private trackEvent(action: string, category: string, label?: string, value?: number) {
    if (this.initialized) {
      gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value
      });
    }
  }
  
  private getEquityRange(equity: number): string {
    if (equity > 0.5) return 'very_positive';
    if (equity > 0.1) return 'positive';
    if (equity > -0.1) return 'neutral';
    if (equity > -0.5) return 'negative';
    return 'very_negative';
  }
}

export const analytics = new CloudAnalytics();

# Intégration dans les composants
# frontend/src/views/GameView.vue
import { analytics } from '@/analytics';

onMounted(() => {
  analytics.trackGameStart(gameStore.difficulty, 'ai_vs_player');
});

async function onMoveMade(move: any) {
  const startTime = Date.now();
  
  try {
    const analysis = await api.analyzeMove(board, dice, move);
    const analysisTime = Date.now() - startTime;
    
    analytics.trackMoveAnalysis(
      analysis.equity, 
      analysis.pr, 
      analysisTime
    );
    
  } catch (error) {
    analytics.trackEvent('analysis_failed', 'error', error.message);
  }
}

# APRÈS-MIDI (2h) : Dashboard Analytics Cloud
# netlify/functions/analytics/dashboard.js

exports.handler = async (event, context) => {
  try {
    const userId = context.clientContext.user.sub;
    
    // Récupérer les statistiques utilisateur depuis Supabase
    const { data: stats } = await supabase
      .from('user_analytics')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(30);
    
    // Calculer les métriques
    const metrics = {
      gamesPlayed: stats.reduce((sum, s) => sum + s.games_played, 0),
      analysesCompleted: stats.reduce((sum, s) => sum + s.analyses_completed, 0),
      averageEquity: stats.reduce((sum, s) => sum + s.avg_equity, 0) / stats.length,
      improvementRate: calculateImprovementRate(stats),
      favoriteGameMode: getFavoriteGameMode(stats),
      peakPlayingTime: getPeakPlayingTime(stats)
    };
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data: {
          metrics,
          dailyStats: stats,
          insights: generateInsights(metrics)
        }
      })
    };
    
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

function generateInsights(metrics) {
  const insights = [];
  
  if (metrics.improvementRate > 0.1) {
    insights.push({
      type: 'improvement',
      message: `Votre ELO a amélioré de ${(metrics.improvementRate * 100).toFixed(1)}% ce mois-ci!`,
      icon: '📈'
    });
  }
  
  if (metrics.averageEquity > 0.2) {
    insights.push({
      type: 'skill',
      message: 'Votre equity moyenne est excellente. Continuez comme ça!',
      icon: '🎯'
    });
  }
  
  if (metrics.gamesPlayed > 50) {
    insights.push({
      type: 'dedication',
      message: 'Vous êtes un joueur très dédié. Considérez le mode Premium!',
      icon: '🏆'
    });
  }
  
  return insights;
}

# SOIR (1h) : A/B Testing Cloud
# frontend/src/components/ABTestComponent.vue

<template>
  <div class="ab-test-container">
    <component :is="testComponent" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';

// Test A/B : Bouton "Jouer" vs "Commencer une partie"
const testVariant = ref<'A' | 'B'>('A');

const testComponent = computed(() => {
  switch (testVariant.value) {
    case 'A':
      return 'PlayButtonVariantA';
    case 'B':
      return 'PlayButtonVariantB';
    default:
      return 'PlayButtonVariantA';
  }
});

onMounted(() => {
  // Assigner une variante aléatoire
  testVariant.value = Math.random() < 0.5 ? 'A' : 'B';
  
  // Tracker l'exposition au test
  analytics.trackEvent('ab_test_exposed', 'experiment', `play_button_${testVariant.value}`);
});

function onPlayButtonClick() {
  // Tracker la conversion
  analytics.trackEvent('ab_test_converted', 'experiment', `play_button_${testVariant.value}`);
  
  // Logique du jeu...
}
</script>

# VALIDATION : Analytics cloud 100% fonctionnelles
# RÉSULTAT : Décisions data-driven pour optimisation
```

#### **Jour 27-30 : Monétisation et Lancement Cloud (15-20 heures)**

```bash
# Jour 27 : Stripe Cloud Integration (5h)
# Jour 28 : Marketing Cloud Automation (4h) 
# Jour 29 : Lancement Beta Cloud (5h)
# Jour 30 : Analytics et Optimisation Finale (6h)

[Details complets dans le document final...]
```

---

## 🎯 **RÉSULTATS FINAUX - 100% CLOUD**

### **✅ ZÉRO INSTALLATION LOCALE**
- **Développement** : GitHub Codespaces (navigateur)
- **Base de données** : Supabase (interface web)
- **Backend** : Netlify Functions (serverless)
- **GNUBG** : Railway container (Docker)
- **Frontend** : Netlify hosting (CDN mondial)

### **🌐 ACCESSIBILITÉ MONDIALE**
- **URL** : https://gammon-guru.netlify.app
- **API** : https://gammon-guru.netlify.app/api
- **WebSocket** : wss://gammon-guru.netlify.app/ws
- **GNUBG** : https://gammon-guru-gnu.railway.app
- **Database** : https://votre-projet.supabase.co

### **💰 COÛTS PRÉDICTIBLES**
- **Netlify** : $0-19/mois (selon trafic)
- **Railway** : $5-20/mois (GNUBG service)
- **Supabase** : $0-25/mois (base de données)
- **Total** : **$10-64/mois maximum**

### **📊 MÉTRIQUES DE SUCCÈS GARANTIES**
- **Performance** : >95 Lighthouse (CDN Netlify)
- **Disponibilité** : 99.9%+ (serverless auto-scaling)
- **Scalabilité** : Illimitée (pay-per-use)
- **Sécurité** : HTTPS automatique, headers sécurité

---

## **🚀 DÉPLOIEMENT IMMÉDIAT - AUJOURD'HUI**

### **Action en 30 minutes depuis n'importe quel ordinateur :**

1. **Ouvrir GitHub Codespaces**
   - Aller sur le dépôt GitHub
   - Cliquer "Code" → "Codespaces" → "Create codespace"
   - VS Code s'ouvre dans le navigateur

2. **Configurer Supabase**
   - Aller sur https://supabase.com
   - Créer projet en 2 minutes
   - Copier DATABASE_URL

3. **Déployer sur Netlify**
   - Connecter GitHub à Netlify
   - Build automatique
   - URL disponible instantanément

4. **Déployer GNUBG sur Railway**
   - Connecter GitHub à Railway
   - Docker build automatique
   - API GNUBG opérationnelle

### **Résultat en 24 heures :**
- **Application complète** en production
- **Accessible mondialement** 
- **Zéro installation** requise
- **Scalable automatiquement**

---

## **🎉 CONCLUSION - ROADMAP ZERO ERROR CLOUD**

### **Dans 25 jours, vous aurez :**
1. **Le meilleur jeu backgammon** 100% cloud
2. **Analyse GNUBG intégrée** sans installation locale
3. **Multijoueur temps réel** via WebSocket
4. **Monétisation fonctionnelle** avec Stripe
5. **Analytics complètes** pour optimisation

### **Avantages de l'approche 100% cloud :**
- **Développement partout** : Navigateur seul
- **Zéro setup local** : Pas d'installation PostgreSQL/GNUBG
- **Scalabilité infinie** : Auto-scaling serverless
- **Coûts prévisibles** : Pay-per-use seulement
- **Déploiement continu** : Git push → production

---

## **🚀 PRÊT À COMMENCER LE JOUR 17 ?**

### **AUJOURD'HUI : GitHub Codespaces + Supabase**
### **DEMAIN : Netlify Functions + API cloud**
### **APRÈS-DEMAIN : GNUBG container Railway**

### **CECI EST LA ROADMAP LA PLUS EFFICACE - 100% CLOUD**

**GammonGuru sera accessible depuis n'importe quel navigateur dans le monde !** 🌐🎲🚀

[La suite continue dans le prochain message...]
