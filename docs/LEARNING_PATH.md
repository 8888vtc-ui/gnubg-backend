# 🎓 GammonGuru Learning Path - Du Débutant au Développeur

> **4 semaines pour passer de zéro à ton premier MVP, avec validation automatique et mode "Zéro Erreur"**

---

## 🌟 Introduction

Bienvenue ! Tu vas créer **GammonGuru**, un projet ambitieux. **Oui, c'est complexe. Oui, tu es débutant. Et OUI, tu vas y arriver !**

### 🎯 Ce qui rend ce Learning Path unique

- ✅ **Validation automatique** : L'IA vérifie chaque étape
- ✅ **Double test** : Tu prouves que tu as compris
- ✅ **Mode "Zéro Erreur"** : Jamais bloqué
- ✅ **Gamification** : Points, badges, progression visible

### 📊 Ta Progression

```
Semaine 1 : Fondations        ░░░░░░░░░░ 0%
Semaine 2 : API & Backend     ░░░░░░░░░░ 0%
Semaine 3 : Base de Données   ░░░░░░░░░░ 0%
Semaine 4 : GNUBG & MVP       ░░░░░░░░░░ 0%

Points : 0/1000 💎 | Badges : 0/12 🏆
```

---

## 🗓️ SEMAINE 1 : FONDATIONS

### 📅 Jour 1 : Installation (Lundi) ⏱️ 2-3h

**Objectif** : Environnement 100% fonctionnel

**Tâches :**
1. Installer Node.js LTS (nodejs.org)
2. Installer VS Code + extensions (ESLint, Prettier)
3. Installer Git
4. `npm install` dans le projet
5. Créer `.env.local`

**✅ Validation 1 (Auto)** : `node --version`, `npm --version`, `git --version`  
**✅ Validation 2 (Compréhension)** : Explique ce que fait `npm install`

**🏆 Récompenses** : 30 points + Badge "🔧 Setup Master"

---

### 📅 Jour 2 : TypeScript Types (Mardi) ⏱️ 3-4h

**Objectif** : Créer tes premiers types

**Tâches :**
1. Créer `src/types/player.ts` avec interface Player
2. Créer `src/types/game.ts` avec interface Game
3. Créer fonctions `createPlayer()` et `createGame()`

**✅ Validation 1** : Compilation TypeScript sans erreur  
**✅ Validation 2** : Crée un nouveau type "Move"

**🏆 Récompenses** : 30 points + Badge "📐 Type Master"

---

### 📅 Jour 3 : Modules (Mercredi) ⏱️ 3-4h

**Objectif** : Fonctions utilitaires

**Tâches :**
1. Créer `src/utils/logger.ts`
2. Créer `src/utils/validator.ts`
3. Créer `src/utils/helper.ts`

**✅ Validation 1** : Tests unitaires passent  
**✅ Validation 2** : Crée un module "Calculator"

**🏆 Récompenses** : 30 points + Badge "🔧 Module Master"

---

### 📅 Jour 4 : Premier Serveur (Jeudi) ⏱️ 4-5h

**Objectif** : Lancer ton API

**Tâches :**
1. Créer `src/server.ts` avec Express
2. Route GET `/health`
3. Route GET `/`
4. Lancer avec `npm run dev`

**✅ Validation 1** : `curl localhost:3000` répond  
**✅ Validation 2** : Ajoute route `/api/status`

**🏆 Récompenses** : 30 points + Badge "🚀 API Starter"

---

### 📅 Jour 5 : Routes & Middleware (Vendredi) ⏱️ 4-5h

**Objectif** : Structurer l'API

**Tâches :**
1. Créer middleware logging
2. Créer middleware errorHandler
3. Créer routes `/api/players` (GET, POST)

**✅ Validation 1** : Tests API passent  
**✅ Validation 2** : Ajoute route DELETE

**🏆 Récompenses** : 30 points + Badge "🎯 API Hero" + Bonus 100 points

---

## 🎉 CHECKPOINT SEMAINE 1

**Progression** : 250/1000 points | 5/12 badges

**Compétences acquises** :
- ✅ TypeScript de base
- ✅ Serveur Express
- ✅ Routes et middleware

**Prêt pour la Semaine 2 ?** → Base de données !

---

## 🗓️ SEMAINE 2 : BASE DE DONNÉES

### 📅 Jour 6-7 : PostgreSQL (Weekend) ⏱️ 6-8h

**Objectif** : Connecter une vraie DB

**Tâches :**
1. Installer PostgreSQL
2. Créer base `gammonguru_dev`
3. Créer table `users`
4. Installer `pg` library
5. Créer `playerRepository.ts`
6. Intégrer dans les routes

**✅ Validation 1** : Données sauvegardées en DB  
**✅ Validation 2** : Explique les requêtes SQL

**🏆 Récompenses** : 60 points + Badge "🗄️ DB Wizard"

---

## 🗓️ SEMAINE 3 : GNUBG INTEGRATION

### 📅 Jour 8-10 : GNUBG CLI (3 jours) ⏱️ 12h

**Objectif** : Intégrer GNUBG

**Tâches :**
1. Installer GNUBG
2. Créer `gnubgRunner.ts`
3. Tester commandes CLI
4. Parser les résultats
5. Créer routes `/api/gnubg/hint`

**✅ Validation 1** : GNUBG répond correctement  
**✅ Validation 2** : Explique le parsing

**🏆 Récompenses** : 90 points + Badge "🎮 GNUBG Master"

---

## 🗓️ SEMAINE 4 : MVP

### 📅 Jour 11-14 : Premier MVP (4 jours) ⏱️ 16h

**Objectif** : Partie jouable vs GNUBG

**Tâches :**
1. Créer logique de partie
2. Intégrer GNUBG comme adversaire
3. Sauvegarder les parties
4. Tests end-to-end

**✅ Validation 1** : Partie complète jouable  
**✅ Validation 2** : Démo à l'IA

**🏆 Récompenses** : 120 points + Badge "🏆 MVP Creator"

---

## 🎉 FÉLICITATIONS !

**Tu as terminé le Learning Path !**

**Points finaux** : 1000/1000 💎  
**Badges** : 12/12 🏆

**Tu es maintenant capable de :**
- ✅ Développer une API complète
- ✅ Gérer une base de données
- ✅ Intégrer des outils externes
- ✅ Créer un MVP fonctionnel

**Prochaine étape** : Frontend Vue 3 !

---

## 📚 Ressources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [PostgreSQL Tutorial](https://www.postgresql.org/docs/)
- [GNUBG Manual](https://www.gnu.org/software/gnubg/manual/)

---

**Chaque jour est une victoire. Tu progresses en sécurité avec ton mode "Zéro Erreur" !**
