# 🤖 AI Integration Guide

> **Claude & GPT-4 integration for pedagogical explanations**

---

## 🎯 Overview

GammonGuru uses AI (Claude 3.5 Sonnet or GPT-4) to generate pedagogical explanations for backgammon errors. The AI is called **only when**:
1. An error is detected (equity loss > threshold)
2. The error is not in ERROR_DATABASE.md
3. User has remaining AI quota (or is premium)

---

## 🔑 API Setup

### **Claude (Recommended)**

```typescript
// src/services/claude.ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY
});

export async function generateExplanation(
  context: ErrorContext
): Promise<ErrorExplanation> {
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: buildPrompt(context)
    }]
  });
  
  return parseResponse(response.content[0].text);
}
```

### **OpenAI (Alternative)**

```typescript
// src/services/openai.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generateExplanation(
  context: ErrorContext
): Promise<ErrorExplanation> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [{
      role: 'system',
      content: SYSTEM_PROMPT
    }, {
      role: 'user',
      content: buildPrompt(context)
    }],
    response_format: { type: 'json_object' }
  });
  
  return JSON.parse(response.choices[0].message.content);
}
```

---

## 📝 Prompt Engineering

### **System Prompt**

```typescript
const SYSTEM_PROMPT = `You are an expert backgammon coach with 20+ years of experience. Your role is to analyze errors and provide clear, pedagogical explanations.

Guidelines:
- Be kind and constructive, never judgmental
- Explain WHY the move was wrong, not just WHAT was wrong
- Adapt your language to the player's level (beginner/intermediate/advanced/expert)
- Use backgammon terminology correctly
- Focus on principles that apply beyond this specific position
- Keep explanations concise (3-4 sentences per section)

Output format: JSON with keys: situation, mistake, correctPlay, reasoning, principle, difficulty`;
```

### **User Prompt Template**

```typescript
function buildPrompt(context: ErrorContext): string {
  return `Analyze this backgammon error:

**Position**: ${context.positionType} (${context.pipCount[0]} vs ${context.pipCount[1]} pips)
**Dice**: ${context.dice.join('-')}
**Played Move**: ${context.playedMove} (equity: ${context.playedEquity})
**Best Move**: ${context.bestMove} (equity: ${context.bestEquity})
**Equity Loss**: ${context.equityLoss}
**Player Level**: ${context.playerLevel}

${context.gameContext ? `**Match Context**: ${context.gameContext.gameType}, score ${context.gameContext.score[0]}-${context.gameContext.score[1]}` : ''}

Provide a pedagogical explanation in JSON format with these keys:
- situation: Describe the position context (1-2 sentences)
- mistake: Explain what the player did wrong (1-2 sentences)
- correctPlay: Explain the better move (1-2 sentences)
- reasoning: Explain WHY the correct play is better (2-3 sentences)
- principle: State the general principle (1 sentence)
- difficulty: beginner | intermediate | advanced | expert

