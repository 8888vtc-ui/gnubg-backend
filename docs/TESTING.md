# 🧪 Testing Strategy

> **Comprehensive testing guide for GammonGuru**

---

## 🎯 Testing Philosophy

- **Test behavior, not implementation**
- **90% coverage on backend, 80% on frontend**
- **Fast unit tests, thorough integration tests**
- **E2E tests for critical user flows**

---

## 🏗️ Testing Stack

| Layer | Tool | Purpose |
|-------|------|---------|
| Unit Tests | Vitest | Fast, isolated tests |
| Integration Tests | Supertest | API endpoint testing |
| E2E Tests | Playwright | Full user flows |
| Mocking | Vitest mocks | Isolate dependencies |
| Coverage | c8 | Code coverage reports |

---

## 🧩 Unit Tests

### **GNUBG Runner**

```typescript
// tests/cli/gnubgRunner.test.ts
import { describe, it, expect, vi } from 'vitest';
import { executeGNUBGCommand, parseHintOutput } from '../../src/cli/gnubgRunner';

describe('gnubgRunner', () => {
  it('should execute hint command', async () => {
    const output = await executeGNUBGCommand(['new game', 'set dice 3 1', 'hint']);
    expect(output).toContain('Equity:');
  });

  it('should parse hint output correctly', () => {
    const output = `
      1. 8/5 6/5                      Equity: -0.234 (0.000)
      2. 13/10 6/5                    Equity: -0.289 (-0.055)
    `;
    
    const moves = parseHintOutput(output);
    
    expect(moves).toHaveLength(2);
    expect(moves[0]).toEqual({
      rank: 1,
      move: '8/5 6/5',
      equity: -0.234,
      equityLoss: 0
    });
  });

  it('should handle GNUBG timeout', async () => {
    await expect(
      executeGNUBGCommand(['analyse match'], { timeout: 100 })
    ).rejects.toThrow('timeout');
  });
});
```

### **Board Converter**

```typescript
// tests/utils/converter.test.ts
describe('Board Converter', () => {
  it('should convert JSON to Position ID', () => {
    const board = {
      points: [2, 0, 0, 0, 0, -5, 0, -3, 0, 0, 0, 5, /* ... */],
      bar: [0, 0],
      off: [0, 0]
    };
    
    const positionID = boardToPositionID(board);
    expect(positionID).toMatch(/^[A-Za-z0-9+/=:]+$/);
  });

  it('should convert Position ID to JSON', () => {
    const positionID = '4HPwATDgc/ABMA:cIkKAQAAAAAAA';
    const board = positionIDToBoard(positionID);
    
    expect(board.points).toHaveLength(24);
    expect(board.bar).toHaveLength(2);
  });

  it('should be reversible', () => {
    const original = createStartingPosition();
    const positionID = boardToPositionID(original);
    const converted = positionIDToBoard(positionID);
    
    expect(converted).toEqual(original);
  });
});
```

### **Quota Manager**

```typescript
// tests/services/quotaManager.test.ts
describe('Quota Manager', () => {
  it('should track AI quota usage', async () => {
    const userId = 'test-user';
    
    await decrementQuota(userId);
    const quota = await getQuota(userId);
    
    expect(quota.remaining).toBe(4);
  });

  it('should reset quota monthly', async () => {
    const userId = 'test-user';
    await setQuota(userId, 0);
    
    // Simulate month passing
    await resetMonthlyQuotas();
    
    const quota = await getQuota(userId);
    expect(quota.remaining).toBe(5);
  });

  it('should allow unlimited for premium', async () => {
    const userId = 'premium-user';
    await setPremium(userId, true);
    
    const quota = await getQuota(userId);
    expect(quota.remaining).toBe('unlimited');
  });
});
```

---

## 🔗 Integration Tests

### **API Endpoints**

```typescript
// tests/api/gnubg.test.ts
import request from 'supertest';
import app from '../../src/server';

describe('POST /api/validate-move', () => {
  it('should validate a legal move', async () => {
    const response = await request(app)
      .post('/api/validate-move')
      .send({
        boardState: '4HPwATDgc/ABMA:cIkKAQAAAAAAA',
        move: '8/5 6/5',
        dice: [3, 1]
      });
    
    expect(response.status).toBe(200);
    expect(response.body.isValid).toBe(true);
    expect(response.body.equity).toBeCloseTo(-0.234, 2);
  });

  it('should reject an illegal move', async () => {
    const response = await request(app)
      .post('/api/validate-move')
      .send({
        boardState: '4HPwATDgc/ABMA:cIkKAQAAAAAAA',
        move: '25/22',
        dice: [3, 1]
      });
    
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('illegal');
  });

  it('should require authentication', async () => {
    const response = await request(app)
      .post('/api/validate-move')
      .send({ boardState: '...', move: '8/5', dice: [3, 1] });
    
    expect(response.status).toBe(401);
  });
});

describe('POST /api/analysis/error', () => {
  it('should return cached explanation', async () => {
    const token = await getTestToken();
    
    const response = await request(app)
      .post('/api/analysis/error')
      .set('Authorization', `Bearer ${token}`)
      .send({
        boardState: '...',
        playedMove: '8/5 6/5',
        bestMove: '13/10 6/5',
        equityLoss: 0.055
      });
    
    expect(response.status).toBe(200);
    expect(response.body.explanation).toHaveProperty('situation');
    expect(response.body.cached).toBe(true);
  });

  it('should enforce quota', async () => {
    const token = await getTestToken({ quota: 0 });
    
    const response = await request(app)
      .post('/api/analysis/error')
      .set('Authorization', `Bearer ${token}`)
      .send({ /* ... */ });
    
    expect(response.status).toBe(403);
    expect(response.body.error).toContain('quota');
  });
});
```

