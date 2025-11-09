import api from './api'

export interface GameOptions {
  mode: 'AI_VS_PLAYER' | 'PLAYER_VS_PLAYER' | 'TOURNAMENT'
  opponentId?: string
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD'
  timeControl?: 'BLITZ' | 'NORMAL' | 'LONG'
}

export interface Game {
  id: string
  whitePlayer: {
    id: string
    username: string
    elo: number
  }
  blackPlayer: {
    id: string
    username: string
    elo: number
  }
  boardState: string
  currentPlayer: 'white' | 'black'
  status: 'WAITING' | 'PLAYING' | 'FINISHED' | 'ABORTED'
  gameMode: string
  createdAt: string
  whiteScore: number
  blackScore: number
  winner?: 'white' | 'black' | 'draw'
}

export interface Move {
  from: number
  to: number
  die: number
  type: 'move' | 'hit' | 'bear_off'
}

export interface Analysis {
  equity: number
  winProbability: {
    white: number
    black: number
  }
  bestMove: string
  explanation: string
  alternatives: Array<{
    move: string
    equity: number
  }>
  pr: number // Performance Rating
}

export const gameService = {
  // Créer une nouvelle partie
  async createGame(options: GameOptions): Promise<{ success: boolean; data?: { game: Game }; error?: string }> {
    try {
      const response = await api.post('/game/create', {
        game_mode: options.mode,
        opponent_id: options.opponentId || null,
        difficulty: options.difficulty || 'MEDIUM',
        time_control: options.timeControl || 'NORMAL'
      })
      
      return {
        success: true,
        data: response.data
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la création de la partie'
      }
    }
  },

  // Obtenir le statut d'une partie
  async getGameStatus(gameId: string): Promise<{ success: boolean; data?: { game: Game; moves: Move[] }; error?: string }> {
    try {
      const response = await api.get(`/game/status?gameId=${gameId}`)
      
      return {
        success: true,
        data: response.data
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors du chargement de la partie'
      }
    }
  },

  // Lancer les dés
  async rollDice(gameId: string): Promise<{ success: boolean; data?: { dice: number[] }; error?: string }> {
    try {
      const response = await api.post(`/games/${gameId}/roll`)
      
      return {
        success: true,
        data: response.data
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors du lancer des dés'
      }
    }
  },

  // Effectuer un mouvement
  async makeMove(gameId: string, move: Move): Promise<{ success: boolean; data?: { game: Game }; error?: string }> {
    try {
      const response = await api.post(`/games/${gameId}/move`, {
        from: move.from,
        to: move.to,
        die: move.die,
        type: move.type
      })
      
      return {
        success: true,
        data: response.data
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors du mouvement'
      }
    }
  },

  // Obtenir les suggestions de l'IA
  async getSuggestions(gameId: string): Promise<{ success: boolean; data?: { suggestions: Move[] }; error?: string }> {
    try {
      const response = await api.get(`/games/${gameId}/suggestions`)
      
      return {
        success: true,
        data: response.data
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de l\'obtention des suggestions'
      }
    }
  },

  // Analyser une position avec GNUBG
  async analyzePosition(boardState: string, dice: number[], player: 'white' | 'black', analysisType: 'QUICK' | 'FULL' = 'FULL'): Promise<{ success: boolean; data?: Analysis; error?: string }> {
    try {
      const response = await api.post('/gnubg/analyze', {
        boardState,
        dice,
        player,
        analysisType
      })
      
      return {
        success: true,
        data: response.data
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de l\'analyse de la position'
      }
    }
  },

  // Obtenir une suggestion rapide
  async getHint(boardState: string, dice: number[], player: 'white' | 'black'): Promise<{ success: boolean; data?: { hint: string; explanation: string }; error?: string }> {
    try {
      const response = await api.post('/gnubg/hint', {
        boardState,
        dice,
        player
      })
      
      return {
        success: true,
        data: response.data
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de l\'obtention de la suggestion'
      }
    }
  },

  // Évaluer l'équité d'une position
  async evaluatePosition(boardState: string, player: 'white' | 'black'): Promise<{ success: boolean; data?: { equity: number; winProbability: number }; error?: string }> {
    try {
      const response = await api.post('/gnubg/evaluate', {
        boardState,
        player
      })
      
      return {
        success: true,
        data: response.data
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de l\'évaluation de la position'
      }
    }
  },

  // Abandonner la partie
  async resignGame(gameId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await api.post(`/games/${gameId}/resign`)
      
      return {
        success: true
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de l\'abandon de la partie'
      }
    }
  },

  // Proposer une nulle
  async proposeDraw(gameId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await api.post(`/games/${gameId}/draw`)
      
      return {
        success: true
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la proposition de nulle'
      }
    }
  },

  // Accepter/refuser une nulle
  async respondToDraw(gameId: string, accept: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      await api.put(`/games/${gameId}/draw`, { accept })
      
      return {
        success: true
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la réponse à la nulle'
      }
    }
  },

  // Obtenir l'historique des parties d'un utilisateur
  async getUserGames(limit: number = 20, offset: number = 0): Promise<{ success: boolean; data?: { games: Game[]; total: number }; error?: string }> {
    try {
      const response = await api.get(`/games?limit=${limit}&offset=${offset}`)
      
      return {
        success: true,
        data: response.data
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de l\'obtention de l\'historique des parties'
      }
    }
  },

  // Rejoindre une partie en attente
  async joinGame(gameId: string): Promise<{ success: boolean; data?: { game: Game }; error?: string }> {
    try {
      const response = await api.post(`/games/${gameId}/join`)
      
      return {
        success: true,
        data: response.data
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la rejointe de la partie'
      }
    }
  },

  // Quitter une partie (avant qu'elle ne commence)
  async leaveGame(gameId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await api.post(`/games/${gameId}/leave`)
      
      return {
        success: true
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors du départ de la partie'
      }
    }
  }
}

export default gameService
