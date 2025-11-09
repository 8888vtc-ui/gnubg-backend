# 🎲 GammonGuru - Backend Cloud

> Backend avancé pour jeu backgammon avec analyse GNUBG et architecture 100% cloud

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.1-lightgrey.svg)](https://expressjs.com/)
[![Cloud](https://img.shields.io/badge/Cloud-Netlify-orange.svg)](https://netlify.com/)
[![Database](https://img.shields.io/badge/Database-Supabase-green.svg)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🌐 Architecture 100% Cloud

**GammonGuru** est une plateforme complète de backgammon en ligne avec :

- **Développement cloud** : GitHub Codespaces (navigateur)
- **Base de données** : Supabase PostgreSQL managée
- **Backend serverless** : Netlify Functions auto-scaling
- **GNUBG containerisé** : Railway Docker service
- **Frontend CDN** : Netlify hosting mondial
- **Multijoueur temps réel** : WebSocket serverless

### 🚀 Zéro Installation Locale

Travaillez depuis **n'importe quel navigateur** sans installer PostgreSQL, GNUBG ou Docker !

---

## ⚡ Setup Rapide (5 minutes)

### 1. Cloner et installer
```bash
git clone https://github.com/8888vtc-ui/gnubg-backend.git
cd gnubg-backend
npm install
```

### 2. Configuration environnement
```bash
# Développement local
cp .env.development .env.local

# Production (cloud)
cp .env.production .env
```

### 3. Base de données Prisma
```bash
npx prisma generate
npx prisma db push
```

### 4. Démarrer
```bash
npm run dev
```

---

## 🏗️ Stack Technique Cloud

| Service | Fournisseur | Rôle |
|---------|-------------|------|
| **Frontend** | Netlify | CDN mondial + Functions |
| **Backend API** | Netlify Functions | Serverless auto-scaling |
| **Database** | Supabase | PostgreSQL managé |
| **GNUBG Engine** | Railway | Container Docker |
| **WebSocket** | Netlify Functions | Temps réel multijoueur |
| **Analytics** | Google Analytics 4 | Tracking utilisateur |
| **Monitoring** | Sentry | Erreurs et performance |
| **Paiements** | Stripe | Abonnements Premium |

---

## 📋 Configuration Complète

### Variables Environnement
```bash
# Base de données
DATABASE_URL="postgresql://postgres:password@db.projet.supabase.co:5432/postgres"
SUPABASE_URL="https://votre-projet.supabase.co"
SUPABASE_SERVICE_KEY="votre-service-key"

# Authentification
JWT_SECRET="votre-jet-secret-32-caracteres-minimum"

# Services externes
GNUBG_SERVICE_URL="https://gammon-guru-gnu.railway.app"
GNUBG_API_KEY="votre-api-key-secrete"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Frontend URLs
VITE_API_BASE_URL="https://gammon-guru.netlify.app/api"
VITE_WEBSOCKET_URL="wss://gammon-guru.netlify.app/.netlify/functions/websocket"
```

### Configuration Netlify
```toml
# netlify.toml
[build]
  base = "frontend/"
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions/"

[build.environment]
  NODE_VERSION = "18"
  VITE_API_BASE_URL = "https://gammon-guru.netlify.app/api"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

### Configuration Railway
```toml
# railway.toml
[build]
builder = "NIXPACKS"

[deploy]
healthcheckPath = "/health"
restartPolicyType = "ON_FAILURE"
```

---

## 🎮 Fonctionnalités Complètes

### 🎯 Jeu Backgammon
- **Plateau interactif** : Drag & drop 30 pions
- **Règles complètes** : Bearing off, hits, bar
- **IA adversaire** : 3 niveaux de difficulté
- **Multijoueur** : WebSocket temps réel

### 🧠 Analyse GNUBG
- **Validation coups** : Equity et PR calculés
- **Suggestions IA** : Meilleurs coups identifiés
- **Explications pédagogiques** : GPT-4/Claude API
- **Quotas intelligents** : Freemium 5/jour

### 💰 Monétisation
- **Abonnements Stripe** : Free/Premium/VIP
- **Tournois payants** : Entry fees $1-10
- **Boutique virtuelle** : Skins plateau $2-5
- **Analytics tracking** : Conversion ELO

### 📊 Analytics & Monitoring
- **Google Analytics 4** : Events utilisateur
- **Sentry** : Erreurs temps réel
- **Dashboard personnalisé** : Stats progression
- **A/B Testing** : Optimisation UI

---

## 🚀 Déploiement Production

### 1. Netlify (Frontend + Functions)
```bash
# Connecter GitHub à Netlify
# Build automatique sur chaque push
# URL : https://gammon-guru.netlify.app
```

### 2. Railway (GNUBG Service)
```bash
# Connecter repo GitHub
# Docker build automatique
# URL : https://gammon-guru-gnu.railway.app
```

### 3. Supabase (Database)
```bash
# Interface web SQL
# Migrations automatiques
# Backup quotidien inclus
```

---

## 📊 Base de Données Complète

### Schéma Principal
```sql
-- Utilisateurs et authentification
users (id, email, password, username, elo, subscription_type)

-- Parties et mouvements
games (id, white_player, black_player, board_state, status)
game_moves (id, game_id, player, dice, move, equity)

-- Analyses GNUBG
analyses (id, user_id, board_state, best_move, explanation)

-- Abonnements Stripe
subscriptions (id, user_id, stripe_subscription_id, plan, status)

-- Tournois et participants
tournaments (id, name, entry_fee, prize_pool, status)
tournament_participants (id, tournament_id, user_id, position)

-- Multijoueur WebSocket
websocket_connections (id, connection_id, user_id, game_id)

-- Analytics utilisateur
user_analytics (id, user_id, date, games_played, analyses_completed)
```

---

## 🎯 API Endpoints

### Authentification
- `POST /api/auth/login` - Connexion utilisateur
- `POST /api/auth/register` - Inscription
- `POST /api/auth/refresh` - Refresh token JWT

### Jeu
- `POST /api/game/create` - Créer partie (IA/humain)
- `POST /api/game/move` - Jouer coup avec validation
- `GET /api/game/status/:id` - État partie en cours

### GNUBG Analyse
- `POST /api/gnubg/analyze` - Analyse complète position
- `POST /api/gnubg/hint` - Suggestion meilleur coup
- `POST /api/gnubg/evaluate` - Évaluation equity

### Multijoueur
- `POST /api/multiplayer/join` - Rejoindre partie
- `WS /api/websocket` - Communication temps réel

### Abonnements
- `POST /api/subscription/upgrade` - Upgrade Premium
- `POST /api/subscription/cancel` - Annuler abonnement

---

## 🧪 Tests Complet

```bash
# Tests unitaires
npm run test

# Tests intégration API
npm run test:integration

# Tests E2E frontend
npm run test:e2e

# Tests charge
npm run test:load
```

---

## 📈 Monitoring & Analytics

### Métriques Tracking
- **Performance** : Lighthouse score >95
- **Uptime** : 99.9%+ monitoring
- **Conversion** : Freemium → Premium >5%
- **Rétention** : Joueurs actifs/jour

### Dashboard Analytics
- **Progression ELO** : Graphique évolution
- **Analyses complétées** : Quotas utilisés
- **Temps de jeu** : Sessions et durée
- **Revenue tracking** : Abonnements + tournois

---

## 🌍 Accessibilité Mondiale

### URLs Production
- **Application** : https://gammon-guru.netlify.app
- **API REST** : https://gammon-guru.netlify.app/api
- **WebSocket** : wss://gammon-guru.netlify.app/ws
- **GNUBG Service** : https://gammon-guru-gnu.railway.app

### Performance CDN
- **USA/Europe/Asie** : Edge locations multiples
- **Mobile responsive** : PWA installable
- **Offline mode** : Service Worker
- **SEO optimisé** : Meta tags + sitemap

---

## 💰 Coûts Prévisibles

### Monthly Estimate
- **Netlify** : $0-19/mois (selon trafic)
- **Railway** : $5-20/mois (GNUBG service)
- **Supabase** : $0-25/mois (base de données)
- **Stripe** : 2.9% + $0.30 par transaction
- **Total** : **$10-64/mois maximum**

### Scaling Automatique
- **Pay-per-use** : Coût proportionnel utilisateurs
- **Auto-scaling** : Pas de gestion manuelle
- **Zero downtime** : Maintenance transparente

---

## 🚀 Lancement Immédiat

### En 30 minutes depuis n'importe quel ordinateur :

1. **GitHub Codespaces** → VS Code dans navigateur
2. **Supabase** → Base de données PostgreSQL en 2 minutes
3. **Netlify** → Frontend déployé automatiquement
4. **Railway** → GNUBG container Docker opérationnel

### Résultat : Application complète en production mondiale !

---

## 🤝 Contribution Cloud

Les contributions se font directement via **GitHub Codespaces** :

1. Fork du dépôt
2. Codespaces pour développement
3. Pull Request pour review
4. Déploiement automatique sur merge

---

## 📄 Licence

Ce projet est sous licence **MIT**.

---

## 🙏 Technologies Open Source

- **Netlify** : Serverless functions & CDN
- **Supabase** : PostgreSQL managé
- **Railway** : Container deployment
- **GNU Backgammon** : Moteur d'analyse
- **Stripe** : Paiements sécurisés

---

<div align="center">
  <strong>🌐 GammonGuru - Le backgammon moderne dans le cloud</strong>
  <br><br>
  <a href="https://gammon-guru.netlify.app">▶️ Jouer maintenant</a>
  •
  <a href="https://github.com/8888vtc-ui/gnubg-backend">📚 Documentation</a>
</div>
