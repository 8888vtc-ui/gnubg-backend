# 🎲 GammonGuru Backend

> Backend pédagogique pour l'apprentissage du backgammon par l'analyse d'erreurs

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.1-lightgrey.svg)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🎯 Qu'est-ce que GammonGuru ?

**GammonGuru** est un backend REST conçu pour aider les joueurs de backgammon à progresser en analysant leurs erreurs de jeu. Contrairement aux assistants traditionnels, GammonGuru n'offre **aucune aide pendant la partie** : il analyse vos coups **après coup** et vous explique pourquoi certains choix étaient sous-optimaux.

### 🧠 Philosophie

- **Pas d'aide pendant le jeu** : Vous jouez seul, sans suggestions en temps réel
- **Apprentissage par l'erreur** : Chaque erreur devient une opportunité d'apprentissage
- **Explications pédagogiques** : Des analyses claires et bienveillantes générées par IA
- **Interface sobre** : Concentration maximale pendant le jeu, richesse pédagogique après

> 📘 Pour en savoir plus sur notre vision, consultez [PHILOSOPHY.md](docs/PHILOSOPHY.md)

---

## ✨ Fonctionnalités Principales

### 🔍 Validation de Coups
- Validation technique via **GNU Backgammon (GNUBG)**
- Calcul d'equity, PR (Performance Rating), et ELO
- Identification des coups alternatifs et de leur impact

### 🤖 Analyse Pédagogique
- Explications générées par **Claude API** ou **GPT-4**
- Base de données d'erreurs communes pré-analysées
- Ton bienveillant et constructif adapté au niveau du joueur

### 🎁 Système Freemium
- **Gratuit** : 5 analyses IA par mois
- **Premium** : Analyses illimitées
- Anti-fraude : tracking IP + device fingerprinting

### 📊 Métriques de Progression
- Historique des erreurs analysées
- Statistiques de performance
- Identification des points faibles

---

## 🚀 Quick Start

### Prérequis

