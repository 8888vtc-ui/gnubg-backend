# 🛠️ Development Guide

> **Local development setup and best practices**

---

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/8888vtc-ui/gnubg-backend.git
cd gnubg-backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Install GNUBG
# Windows: choco install gnubg
# macOS: brew install gnubg
# Linux: sudo apt-get install gnubg

# Start PostgreSQL (Docker)
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=dev postgres:15

# Run migrations
npm run migrate

# Start development server
npm run dev
```

Server runs on `http://localhost:3000`

---

## 📁 Project Structure

```
gnubg-backend/
├── src/
│   ├── cli/
│   │   ├── gnubgRunner.ts       # GNUBG CLI interface
│   │   └── commandBuilder.ts    # Command construction
│   ├── services/
│   │   ├── aiAnalyzer.ts        # AI integration
│   │   ├── quotaManager.ts      # Quota tracking
│   │   ├── errorDatabase.ts     # Error cache
│   │   └── sessionManager.ts    # Game sessions
│   ├── routes/
│   │   ├── gnubg.ts             # GNUBG endpoints
│   │   ├── analysis.ts          # Analysis endpoints
│   │   ├── game.ts              # Game management
│   │   └── user.ts              # User management
│   ├── middleware/
│   │   ├── auth.ts              # JWT auth
│   │   ├── rateLimit.ts         # Rate limiting
│   │   └── validation.ts        # Request validation
│   ├── models/
│   │   ├── User.ts
│   │   ├── Game.ts
│   │   └── Analysis.ts
│   ├── utils/
│   │   ├── parser.ts            # GNUBG parser
│   │   ├── converter.ts         # Board converter
│   │   └── logger.ts            # Pino logger
│   └── server.ts                # Express app
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/
├── .env.example
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

---

## ⚙️ Environment Variables

```bash
# .env.example

# Server
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://postgres:dev@localhost:5432/gammonguru_dev

# GNUBG
GNUBG_PATH=/usr/local/bin/gnubg  # Adjust for your system

# API Keys
CLAUDE_API_KEY=sk-ant-api03-...  # Get from console.anthropic.com
STRIPE_SECRET_KEY=sk_test_...    # Get from dashboard.stripe.com
STRIPE_WEBHOOK_SECRET=whsec_...

# JWT
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=debug  # debug | info | warn | error
```

---

## 🗄️ Database Setup

### **Using Docker**

```bash
# Start PostgreSQL
docker run -d \
  --name gammonguru-db \
  -p 5432:5432 \
  -e POSTGRES_PASSWORD=dev \
  -e POSTGRES_DB=gammonguru_dev \
  postgres:15

# Connect
psql postgresql://postgres:dev@localhost:5432/gammonguru_dev
```

### **Using Local PostgreSQL**

```bash
# Create database
createdb gammonguru_dev

# Run migrations
npm run migrate

# Seed data (optional)
npm run seed
```

### **Migrations**

```bash
# Create migration
npm run migrate:create add_users_table

# Run migrations
npm run migrate:up

# Rollback
npm run migrate:down
```

---

## 🧪 Running Tests

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# Specific file
npm test tests/cli/gnubgRunner.test.ts

# E2E tests
npm run test:e2e
```

---

## 🔍 Code Quality

### **Linting**

```bash
# Check for issues
npm run lint

# Auto-fix
npm run lint:fix
```

### **Formatting**

```bash
# Check formatting
npm run format:check

# Auto-format
npm run format
```

### **Type Checking**

```bash
# TypeScript type check
npm run type-check
```

---

## 🐛 Debugging

### **VS Code**

`.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Server",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Tests",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["test", "--", "--run"],
      "console": "integratedTerminal"
    }
  ]
}
```

### **Logging**

```typescript
import { logger } from './utils/logger';

logger.debug('Debug message', { data: 'value' });
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message', { error });
```

---

## 🔄 Git Workflow

### **Branch Strategy**

```bash
# Create feature branch
git checkout -b feature/add-cube-analysis

# Make changes
git add .
git commit -m "feat(gnubg): add cube decision analysis"

# Push
git push origin feature/add-cube-analysis

# Create PR on GitHub
```

### **Commit Convention**

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Maintenance

---

## 📦 Dependencies

### **Production**

```json
{
  "express": "^5.1.0",
  "@anthropic-ai/sdk": "^0.9.0",
  "pg": "^8.11.0",
  "jsonwebtoken": "^9.0.2",
  "bcrypt": "^5.1.1",
  "zod": "^3.22.4",
  "pino": "^8.16.2"
}
```

### **Development**

```json
{
  "typescript": "^5.9.3",
  "vitest": "^1.0.4",
  "@types/node": "^24.10.0",
  "nodemon": "^3.1.10",
  "eslint": "^8.55.0",
  "prettier": "^3.1.1"
}
```

---

## 🚀 Scripts

```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "format": "prettier --write \"src/**/*.ts\"",
    "type-check": "tsc --noEmit",
    "migrate": "node scripts/migrate.js",
    "seed": "node scripts/seed.js"
  }
}
```

---

## 🎨 Code Style

### **TypeScript**

```typescript
// ✅ Good
interface MoveValidation {
  isValid: boolean;
  equity: number;
  pr: number;
}

export async function validateMove(
  boardState: string,
  move: string,
  dice: [number, number]
): Promise<MoveValidation> {
  // Implementation
}

// ❌ Bad
async function validateMove(boardState: any, move: any): Promise<any> {
  // Implementation
}
```

### **Error Handling**

```typescript
// ✅ Good
try {
  const result = await executeGNUBGCommand(commands);
  return parseResult(result);
} catch (error) {
  logger.error('GNUBG command failed', { error, commands });
  throw new GNUBGError('Failed to execute command', { cause: error });
}

// ❌ Bad
try {
  const result = await executeGNUBGCommand(commands);
  return parseResult(result);
} catch (error) {
  console.log(error);
  return null;
}
```

---

## 🔧 Useful Commands

```bash
# Check GNUBG installation
gnubg --version

# Test GNUBG command
echo "hint" | gnubg -t

# Check database connection
psql $DATABASE_URL -c "SELECT 1"

# View logs
tail -f logs/app.log

# Clear cache
rm -rf node_modules/.cache

# Reset database
npm run migrate:reset
```

---

## 📚 Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Vitest Documentation](https://vitest.dev/)
- [GNUBG Manual](https://www.gnu.org/software/gnubg/manual/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

<div align="center">

**Happy Coding! 🚀**

</div>
