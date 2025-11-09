/**
 * Claude AI Service - GammonGuru Intelligent Assistant
 * Integrates Anthropic Claude API for backgammon analysis and coaching
 */

const Anthropic = require('@anthropic-ai/sdk');

class ClaudeService {
  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
    
    this.systemPrompt = `Tu es un expert du backgammon et un entraîneur IA pour GammonGuru. 

Ta mission:
- Analyser les positions de backgammon avec précision
- Donner des conseils stratégiques personnalisés
- Expliquer les décisions de manière claire et pédagogique
- Adapter ton niveau d'explication au joueur (débutant à expert)
- Utiliser les données GNUBG pour enrichir tes analyses

Style:
- Encourageant et positif
- Précis et technique quand nécessaire
- Toujours constructif
- En français (sauf demande contraire)

Format de réponse:
- Analyse concise (2-3 points max)
- Suggestions concrètes
- Explication du "pourquoi"
- Conseil d'amélioration`;
  }

  /**
   * Analyze a backgammon position using Claude
   */
  async analyzePosition(boardState, dice, playerLevel = 'INTERMEDIATE') {
    try {
      const prompt = this.buildPositionPrompt(boardState, dice, playerLevel);
      
      const response = await this.client.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        system: this.systemPrompt,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });
      
      return this.parseAnalysisResponse(response.content[0].text);
      
    } catch (error) {
      console.error('Claude analysis error:', error);
      return this.getFallbackAnalysis(boardState, dice);
    }
  }

  /**
   * Get move suggestions from Claude
   */
  async getMoveSuggestions(boardState, dice, availableMoves, playerLevel = 'INTERMEDIATE') {
    try {
      const prompt = this.buildMovePrompt(boardState, dice, availableMoves, playerLevel);
      
      const response = await this.client.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 800,
        system: this.systemPrompt,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });
      
      return this.parseMoveResponse(response.content[0].text);
      
    } catch (error) {
      console.error('Claude move suggestion error:', error);
      return this.getFallbackMoves(availableMoves);
    }
  }

  /**
   * Coach player based on their game history
   */
  async coachPlayer(playerStats, recentGames, improvementAreas = []) {
    try {
      const prompt = this.buildCoachingPrompt(playerStats, recentGames, improvementAreas);
      
      const response = await this.client.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1200,
        system: this.systemPrompt,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });
      
      return this.parseCoachingResponse(response.content[0].text);
      
    } catch (error) {
      console.error('Claude coaching error:', error);
      return this.getFallbackCoaching(playerStats);
    }
  }

  /**
   * Chat with Claude for backgammon questions
   */
  async chatWithClaude(message, gameContext = null, playerLevel = 'INTERMEDIATE') {
    try {
      const prompt = this.buildChatPrompt(message, gameContext, playerLevel);
      
      const response = await this.client.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 800,
        system: this.systemPrompt,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });
      
      return {
        success: true,
        response: response.content[0].text,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Claude chat error:', error);
      return {
        success: false,
        response: "Désolé, je ne peux pas répondre pour le moment. Réessayez plus tard.",
        error: error.message
      };
    }
  }

  /**
   * Analyze completed game for insights
   */
  async analyzeGame(gameData, playerMoves, gnubgAnalysis = null) {
    try {
      const prompt = this.buildGameAnalysisPrompt(gameData, playerMoves, gnubgAnalysis);
      
      const response = await this.client.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1500,
        system: this.systemPrompt,
        messages: [
          {
            role: 'user',
          content: prompt
          }
        ]
      });
      
      return this.parseGameAnalysisResponse(response.content[0].text);
      
    } catch (error) {
      console.error('Claude game analysis error:', error);
      return this.getFallbackGameAnalysis(gameData);
    }
  }

  /**
   * Build prompts for different use cases
   */
  buildPositionPrompt(boardState, dice, playerLevel) {
    return `Analyse cette position de backgammon:

Niveau du joueur: ${playerLevel}
Dés disponibles: ${dice ? dice.join(', ') : 'Non lancés'}
État du plateau: ${JSON.stringify(boardState)}

Fournis:
1. Évaluation de la position (0-100%)
2. 2-3 points clés à considérer
3. Suggestion prioritaire
4. Erreurs à éviter

Sois concis et actionnable.`;
  }

  buildMovePrompt(boardState, dice, availableMoves, playerLevel) {
    return `Meilleurs coups possibles:

Niveau: ${playerLevel}
Dés: ${dice.join(', ')}
Coups disponibles: ${JSON.stringify(availableMoves)}

Classe les 3 meilleurs coups avec:
1. Score de qualité (0-100)
2. Raison principale
3. Risque potentiel

Format: [Score] Coup: Raison`;
  }

  buildCoachingPrompt(playerStats, recentGames, improvementAreas) {
    return `Coaching personnalisé:

Stats joueur: ${JSON.stringify(playerStats)}
Parties récentes: ${recentGames.length} parties
Axes d'amélioration: ${improvementAreas.join(', ')}

Donne 3 conseils personnalisés:
1. Pour la prochaine partie
2. Pour la progression à long terme
3. Pour la mentalité de jeu

Sois motivant et précis.`;
  }

  buildChatPrompt(message, gameContext, playerLevel) {
    let prompt = `Question (${playerLevel}): ${message}`;
    
    if (gameContext) {
      prompt += `\n\nContexte de jeu: ${JSON.stringify(gameContext)}`;
    }
    
    return prompt;
  }

  buildGameAnalysisPrompt(gameData, playerMoves, gnubgAnalysis) {
    return `Analyse de partie complète:

Données: ${JSON.stringify(gameData)}
Coups joués: ${playerMoves.length} mouvements
Analyse GNUBG: ${gnubgAnalysis ? 'Disponible' : 'Non disponible'}

Fournis:
1. Résumé de la partie
2. Points forts du joueur
3. Axes d'amélioration principaux
4. 2-3 leçons retenues
5. Objectif pour la prochaine partie`;
  }

  /**
   * Parse response methods
   */
  parseAnalysisResponse(response) {
    return {
      success: true,
      analysis: response,
      timestamp: new Date().toISOString(),
      type: 'position_analysis'
    };
  }

  parseMoveResponse(response) {
    // Parse structured move suggestions
    const moves = [];
    const lines = response.split('\n').filter(line => line.trim());
    
    lines.forEach(line => {
      const match = line.match(/\[(\d+)\]\s*(.+?):\s*(.+)/);
      if (match) {
        moves.push({
          score: parseInt(match[1]),
          move: match[2].trim(),
          reason: match[3].trim()
        });
      }
    });
    
    return {
      success: true,
      suggestions: moves,
      rawResponse: response,
      timestamp: new Date().toISOString()
    };
  }

  parseCoachingResponse(response) {
    return {
      success: true,
      coaching: response,
      timestamp: new Date().toISOString(),
      type: 'personal_coaching'
    };
  }

  parseGameAnalysisResponse(response) {
    return {
      success: true,
      analysis: response,
      timestamp: new Date().toISOString(),
      type: 'game_analysis'
    };
  }

  /**
   * Fallback methods when Claude API fails
   */
  getFallbackAnalysis(boardState, dice) {
    return {
      success: false,
      analysis: "Analyse temporairement indisponible. Utilisez l'analyse GNUBG en attendant.",
      fallback: true,
      timestamp: new Date().toISOString()
    };
  }

  getFallbackMoves(availableMoves) {
    return {
      success: false,
      suggestions: availableMoves.slice(0, 3).map((move, index) => ({
        score: 70 - index * 10,
        move: move.description || `Move ${index + 1}`,
        reason: "Suggestion par défaut"
      })),
      fallback: true,
      timestamp: new Date().toISOString()
    };
  }

  getFallbackCoaching(playerStats) {
    return {
      success: false,
      coaching: `Continuez à pratiquer régulièrement! Basé sur vos stats: ${playerStats.winRate || 50}% de victoires. Focus sur la sécurité des pions et l'utilisation du cube.`,
      fallback: true,
      timestamp: new Date().toISOString()
    };
  }

  getFallbackGameAnalysis(gameData) {
    return {
      success: false,
      analysis: "Analyse de partie temporairement indisponible. Consultez l'historique des mouvements pour votre analyse personnelle.",
      fallback: true,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Health check for Claude API
   */
  async healthCheck() {
    try {
      const response = await this.client.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 10,
        messages: [
          {
            role: 'user',
            content: 'Test'
          }
        ]
      });
      
      return {
        status: 'healthy',
        response_time: Date.now(),
        available: true
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        available: false
      };
    }
  }
}

// Singleton instance
const claudeService = new ClaudeService();

module.exports = claudeService;
