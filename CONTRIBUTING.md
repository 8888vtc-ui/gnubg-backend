# 🤝 Contributing to GammonGuru

Thank you for your interest in contributing to GammonGuru! This document provides guidelines for contributing to the project.

---

## 🌟 Ways to Contribute

### **Code Contributions**
- Bug fixes
- Performance improvements
- New features (aligned with roadmap)
- Test coverage improvements
- Documentation updates

### **Content Contributions**
- ERROR_DATABASE entries (common backgammon errors)
- Quiz positions
- Tutorial content
- Translations (future)

### **Community Contributions**
- Bug reports
- Feature requests
- User feedback
- Helping other users on Discord

---

## 🚀 Getting Started

### **1. Fork the Repository**

```bash
# Fork on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/gnubg-backend.git
cd gnubg-backend
```

### **2. Install Dependencies**

```bash
npm install
```

### **3. Set Up Environment**

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your local configuration
# You'll need:
# - GNUBG installed and in PATH
# - PostgreSQL database (or use Neon free tier)
# - Claude API key (optional for testing)
```

### **4. Run Development Server**

```bash
npm run dev
```

The server will start on `http://localhost:3000`

### **5. Run Tests**

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

---

## 📋 Development Workflow

### **Branch Naming**

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test improvements

Example: `feature/add-cube-analysis`

### **Commit Messages**

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(gnubg): add cube decision analysis
fix(api): handle GNUBG timeout errors
docs(readme): update installation instructions
test(gnubg): add unit tests for parser
```

### **Pull Request Process**

1. **Create a branch** from `main`
2. **Make your changes** with clear commits
3. **Write/update tests** for your changes
4. **Run linter** and fix any issues: `npm run lint`
5. **Run tests** and ensure they pass: `npm test`
6. **Update documentation** if needed
7. **Push to your fork** and create a Pull Request
8. **Fill out the PR template** completely
9. **Wait for review** - we'll review within 48 hours

### **PR Title Format**

```
<type>: <description>
```

Example: `feat: add multiplayer matchmaking`

---

## 🧪 Testing Guidelines

### **Unit Tests**

- Test individual functions in isolation
- Mock external dependencies (GNUBG, API calls)
- Aim for 90%+ coverage on new code

```typescript
// Example: tests/gnubgRunner.test.ts
import { describe, it, expect, vi } from 'vitest';
import { executeGNUBGCommand } from '../src/cli/gnubgRunner';

describe('gnubgRunner', () => {
  it('should parse GNUBG output correctly', async () => {
    const result = await executeGNUBGCommand('hint');
    expect(result).toHaveProperty('equity');
    expect(result).toHaveProperty('bestMove');
  });
});
```

### **Integration Tests**

- Test API endpoints end-to-end
- Use test database
- Clean up after each test

```typescript
// Example: tests/api/gnubg.test.ts
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/server';

describe('POST /api/validate-move', () => {
  it('should validate a legal move', async () => {
    const response = await request(app)
      .post('/api/validate-move')
      .send({
        boardState: '...',
        move: '8/5 6/5',
        dice: [3, 1]
      });
    
    expect(response.status).toBe(200);
    expect(response.body.isValid).toBe(true);
  });
});
```

---

## 🎨 Code Style

### **TypeScript**

- Use TypeScript strict mode
- Avoid `any` - use proper types
- Export types for public APIs
- Use interfaces for objects

```typescript
// ✅ Good
interface MoveValidation {
  isValid: boolean;
  equity: number;
  pr: number;
}

async function validateMove(
  boardState: string,
  move: string
): Promise<MoveValidation> {
  // ...
}

// ❌ Bad
async function validateMove(boardState: any, move: any): Promise<any> {
  // ...
}
```

### **Formatting**

We use Prettier and ESLint. Run before committing:

```bash
npm run lint        # Check for issues
npm run lint:fix    # Auto-fix issues
npm run format      # Format with Prettier
```

### **File Structure**

```typescript
// 1. Imports (grouped)
import { Router } from 'express';
import { validateMove } from '../services/gnubg';

// 2. Types/Interfaces
interface MoveRequest {
  boardState: string;
  move: string;
}

// 3. Constants
const MAX_RETRIES = 3;

// 4. Main logic
export async function handleMove(req: MoveRequest) {
  // ...
}

// 5. Exports
export default router;
```

---

## 📚 Documentation

### **Code Comments**

- Use JSDoc for public functions
- Explain *why*, not *what*
- Keep comments up-to-date

```typescript
/**
 * Validates a backgammon move using GNUBG
 * 
 * @param boardState - Position ID or JSON board state
 * @param move - Move notation (e.g., "8/5 6/5")
 * @param dice - Dice roll [die1, die2]
 * @returns Validation result with equity and alternatives
 * @throws {GNUBGError} If GNUBG process fails
 */
export async function validateMove(
  boardState: string,
  move: string,
  dice: [number, number]
): Promise<MoveValidation> {
  // ...
}
```

### **README Updates**

If your PR adds a feature, update the README:
- Add to feature list
- Update installation if needed
- Add usage examples

---

## 🐛 Bug Reports

### **Before Reporting**

1. Search existing issues
2. Try latest version
3. Check documentation

### **Issue Template**

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g., Windows 11]
- Node version: [e.g., 20.10.0]
- GNUBG version: [e.g., 1.07.001]

**Additional context**
Any other context about the problem.
```

---

## 💡 Feature Requests

### **Before Requesting**

1. Check roadmap
2. Search existing issues
3. Consider if it aligns with project philosophy

### **Feature Template**

```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Other solutions you've thought about.

**Additional context**
Mockups, examples, or other context.
```

---

## 🏆 Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Eligible for special Discord role
- Invited to contributor calls (monthly)

Top contributors may receive:
- Free premium subscription
- Early access to features
- Swag (stickers, t-shirts)

---

## 📜 Code of Conduct

### **Our Pledge**

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of:
- Experience level
- Gender identity
- Sexual orientation
- Disability
- Personal appearance
- Race or ethnicity
- Age
- Religion

### **Our Standards**

**Positive behavior:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards others

**Unacceptable behavior:**
- Trolling, insulting, or derogatory comments
- Personal or political attacks
- Public or private harassment
- Publishing others' private information
- Other conduct which could reasonably be considered inappropriate

### **Enforcement**

Violations may result in:
1. Warning
2. Temporary ban
3. Permanent ban

Report violations to: conduct@gammonguru.com

---

## 📞 Getting Help

- **Discord**: [Join our community](https://discord.gg/gammonguru)
- **GitHub Discussions**: For questions and ideas
- **Email**: dev@gammonguru.com

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License (for open-source components).

Note: AI analysis logic remains proprietary.

---

<div align="center">

**Thank you for contributing to GammonGuru! 🎲**

</div>