### **Database Operations**

```typescript
// tests/integration/database.test.ts
describe('Database Integration', () => {
  beforeEach(async () => {
    await db.query('TRUNCATE users, games, analyses CASCADE');
  });

  it('should create user and game', async () => {
    const user = await createUser({ email: 'test@example.com' });
    const game = await createGame({ userId: user.id, gameType: 'match' });
    
    expect(game.userId).toBe(user.id);
    expect(game.gameType).toBe('match');
  });

  it('should track points correctly', async () => {
    const user = await createUser({ points: 500 });
    
    await deductPoints(user.id, 200);
    const updated = await getUser(user.id);
    
    expect(updated.points).toBe(300);
  });

  it('should handle concurrent transactions', async () => {
    const user = await createUser({ points: 500 });
    
    // Simulate concurrent point deductions
    await Promise.all([
      deductPoints(user.id, 100),
      deductPoints(user.id, 100)
    ]);
    
    const updated = await getUser(user.id);
    expect(updated.points).toBe(300);
  });
});
```

---

## 🌐 E2E Tests

### **User Flows**

```typescript
// tests/e2e/game-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Complete Game Flow', () => {
  test('should play a full game against GNUBG', async ({ page }) => {
    // 1. Login
    await page.goto('https://app.gammonguru.com');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // 2. Start game
    await page.click('text=Play vs GNUBG');
    await page.click('text=Match (5 points)');
    await page.fill('[name="stake"]', '200');
    await page.click('text=Start Game');
    
    // 3. Wait for board to load
    await expect(page.locator('.board')).toBeVisible();
    
    // 4. Play a move
    await page.click('.checker[data-point="8"]');
    await page.click('.point[data-point="5"]');
    await page.click('text=Confirm Move');
    
    // 5. Wait for GNUBG response
    await expect(page.locator('.opponent-move')).toBeVisible();
    
    // 6. Continue until game ends
    // (simplified for example)
    
    // 7. View analysis
    await page.click('text=View Analysis');
    await expect(page.locator('.error-heatmap')).toBeVisible();
  });

  test('should purchase points', async ({ page }) => {
    await page.goto('https://app.gammonguru.com/points');
    
    await page.click('text=Buy 1200 points (€10)');
    
    // Stripe checkout
    await page.fill('[name="cardNumber"]', '4242424242424242');
    await page.fill('[name="cardExpiry"]', '12/25');
    await page.fill('[name="cardCvc"]', '123');
    await page.click('button[type="submit"]');
    
    // Verify points added
    await expect(page.locator('.points-balance')).toContainText('1700');
  });
});
```

### **Multiplayer**

```typescript
// tests/e2e/multiplayer.spec.ts
test.describe('Multiplayer', () => {
  test('should match two players', async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    
    // Player 1 searches
    await page1.goto('https://app.gammonguru.com');
    await page1.click('text=Find Opponent');
    await page1.fill('[name="stake"]', '200');
    await page1.click('text=Search');
    
    // Player 2 searches
    await page2.goto('https://app.gammonguru.com');
    await page2.click('text=Find Opponent');
    await page2.fill('[name="stake"]', '250');
    await page2.click('text=Search');
    
    // Both should be matched (stake = 200)
    await expect(page1.locator('.game-started')).toBeVisible();
    await expect(page2.locator('.game-started')).toBeVisible();
    
    // Verify stake
    await expect(page1.locator('.stake')).toContainText('200');
    await expect(page2.locator('.stake')).toContainText('200');
  });
});
```

---

## 🎭 Mocking

### **GNUBG Mock**

```typescript
// tests/mocks/gnubg.mock.ts
export const mockGNUBGResponses = {
  hint: `
    1. 8/5 6/5                      Equity: -0.234 (0.000)
    2. 13/10 6/5                    Equity: -0.289 (-0.055)
  `,
  equity: 'Cubeless equity: -0.234',
  playMove: '13/9 6/4'
};

vi.mock('../../src/cli/gnubgRunner', () => ({
  executeGNUBGCommand: vi.fn((commands) => {
    if (commands.includes('hint')) {
      return Promise.resolve(mockGNUBGResponses.hint);
    }
    if (commands.includes('show equity')) {
      return Promise.resolve(mockGNUBGResponses.equity);
    }
    return Promise.resolve('');
  })
}));
```

### **AI Mock**

```typescript
// tests/mocks/ai.mock.ts
export const mockAIExplanation = {
  situation: "Running game with pip count advantage",
  mistake: "You broke your advanced anchor too early",
  correctPlay: "Maintain pressure by keeping the 8-point",
  reasoning: "In a running game...",
  principle: "Keep advanced points in racing positions",
  difficulty: "intermediate"
};

vi.mock('../../src/services/claude', () => ({
  generateExplanation: vi.fn(() => Promise.resolve(mockAIExplanation))
}));
```

---

## 📊 Coverage

### **Run Coverage**

```bash
# Backend
npm run test:coverage

# Frontend
npm run test:coverage --workspace=frontend

# View HTML report
open coverage/index.html
```

### **Coverage Thresholds**

```json
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'c8',
      reporter: ['text', 'html', 'lcov'],
      lines: 90,
      functions: 90,
      branches: 85,
      statements: 90
    }
  }
});
```

---

## 🚀 CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install GNUBG
        run: sudo apt-get install -y gnubg
      
      - run: npm ci
      - run: npm run lint
      - run: npm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

---

<div align="center">

**90% Coverage - Tested, Reliable, Production-Ready**

</div>
