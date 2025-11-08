# 🎲 GNUBG Integration Guide

> **Complete guide for integrating GNU Backgammon CLI into the backend**

---

## 📋 Table of Contents

- [Installation](#installation)
- [CLI Basics](#cli-basics)
- [Integration Architecture](#integration-architecture)
- [Command Reference](#command-reference)
- [Output Parsing](#output-parsing)
- [Error Handling](#error-handling)
- [Performance Optimization](#performance-optimization)
- [Testing](#testing)

---

## 🔧 Installation

### **Windows**

```powershell
# Download from official site
# https://www.gnu.org/software/gnubg/

# Or via Chocolatey
choco install gnubg

# Verify installation
gnubg --version
```

### **macOS**

```bash
# Via Homebrew
brew install gnubg

# Verify installation
gnubg --version
```

### **Linux (Ubuntu/Debian)**

```bash
# Install from package manager
sudo apt-get update
sudo apt-get install gnubg

# Verify installation
gnubg --version
```

### **Expected Output**

```
GNU Backgammon 1.07.001
```

---

## 🎮 CLI Basics

### **Interactive Mode**

```bash
# Start GNUBG in interactive mode
gnubg

# You'll see:
(gnubg) 
```

### **Text-Only Mode**

```bash
# Start in text-only mode (no GUI)
gnubg -t

# This is what we use in the backend
```

### **Batch Mode**

```bash
# Execute commands from stdin
gnubg -t << EOF
new game
set dice 3 1
play 8/5 6/5
hint
EOF
```

---

## 🏗️ Integration Architecture

### **Phase 1: CLI Subprocess (MVP)**

```typescript
// src/cli/gnubgRunner.ts
import { spawn } from 'child_process';

export async function executeGNUBGCommand(
  commands: string[]
): Promise<string> {
  return new Promise((resolve, reject) => {
    const gnubg = spawn('gnubg', ['-t']);
    
    let output = '';
    let errorOutput = '';
    
    gnubg.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    gnubg.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    gnubg.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`GNUBG exited with code ${code}: ${errorOutput}`));
      } else {
        resolve(output);
      }
    });
    
    // Send commands
    commands.forEach(cmd => gnubg.stdin.write(cmd + '\n'));
    gnubg.stdin.end();
  });
}
```

### **Phase 2: Native Bindings (Future)**

```typescript
// Future implementation with node-gyp
import { analyzeMove } from './gnubg-native';

export async function validateMove(
  boardState: string,
  move: string
): Promise<MoveAnalysis> {
  // Direct C library call, no subprocess
  return analyzeMove(boardState, move);
}
```

---

## 📝 Command Reference

### **Game Setup**

```bash
# Start a new game
new game

# Set specific position (Position ID)
set board 4HPwATDgc/ABMA:cIkKAQAAAAAAA

# Set dice
set dice 3 1

# Set match length
set matchlength 5

# Set score
set score 2 1
```

### **Move Commands**

```bash
# Play a move
play 8/5 6/5

# Get best move suggestion
hint

# Analyze current position
analyse move

# Show all legal moves
show moves
```

### **Analysis Commands**

```bash
# Analyze a single move
analyse move

# Analyze entire game
analyse game

# Analyze match
analyse match

# Show equity
show equity

# Show pip count
show pipcount
```

### **Cube Commands**

```bash
# Double
double

# Take/drop
take
drop

# Analyze cube decision
analyse cube
```

### **Settings**

```bash
# Set analysis level (0-4)
set analysis chequerplay evaluation plies 2

# Set cube analysis
set analysis cubedecision evaluation plies 2

# Disable output
set output none

# Enable specific output
set output rawboard on
```

---

## 🔍 Output Parsing

### **Move Analysis Output**

**Command:**
```bash
set board 4HPwATDgc/ABMA:cIkKAQAAAAAAA
set dice 3 1
hint
```

**Output:**
```
  1. 8/5 6/5                      Equity: -0.234 (0.000)
  2. 13/10 6/5                    Equity: -0.289 (-0.055)
  3. 24/21 6/5                    Equity: -0.312 (-0.078)
```

**Parser:**
```typescript
interface MoveAlternative {
  move: string;
  equity: number;
  equityLoss: number;
  rank: number;
}

function parseHintOutput(output: string): MoveAlternative[] {
  const lines = output.split('\n').filter(line => line.trim());
  const moves: MoveAlternative[] = [];
  
  const moveRegex = /^\s*(\d+)\.\s+(.+?)\s+Equity:\s+([-\d.]+)\s+\(([-\d.]+)\)/;
  
  for (const line of lines) {
    const match = line.match(moveRegex);
    if (match) {
      moves.push({
        rank: parseInt(match[1]),
        move: match[2].trim(),
        equity: parseFloat(match[3]),
        equityLoss: Math.abs(parseFloat(match[4]))
      });
    }
  }
  
  return moves;
}
```

### **Position ID Format**

GNUBG uses a compact Position ID format:

```
4HPwATDgc/ABMA:cIkKAQAAAAAAA
```

**Structure:**
- Base64-encoded binary representation
- Contains: checker positions, turn, cube value, cube owner

**Conversion:**
```typescript
// Convert JSON board to Position ID
export function boardToPositionID(board: BoardState): string {
  // Implementation using GNUBG's encoding algorithm
  // See: https://www.gnu.org/software/gnubg/manual/html_node/A-technical-description-of-the-Position-ID.html
}

// Convert Position ID to JSON board
export function positionIDToBoard(positionID: string): BoardState {
  // Decode base64 and parse binary format
}
```

### **Equity Output**

**Command:**
```bash
show equity
```

**Output:**
```
Cubeless equity: -0.234
Cubeful equity: -0.189
```

**Parser:**
```typescript
interface EquityAnalysis {
  cubeless: number;
  cubeful: number;
}

function parseEquityOutput(output: string): EquityAnalysis {
  const cubelessMatch = output.match(/Cubeless equity:\s+([-\d.]+)/);
  const cubefulMatch = output.match(/Cubeful equity:\s+([-\d.]+)/);
  
  return {
    cubeless: cubelessMatch ? parseFloat(cubelessMatch[1]) : 0,
    cubeful: cubefulMatch ? parseFloat(cubefulMatch[1]) : 0
  };
}
```

---

## ⚠️ Error Handling

### **Common Errors**

**1. GNUBG Not Found**
```typescript
try {
  await executeGNUBGCommand(['hint']);
} catch (error) {
  if (error.code === 'ENOENT') {
    throw new Error('GNUBG not installed or not in PATH');
  }
}
```

**2. Invalid Position**
```
Error: Invalid position
```

**Handler:**
```typescript
function isValidPosition(positionID: string): boolean {
  // Basic validation
  return /^[A-Za-z0-9+/=:]+$/.test(positionID);
}
```

**3. Timeout**
```typescript
async function executeWithTimeout(
  commands: string[],
  timeoutMs: number = 5000
): Promise<string> {
  return Promise.race([
    executeGNUBGCommand(commands),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('GNUBG timeout')), timeoutMs)
    )
  ]);
}
```

**4. Process Crash**
```typescript
gnubg.on('error', (error) => {
  logger.error('GNUBG process error:', error);
  // Retry logic
  if (retries < MAX_RETRIES) {
    return executeGNUBGCommand(commands, retries + 1);
  }
  throw error;
});
```

---

## ⚡ Performance Optimization

### **Process Pooling**

```typescript
// src/cli/gnubgPool.ts
import { spawn, ChildProcess } from 'child_process';

class GNUBGPool {
  private pool: ChildProcess[] = [];
  private readonly poolSize = 4;
  
  constructor() {
    this.initPool();
  }
  
  private initPool() {
    for (let i = 0; i < this.poolSize; i++) {
      const process = spawn('gnubg', ['-t']);
      this.pool.push(process);
    }
  }
  
  async execute(commands: string[]): Promise<string> {
    const process = this.pool.shift();
    if (!process) throw new Error('No available GNUBG process');
    
    try {
      const result = await this.sendCommands(process, commands);
      this.pool.push(process); // Return to pool
      return result;
    } catch (error) {
      // Replace crashed process
      const newProcess = spawn('gnubg', ['-t']);
      this.pool.push(newProcess);
      throw error;
    }
  }
  
  private sendCommands(
    process: ChildProcess,
    commands: string[]
  ): Promise<string> {
    // Implementation
  }
}

export const gnubgPool = new GNUBGPool();
```

### **Caching**

```typescript
// Cache frequent positions
const positionCache = new Map<string, MoveAnalysis>();

export async function analyzePosition(
  positionID: string
): Promise<MoveAnalysis> {
  // Check cache
  if (positionCache.has(positionID)) {
    return positionCache.get(positionID)!;
  }
  
  // Analyze with GNUBG
  const analysis = await executeAnalysis(positionID);
  
  // Cache result
  positionCache.set(positionID, analysis);
  
  return analysis;
}
```

### **Batch Processing**

```typescript
// Analyze multiple positions in one GNUBG session
export async function analyzeBatch(
  positions: string[]
): Promise<MoveAnalysis[]> {
  const commands: string[] = [];
  
  for (const position of positions) {
    commands.push(
      `set board ${position}`,
      'hint',
      'show equity'
    );
  }
  
  const output = await executeGNUBGCommand(commands);
  return parseBatchOutput(output);
}
```

---

## 🧪 Testing

### **Unit Tests**

```typescript
// tests/gnubgRunner.test.ts
import { describe, it, expect, vi } from 'vitest';
import { executeGNUBGCommand } from '../src/cli/gnubgRunner';

describe('GNUBG Runner', () => {
  it('should execute hint command', async () => {
    const output = await executeGNUBGCommand([
      'new game',
      'set dice 3 1',
      'hint'
    ]);
    
    expect(output).toContain('Equity:');
  });
  
  it('should handle invalid position', async () => {
    await expect(
      executeGNUBGCommand(['set board INVALID'])
    ).rejects.toThrow();
  });
  
  it('should timeout after 5 seconds', async () => {
    await expect(
      executeWithTimeout(['analyse match'], 100)
    ).rejects.toThrow('timeout');
  });
});
```

### **Integration Tests**

```typescript
// tests/integration/gnubg.test.ts
describe('GNUBG Integration', () => {
  it('should validate a legal move', async () => {
    const result = await validateMove(
      '4HPwATDgc/ABMA:cIkKAQAAAAAAA',
      '8/5 6/5',
      [3, 1]
    );
    
    expect(result.isValid).toBe(true);
    expect(result.equity).toBeCloseTo(-0.234, 2);
  });
  
  it('should reject an illegal move', async () => {
    const result = await validateMove(
      '4HPwATDgc/ABMA:cIkKAQAAAAAAA',
      '25/22',
      [3, 1]
    );
    
    expect(result.isValid).toBe(false);
  });
});
```

### **Mock GNUBG for Tests**

```typescript
// tests/mocks/gnubg.mock.ts
export const mockGNUBGOutput = {
  hint: `
    1. 8/5 6/5                      Equity: -0.234 (0.000)
    2. 13/10 6/5                    Equity: -0.289 (-0.055)
  `,
  equity: `
    Cubeless equity: -0.234
    Cubeful equity: -0.189
  `
};

vi.mock('../src/cli/gnubgRunner', () => ({
  executeGNUBGCommand: vi.fn((commands) => {
    if (commands.includes('hint')) {
      return Promise.resolve(mockGNUBGOutput.hint);
    }
    return Promise.resolve('');
  })
}));
```

---

## 📚 Resources

### **Official Documentation**
- [GNUBG Manual](https://www.gnu.org/software/gnubg/manual/)
- [Position ID Format](https://www.gnu.org/software/gnubg/manual/html_node/A-technical-description-of-the-Position-ID.html)
- [Command Reference](https://www.gnu.org/software/gnubg/manual/html_node/Command-reference.html)

### **Community**
- [GNUBG Mailing List](https://lists.gnu.org/mailman/listinfo/bug-gnubg)
- [Backgammon Galaxy](https://www.backgammongalaxy.com/)

### **Alternative Engines**
- eXtreme Gammon (commercial)
- BGBlitz (commercial)
- Jellyfish (legacy)

---

## 🔮 Future: Native Bindings

### **Advantages**
- 10-100x faster (no process spawn)
- Lower memory usage
- Better error handling
- Direct memory access

### **Implementation Plan**

1. **Compile GNUBG as shared library**
```bash
./configure --enable-shared
make
```

2. **Create Node.js bindings**
```cpp
// gnubg-native/binding.cc
#include <node_api.h>
#include "gnubg.h"

napi_value AnalyzeMove(napi_env env, napi_callback_info info) {
  // Call GNUBG C functions directly
}
```

3. **Build with node-gyp**
```json
{
  "targets": [{
    "target_name": "gnubg_native",
    "sources": ["binding.cc"],
    "libraries": ["-lgnubg"]
  }]
}
```

4. **Use in TypeScript**
```typescript
import { analyzeMove } from './build/Release/gnubg_native';

const result = analyzeMove(positionID, move);
```

---

<div align="center">

**GNUBG Integration - From CLI to Native Performance**

</div>
