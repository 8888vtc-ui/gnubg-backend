/**
 * Service API Game - Priorité production
 * Utilise la nouvelle configuration API pour Railway
 */

import { apiClient } from '@/config/api.config.js'

export const gameApiService = {
  // Priorité 1: Créer une partie contre GNUBG
  async createGnubgGame(difficulty = 'EXPERT', playerColor = 'white') {
    try {
      const response = await fetch(`${apiClient.baseURL}/api/game/create-gnubg`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ difficulty, playerColor })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create GNUBG game');
      }
      
      return {
        success: true,
        data: {
          game: data.game
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  },

  // GNUBG AI Move
  async getGnubgMove(gameId, boardState, dice, difficulty = 'EXPERT') {
    try {
      const response = await fetch(`${apiClient.baseURL}/api/game/gnubg-move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ gameId, boardState, dice, difficulty })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get GNUBG move');
      }
      
      return {
        success: true,
        data: {
          move: data.move,
          thinkingTime: data.thinkingTime
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  },

  // GNUBG Move Suggestions
  async getMoveSuggestions(boardState, dice, playerColor = 'white') {
    try {
      const response = await fetch(`${apiClient.baseURL}/api/gnubg/move-suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ boardState, dice, playerColor })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get move suggestions');
      }
      
      return {
        success: true,
        data: {
          suggestions: data.suggestions,
          analysisTime: data.analysisTime
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  },

  // GNUBG Position Evaluation
  async evaluatePosition(boardState, playerColor = 'white') {
    try {
      const response = await fetch(`${apiClient.baseURL}/api/gnubg/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ boardState, playerColor })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to evaluate position');
      }
      
      return {
        success: true,
        data: {
          evaluation: data.evaluation,
          playerColor: data.playerColor
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Priorité 1: Créer une partie
  async createGame(mode = 'AI_VS_PLAYER', difficulty = 'MEDIUM') {
    try {
      const response = await apiClient.createGame(mode, difficulty)
      return {
        success: true,
        data: {
          game: {
            id: response.game.id,
            mode: response.game.mode,
            status: response.game.status,
            boardState: response.game.board,
            currentPlayer: response.game.currentPlayer,
            dice: response.game.dice,
            createdAt: response.game.createdAt
          }
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Priorité 1: Obtenir le statut d'une partie
  async getGameStatus(gameId) {
    try {
      const response = await apiClient.getGameStatus(gameId)
      return {
        success: true,
        data: {
          game: response.game
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Priorité 1: Lancer les dés
  async rollDice(gameId) {
    try {
      const response = await apiClient.rollDice(gameId)
      return {
        success: true,
        data: {
          dice: response.dice,
          canMove: response.canMove
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Priorité 1: Faire un mouvement
  async makeMove(gameId, from, to) {
    try {
      const response = await apiClient.makeMove(gameId, from, to)
      return {
        success: true,
        data: {
          move: response.move,
          board: response.board
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Priorité 2: Analyse GNUBG
  async analyzePosition(boardState, dice, analysisType = 'BEST_MOVE') {
    try {
      const response = await apiClient.analyzePosition(boardState, dice, analysisType)
      return {
        success: true,
        data: {
          bestMove: response.bestMove,
          evaluation: response.evaluation,
          processingTime: response.processingTime,
          difficulty: response.difficulty
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Priorité monitoring: Health check
  async healthCheck() {
    try {
      const response = await apiClient.healthCheck()
      return {
        success: true,
        data: response
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Priorité 2: Obtenir l'historique des parties
  async getGameHistory(userId) {
    // Mock pour demain matin - sera implémenté avec Supabase
    return {
      success: true,
      data: {
        games: [
          {
            id: 'demo_game_1',
            opponent: 'AI Expert',
            result: 'win',
            score: '3-1',
            duration: '15 min',
            date: new Date().toISOString()
          },
          {
            id: 'demo_game_2', 
            opponent: 'AI Medium',
            result: 'loss',
            score: '2-3',
            duration: '22 min',
            date: new Date(Date.now() - 86400000).toISOString()
          }
        ]
      }
    }
  }
}

export default gameApiService