Adapt your language to the player's level: ${context.playerLevel}.`;
}
```

---

## 🎨 Response Parsing

```typescript
interface ErrorExplanation {
  situation: string;
  mistake: string;
  correctPlay: string;
  reasoning: string;
  principle: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

function parseResponse(text: string): ErrorExplanation {
  try {
    const json = JSON.parse(text);
    
    // Validate required fields
    const required = ['situation', 'mistake', 'correctPlay', 'reasoning', 'principle', 'difficulty'];
    for (const field of required) {
      if (!json[field]) {
        throw new Error(`Missing field: ${field}`);
      }
    }
    
    return json as ErrorExplanation;
  } catch (error) {
    logger.error('Failed to parse AI response:', error);
    throw new Error('Invalid AI response format');
  }
}
```

---

## 💾 Caching Strategy

```typescript
// src/services/aiAnalyzer.ts
import { createHash } from 'crypto';

function generateCacheKey(context: ErrorContext): string {
  // Create a unique key based on position + error
  const data = `${context.boardState}:${context.playedMove}:${context.bestMove}`;
  return createHash('sha256').update(data).digest('hex');
}

export async function analyzeError(
  context: ErrorContext
): Promise<{ explanation: ErrorExplanation; cached: boolean }> {
  const cacheKey = generateCacheKey(context);
  
  // 1. Check ERROR_DATABASE.md
  const staticError = findMatchingError(context);
  if (staticError) {
    return { explanation: staticError, cached: true };
  }
  
  // 2. Check database cache
  const cachedExplanation = await db.query(
    'SELECT explanation FROM analyses WHERE cache_key = $1',
    [cacheKey]
  );
  
  if (cachedExplanation.rows.length > 0) {
    return { 
      explanation: cachedExplanation.rows[0].explanation,
      cached: true 
    };
  }
  
  // 3. Check user quota
  const quota = await checkQuota(context.userId);
  if (quota.remaining === 0 && !quota.isPremium) {
    throw new QuotaExceededError();
  }
  
  // 4. Call AI
  const explanation = await generateExplanation(context);
  
  // 5. Cache in database
  await db.query(
    'INSERT INTO analyses (cache_key, explanation, created_at) VALUES ($1, $2, NOW())',
    [cacheKey, explanation]
  );
  
  // 6. Decrement quota
  if (!quota.isPremium) {
    await decrementQuota(context.userId);
  }
  
  return { explanation, cached: false };
}
```

---

## 💰 Cost Management

### **Pricing (as of 2025)**

| Model | Input (per 1M tokens) | Output (per 1M tokens) | Avg Cost/Analysis |
|-------|----------------------|------------------------|-------------------|
| Claude 3.5 Sonnet | $3.00 | $15.00 | ~$0.01 |
| GPT-4 Turbo | $10.00 | $30.00 | ~$0.03 |

### **Cost Optimization**

```typescript
// 1. Limit token usage
const MAX_TOKENS = 1024; // ~$0.015 per call

// 2. Batch requests (if possible)
async function analyzeBatch(errors: ErrorContext[]): Promise<ErrorExplanation[]> {
  // Combine multiple errors in one API call
}

// 3. Monitor costs
async function trackCost(userId: string, cost: number) {
  await db.query(
    'INSERT INTO ai_costs (user_id, cost, timestamp) VALUES ($1, $2, NOW())',
    [userId, cost]
  );
}

// 4. Set monthly budget
const MONTHLY_BUDGET = 1000; // $1000/month
const currentSpend = await getMonthlySpend();
if (currentSpend >= MONTHLY_BUDGET) {
  throw new Error('Monthly AI budget exceeded');
}
```

---

## 🧪 Testing

### **Mock AI Responses**

```typescript
// tests/mocks/ai.mock.ts
export const mockExplanation: ErrorExplanation = {
  situation: "Running game with pip count advantage",
  mistake: "You broke your advanced anchor too early",
  correctPlay: "Maintain pressure by keeping the 8-point",
  reasoning: "In a running game with a lead, each advanced point you hold forces your opponent to play more pips",
  principle: "In racing positions: Keep advanced points > Make inner board points",
  difficulty: "intermediate"
};

vi.mock('../src/services/claude', () => ({
  generateExplanation: vi.fn(() => Promise.resolve(mockExplanation))
}));
```

### **Integration Tests**

```typescript
describe('AI Integration', () => {
  it('should generate explanation for novel error', async () => {
    const context: ErrorContext = {
      boardState: '...',
      playedMove: '8/5 6/5',
      bestMove: '13/10 6/5',
      equityLoss: 0.055,
      playerLevel: 'intermediate'
    };
    
    const result = await analyzeError(context);
    
    expect(result.explanation).toHaveProperty('situation');
    expect(result.explanation).toHaveProperty('mistake');
    expect(result.cached).toBe(false);
  });
  
  it('should use cached explanation', async () => {
    // First call
    await analyzeError(context);
    
    // Second call (should be cached)
    const result = await analyzeError(context);
    expect(result.cached).toBe(true);
  });
});
```

---

## 🔄 Fallback Strategy

```typescript
export async function analyzeErrorWithFallback(
  context: ErrorContext
): Promise<ErrorExplanation> {
  try {
    // Try Claude first
    return await generateExplanationClaude(context);
  } catch (error) {
    logger.warn('Claude API failed, trying GPT-4:', error);
    
    try {
      // Fallback to GPT-4
      return await generateExplanationGPT4(context);
    } catch (error2) {
      logger.error('Both AI APIs failed:', error2);
      
      // Final fallback: generic explanation
      return {
        situation: "Error detected in your play",
        mistake: `You played ${context.playedMove} which lost ${context.equityLoss.toFixed(3)} equity`,
        correctPlay: `The best move was ${context.bestMove}`,
        reasoning: "This move maintains a better position according to GNUBG analysis",
        principle: "Always consider equity when making decisions",
        difficulty: context.playerLevel
      };
    }
  }
}
```

---

## 📊 Monitoring

```typescript
// Track AI usage
interface AIMetrics {
  totalCalls: number;
  cachedCalls: number;
  cacheHitRate: number;
  averageCost: number;
  totalCost: number;
  errorRate: number;
}

export async function getAIMetrics(
  startDate: Date,
  endDate: Date
): Promise<AIMetrics> {
  const result = await db.query(`
    SELECT 
      COUNT(*) as total_calls,
      SUM(CASE WHEN cached THEN 1 ELSE 0 END) as cached_calls,
      AVG(cost) as average_cost,
      SUM(cost) as total_cost
    FROM ai_analyses
    WHERE created_at BETWEEN $1 AND $2
  `, [startDate, endDate]);
  
  return {
    totalCalls: result.rows[0].total_calls,
    cachedCalls: result.rows[0].cached_calls,
    cacheHitRate: result.rows[0].cached_calls / result.rows[0].total_calls,
    averageCost: result.rows[0].average_cost,
    totalCost: result.rows[0].total_cost,
    errorRate: 0 // Calculate from error logs
  };
}
```

---

<div align="center">

**AI-Powered Pedagogy - Smart, Cached, Cost-Effective**

</div>
