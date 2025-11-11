// Type declarations for custom modules
declare module './security-middleware' {
  export const rateLimits: any;
  export const speedLimit: any;
  export const sanitizeInput: any;
  export const requestSizeLimits: any;
  export const securityHeaders: any;
  export const compressionConfig: any;
  export const requestTimeout: any;
  export const auditLog: any;
  export const validationRules: any;
}

declare module './cache-service' {
  export const cacheService: any;
  export const CACHE_KEYS: any;
  export const CACHE_TTL: any;
  export const performanceMetrics: any;
}

declare module './language-manager' {
  export class LanguageManager {
    detectLanguage(req: any): string;
    getTranslatedContent(key: string, language: string): any;
    getSupportedLanguages(): any;
    setUserLanguage(userId: string, language: string): Promise<string>;
    getUserLanguage(userId: string): Promise<string | null>;
  }
  export const SUPPORTED_LANGUAGES: any;
  export const TRANSLATED_RULES: any;
  export const REGION_LANGUAGE_MAP: any;
}

declare module './backgammon-coach' {
  export class BackgammonCoach {
    getRuleExplanation(ruleKey: string): any;
    getLearningCurriculum(): any;
    getTutorialScenario(index: number): any;
    validateMoveWithFeedback(board: any, move: any, player: string, dice: number[]): any;
    generateProgressReport(userId: string, completedLessons: string[], gamesPlayed: number, winRate: number): any;
    getNextRecommendedLesson(completedLessons: string[]): string;
    getUnlockedAchievements(lessons: string[], games: number, winRate: number): string[];
    calculateLearningStreak(completedLessons: string[]): number;
    assessSkillLevel(games: number, winRate: number): string;
  }
  export const BACKGAMMON_RULES: any;
  export const LEARNING_MODULES: any;
  export const TUTORIAL_SCENARIOS: any;
}