- **Node.js** 20+ ([Télécharger](https://nodejs.org/))
- **GNU Backgammon** ([Télécharger](https://www.gnu.org/software/gnubg/))
- **Clé API Claude** ou **OpenAI** (optionnel pour le MVP)

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/8888vtc-ui/gnubg-backend.git
cd gnubg-backend

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos clés API

# Vérifier que GNUBG est accessible
gnubg --version

# Lancer le serveur en mode développement
npm run dev
```

Le serveur démarre sur `http://localhost:3000`

### Premier Test

```bash
# Valider un coup
curl -X POST http://localhost:3000/api/validate-move \
  -H "Content-Type: application/json" \
  -d '{
    "boardState": "4HPwATDgc/ABMA:cIkKAQAAAAAAA",
    "move": "8/5 6/5",
    "dice": [3, 1]
  }'
```

---

## 🏗️ Stack Technique

| Composant | Technologie | Rôle |
|-----------|-------------|------|
| **Runtime** | Node.js 20+ | Environnement d'exécution |
| **Langage** | TypeScript 5.9 | Typage statique |
| **Framework** | Express.js 5.1 | API REST |
| **Moteur d'analyse** | GNU Backgammon | Validation et calculs |
| **IA** | Claude 3.5 / GPT-4 | Explications pédagogiques |
| **Base de données** | PostgreSQL (à venir) | Stockage utilisateurs et analyses |
| **Cache** | Redis (à venir) | Cache des explications |

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [PHILOSOPHY.md](docs/PHILOSOPHY.md) | Vision et principes pédagogiques |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Architecture technique détaillée |
| [API.md](docs/API.md) | Documentation des endpoints REST |
| [GNUBG_INTEGRATION.md](docs/GNUBG_INTEGRATION.md) | Guide d'intégration GNUBG CLI |
| [ERROR_DATABASE.md](docs/ERROR_DATABASE.md) | Base d'erreurs communes |
| [AI_INTEGRATION.md](docs/AI_INTEGRATION.md) | Intégration Claude/GPT-4 |
| [DEVELOPMENT.md](docs/DEVELOPMENT.md) | Guide pour développeurs |
| [TESTING.md](docs/TESTING.md) | Stratégie de tests |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Guide de déploiement |
| [ROADMAP.md](docs/ROADMAP.md) | Feuille de route technique |

---

## 🎯 Exemples d'Utilisation

### Valider un Coup

```typescript
POST /api/validate-move

{
  "boardState": "4HPwATDgc/ABMA:cIkKAQAAAAAAA",
  "move": "8/5 6/5",
  "dice": [3, 1]
}

// Réponse
{
  "isValid": true,
  "equity": -0.234,
  "pr": 0.045,
  "bestMove": "8/5 6/5",
  "alternatives": [
    {
      "move": "13/10 6/5",
      "equity": -0.289,
      "equityLoss": 0.055
    }
  ]
}
```

### Analyser une Erreur

```typescript
POST /api/analyze-error

{
  "boardState": "4HPwATDgc/ABMA:cIkKAQAAAAAAA",
  "playedMove": "8/5 6/5",
  "bestMove": "13/10 6/5",
  "equityLoss": 0.055,
  "userId": "user123"
}

// Réponse
{
  "explanation": {
    "situation": "Position de course avec avance au pip count",
    "mistake": "Vous avez cassé votre point avancé trop tôt",
    "correctPlay": "Maintenir la pression en gardant le point",
    "reasoning": "En course, chaque point avancé ralentit l'adversaire...",
    "difficulty": "intermediate"
  },
  "quotaRemaining": 4,
  "cached": false
}
```

> 📖 Plus d'exemples dans [docs/examples/api-requests.md](docs/examples/api-requests.md)

---

## 🧪 Tests

```bash
# Lancer tous les tests
npm test

# Tests avec couverture
npm run test:coverage

# Tests en mode watch
npm run test:watch
```

---

## 🛠️ Développement

```bash
# Mode développement avec hot-reload
npm run dev

# Linter
npm run lint

# Formater le code
npm run format

# Build de production
npm run build

# Lancer en production
npm start
```

---

## 🗺️ Roadmap

### ✅ Phase 1 : MVP (En cours)
- [x] Setup projet TypeScript
- [ ] Intégration GNUBG CLI
- [ ] Endpoints REST de base
- [ ] Intégration Claude API
- [ ] Système de quotas simple

### 🚧 Phase 2 : Production-Ready
- [ ] Base de données PostgreSQL
- [ ] Authentification utilisateurs
- [ ] Cache Redis
- [ ] Tests d'intégration
- [ ] CI/CD
- [ ] Déploiement

### 🔮 Phase 3 : Fonctionnalités Avancées
- [ ] Quiz pédagogiques
- [ ] Historique des parties
- [ ] Statistiques de progression
- [ ] Export PDF
- [ ] API publique

> 📅 Roadmap complète : [ROADMAP.md](docs/ROADMAP.md)

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Consultez [CONTRIBUTING.md](docs/CONTRIBUTING.md) pour :

- 📋 Règles de contribution
- 🎨 Standards de code
- 🧪 Processus de validation
- 💬 Communication avec l'équipe

---

## 📄 Licence

Ce projet est sous licence **MIT**. Voir [LICENSE](LICENSE) pour plus de détails.

---

## 🙏 Remerciements

- **GNU Backgammon Team** : Pour le moteur d'analyse open-source
- **Anthropic** : Pour l'API Claude
- **Communauté Backgammon** : Pour les retours et suggestions

---

## 📞 Contact

- **GitHub** : [8888vtc-ui/gnubg-backend](https://github.com/8888vtc-ui/gnubg-backend)
- **Issues** : [Signaler un bug](https://github.com/8888vtc-ui/gnubg-backend/issues)
- **Discussions** : [Forum du projet](https://github.com/8888vtc-ui/gnubg-backend/discussions)

---

<div align="center">
  <strong>Fait avec ❤️ pour la communauté backgammon</strong>
</div>
