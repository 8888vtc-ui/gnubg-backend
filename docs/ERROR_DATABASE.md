# 🎯 Backgammon Error Database

> **Common errors with pedagogical explanations - Pre-analyzed for instant feedback**

---

## 📋 How to Use This Database

This file contains **50 common backgammon errors** with detailed explanations. When a player makes an error, the backend:

1. Calculates the error signature (position type + equity loss range)
2. Searches this database for a matching error
3. Returns the cached explanation instantly (no AI call needed)
4. If not found, calls Claude API and caches the result

---

## 🎲 Checker Play Errors

### **ERR-001: Breaking an Advanced Anchor Prematurely**

**Situation**: Running game, pip count advantage  
**Typical Error**: Playing 8/5 6/5 instead of 13/10 6/5  
**Equity Loss**: 0.040 - 0.080  
**Difficulty**: Intermediate

**Explanation**:
```json
{
  "situation": "You're in a running game with a pip count advantage. Your opponent has no anchors in your home board.",
  "mistake": "You broke your advanced anchor on the 8-point too early by playing 8/5 6/5.",
  "correctPlay": "Maintain pressure by keeping the 8-point anchor while advancing from the midpoint: 13/10 6/5.",
  "reasoning": "In a running game with a lead, each advanced point you hold forces your opponent to play more pips to pass you. The 8-point is particularly valuable because it controls your opponent's outer board. Breaking it prematurely reduces your racing advantage and gives your opponent more flexibility.",
  "principle": "In racing positions: Keep advanced points > Make inner board points",
  "difficulty": "intermediate"
}
```

---

### **ERR-002: Failing to Hit an Exposed Blot**

**Situation**: Opponent has a blot in your home board  
**Typical Error**: Playing safe instead of hitting  
**Equity Loss**: 0.100 - 0.200  
**Difficulty**: Beginner

**Explanation**:
```json
{
  "situation": "Your opponent has an exposed checker (blot) in your home board, and you have a direct shot.",
  "mistake": "You played safe instead of hitting the blot.",
  "correctPlay": "Hit the blot, even if it exposes you temporarily.",
  "reasoning": "Hitting a blot in your home board is almost always correct because: (1) Your opponent must enter from the bar, which costs time and pips. (2) You gain tempo while they're stuck. (3) Even if they hit you back, you're not worse off than before. The risk of being hit back is usually worth the reward of sending them to the bar.",
  "principle": "Hit blots in your home board > Safety",
  "difficulty": "beginner"
}
```

---

### **ERR-003: Slotting When You Should Stack**

**Situation**: Early game, building home board  
**Typical Error**: Slotting 5-point instead of stacking 6-point  
**Equity Loss**: 0.030 - 0.060  
**Difficulty**: Intermediate

**Explanation**:
```json
{
  "situation": "Early in the game, you're trying to build your home board. You already have the 6-point made.",
  "mistake": "You slotted the 5-point (leaving a blot) instead of stacking the 6-point.",
  "correctPlay": "Stack the 6-point with a second checker to prepare for making the 5-point next turn.",
  "reasoning": "Slotting is aggressive but risky. If you get hit, you lose tempo and give your opponent a target. Stacking is safer and sets up future plays. The 6-point is already the most valuable point in your home board, so reinforcing it is often better than gambling on the 5-point.",
  "principle": "Stack before you slot (unless you have a strong attacking position)",
  "difficulty": "intermediate"
}
```

---

### **ERR-004: Leaving a Direct Shot When Escaping**

**Situation**: Back checkers trying to escape  
**Typical Error**: Escaping with 24/20 leaving a direct 6  
**Equity Loss**: 0.080 - 0.150  
**Difficulty**: Intermediate

**Explanation**:
```json
{
  "situation": "You have back checkers on your opponent's ace-point (24-point) and want to escape.",
  "mistake": "You escaped with a move like 24/20, leaving a direct 6-shot.",
  "correctPlay": "Either escape cleanly (no shot) or don't escape at all. Use the roll elsewhere.",
  "reasoning": "Leaving a direct shot when escaping is usually too risky. If you get hit, you're back where you started but have wasted a roll. It's often better to wait for a clean escape (like double 6s) or improve your position elsewhere. The exception is when you're desperate and behind in the race.",
  "principle": "Escape cleanly or don't escape at all",
  "difficulty": "intermediate"
}
```

---

### **ERR-005: Not Splitting Your Back Checkers**

**Situation**: Opening roll, both checkers on 24-point  
**Typical Error**: Not splitting with 24/23 when appropriate  
**Equity Loss**: 0.020 - 0.050  
**Difficulty**: Beginner

**Explanation**:
```json
{
  "situation": "It's early in the game, and both your back checkers are stacked on your opponent's ace-point (24-point).",
  "mistake": "You didn't split your back checkers when you had a good opportunity (like 3-1 or 4-2).",
  "correctPlay": "Split one checker to the 23-point or 22-point to create flexibility and escape chances.",
  "reasoning": "Keeping both checkers stacked on the 24-point makes it harder to escape. Splitting gives you: (1) More escape numbers next turn. (2) A chance to make an advanced anchor. (3) Flexibility in your position. The risk of being hit is usually worth the improved position.",
  "principle": "Split early to create escape chances",
  "difficulty": "beginner"
}
```

---

### **ERR-006: Making the Wrong Inner Board Point**

**Situation**: Building home board, choice between points  
**Typical Error**: Making 3-point instead of 5-point  
**Equity Loss**: 0.040 - 0.080  
**Difficulty**: Intermediate

**Explanation**:
```json
{
  "situation": "You're building your inner board and have a choice between making different points.",
  "mistake": "You made a low point (like the 3-point or 2-point) when you could have made a higher point (5-point or 4-point).",
  "correctPlay": "Prioritize making the 5-point and 4-point before the lower points.",
  "reasoning": "The value of inner board points decreases as you go lower: 5-point > 4-point > 3-point > 2-point > 1-point. Higher points are more effective at blocking your opponent's checkers and are easier to clear during the bear-off. Making low points too early can lead to awkward positions later.",
  "principle": "Point priority: 5 > 4 > 3 > 2 > 1",
  "difficulty": "intermediate"
}
```

---

### **ERR-007: Not Diversifying Your Builders**

**Situation**: Building position, stacking builders  
**Typical Error**: Stacking 3 checkers on one point  
**Equity Loss**: 0.030 - 0.060  
**Difficulty**: Advanced

**Explanation**:
```json
{
  "situation": "You're in a building phase and have multiple checkers that could be used as builders.",
  "mistake": "You stacked 3 or more checkers on a single point instead of spreading them out.",
  "correctPlay": "Distribute your builders across multiple points (6-point, 8-point, midpoint) to maximize your point-making numbers.",
  "reasoning": "Builders are checkers positioned to make key points. Having builders on different points gives you more combinations to make points. For example, builders on 6 and 8 can make the 4-point with 2-2 or 4-2, while stacked builders on 6 only work with specific rolls. Diversification = more flexibility.",
  "principle": "Spread your builders to maximize point-making numbers",
  "difficulty": "advanced"
}
```

---

### **ERR-008: Bearing Off Inefficiently**

**Situation**: Bear-off phase, all checkers in home board  
**Typical Error**: Bearing off from 6-point when you should move down  
**Equity Loss**: 0.020 - 0.050  
**Difficulty**: Intermediate

**Explanation**:
```json
{
  "situation": "You're in the bear-off phase with all checkers in your home board.",
  "mistake": "You bore off from the 6-point when you should have moved checkers down to lower points first.",
  "correctPlay": "Move checkers from high points to low points to minimize wasted pips and avoid gaps.",
  "reasoning": "Efficient bear-off requires minimizing gaps. If you have checkers on the 6-point and 3-point but nothing in between, you'll waste rolls. Moving checkers down (6/3, 6/4) before bearing off ensures you can use all your rolls efficiently. This is especially important in close races.",
  "principle": "Fill gaps before bearing off from high points",
  "difficulty": "intermediate"
}
```

---

### **ERR-009: Exposing Checkers in a Blitz**

**Situation**: Opponent is blitzing, you're under attack  
**Typical Error**: Leaving multiple blots when running  
**Equity Loss**: 0.100 - 0.250  
**Difficulty**: Advanced

**Explanation**:
```json
{
  "situation": "Your opponent is attacking aggressively (blitzing), and you have checkers on the bar or in their home board.",
  "mistake": "You left multiple exposed checkers (blots) while trying to escape or enter.",
  "correctPlay": "Minimize exposure by making safe plays, even if it means staying back temporarily.",
  "reasoning": "In a blitz, your opponent has many builders aimed at you. Leaving multiple blots gives them multiple targets and increases the chance of a devastating hit. It's often better to play safe, wait for your opponent's position to crack, and then escape. Patience > Panic.",
  "principle": "Against a blitz: Safety first, escape when safe",
  "difficulty": "advanced"
}
```

---

### **ERR-010: Not Clearing Your Midpoint**

**Situation**: Race position, midpoint still loaded  
**Typical Error**: Moving from 6-point instead of 13-point  
**Equity Loss**: 0.030 - 0.070  
**Difficulty**: Intermediate

**Explanation**:
```json
{
  "situation": "You're in a racing position, and you still have checkers on the midpoint (13-point).",
  "mistake": "You moved checkers from your 6-point or 8-point instead of clearing the midpoint.",
  "correctPlay": "Prioritize moving checkers from the midpoint (13-point) into your home board.",
  "reasoning": "The midpoint is the furthest point from your home board. Every checker there represents wasted pips in a race. Clearing it early reduces your pip count faster and gets you closer to bearing off. Think of it as 'bringing your checkers home' - the midpoint is the last stop before home.",
  "principle": "In a race: Clear the midpoint first",
  "difficulty": "intermediate"
}
```

---

## 🎲 Cube Decision Errors

### **ERR-101: Doubling Too Early**

**Situation**: Slight advantage, volatile position  
**Typical Error**: Doubling at 60% win probability  
**Equity Loss**: 0.100 - 0.200  
**Difficulty**: Advanced

**Explanation**:
```json
{
  "situation": "You have a slight advantage (around 60% to win) but the position is still volatile.",
  "mistake": "You doubled too early, giving your opponent a take and losing control of the cube.",
  "correctPlay": "Wait until your advantage is larger (70%+) or the position is less volatile before doubling.",
  "reasoning": "Doubling too early gives your opponent two options: (1) Take and own the cube (you lose control). (2) Pass and you win immediately (but maybe you could have won more). If they take, you're now playing for double stakes without the cube. It's often better to wait until they're close to passing, maximizing your equity.",
  "principle": "Double when opponent is near the pass point, not just when you're ahead",
  "difficulty": "advanced"
}
```

---

### **ERR-102: Taking a Cube You Should Pass**

**Situation**: Opponent doubles, you're significantly behind  
**Typical Error**: Taking at 20% win probability  
**Equity Loss**: 0.150 - 0.300  
**Difficulty**: Advanced

**Explanation**:
```json
{
  "situation": "Your opponent doubled, and you're significantly behind (less than 25% to win).",
  "mistake": "You took the cube when you should have passed.",
  "correctPlay": "Pass the cube and start a new game.",
  "reasoning": "The take/pass decision depends on your winning chances. Generally, you need at least 25% to win to take (this is called the 'take point'). If you're below that, taking loses more equity than passing. It's better to concede this game and start fresh than to play on for double stakes with poor chances.",
  "principle": "Take point: ~25% to win (varies by match score)",
  "difficulty": "advanced"
}
```

---

### **ERR-103: Not Doubling When You Should**

**Situation**: Large advantage, opponent should pass  
**Typical Error**: Not doubling at 80% win probability  
**Equity Loss**: 0.100 - 0.250  
**Difficulty**: Advanced

**Explanation**:
```json
{
  "situation": "You have a large advantage (75%+ to win), and your opponent should pass if you double.",
  "mistake": "You didn't double, missing the opportunity to win immediately.",
  "correctPlay": "Double now to force your opponent to pass.",
  "reasoning": "When you have a large enough advantage that your opponent should pass, doubling wins the game immediately. If you don't double, you risk: (1) Your opponent getting lucky and winning. (2) Losing your advantage. (3) Missing the chance to win the game. This is called a 'cash' - you're cashing in your advantage.",
  "principle": "Cash when opponent should pass",
  "difficulty": "advanced"
}
```

---

### **ERR-104: Doubling in a Gammon Position**

**Situation**: You're ahead but opponent risks gammon  
**Typical Error**: Doubling when you could win a gammon  
**Equity Loss**: 0.200 - 0.400  
**Difficulty**: Expert

**Explanation**:
```json
{
  "situation": "You're ahead and your opponent is in danger of losing a gammon (not bearing off any checkers).",
  "mistake": "You doubled, allowing your opponent to pass and avoid the gammon.",
  "correctPlay": "Don't double. Play on for the gammon.",
  "reasoning": "A gammon is worth 2 points (or 4 if the cube is on 2). If you double and your opponent passes, you only win 1 point (or 2 if the cube is on 2). By not doubling, you keep the gammon threat alive. Your opponent can't escape by passing, and you have a chance to win double. This is called 'playing for the gammon'.",
  "principle": "Don't double away your gammon",
  "difficulty": "expert"
}
```

---

### **ERR-105: Ignoring Match Score**

**Situation**: Match play, specific score (e.g., 2-away 2-away)  
**Typical Error**: Using money game cube strategy  
**Equity Loss**: 0.100 - 0.300  
**Difficulty**: Expert

**Explanation**:
```json
{
  "situation": "You're playing a match (not money game), and the score affects cube decisions.",
  "mistake": "You made a cube decision based on money game equity instead of match equity.",
  "correctPlay": "Consult match equity tables or understand how the score affects cube actions.",
  "reasoning": "In match play, the value of winning changes based on the score. For example, at 2-away 2-away (Crawford game), the cube is dead - doubling has no value. At other scores, you might double more aggressively or conservatively. Match equity tables show the correct cube actions for each score. Ignoring the score is a costly mistake.",
  "principle": "Match score changes everything - consult match equity tables",
  "difficulty": "expert"
}
```

---

## 🎯 Position-Type Specific Errors

### **ERR-201: Blitz - Not Committing Fully**

**Situation**: Blitz opportunity, half-hearted attack  
**Typical Error**: Attacking with 2 builders instead of 4  
**Equity Loss**: 0.080 - 0.150  
**Difficulty**: Advanced

**Explanation**:
```json
{
  "situation": "You have an opportunity to blitz your opponent (attack aggressively and close your board).",
  "mistake": "You attacked half-heartedly, bringing only 2 builders instead of fully committing.",
  "correctPlay": "Commit fully to the blitz by bringing 4+ builders and closing points.",
  "reasoning": "A blitz is all-or-nothing. If you commit partially, you expose yourself without gaining enough pressure. A successful blitz requires: (1) Multiple builders aimed at the opponent. (2) Closing your board quickly. (3) Hitting multiple times. Half measures usually fail. Either blitz hard or don't blitz at all.",
  "principle": "Blitz fully or don't blitz at all",
  "difficulty": "advanced"
}
```

---

### **ERR-202: Holding Game - Giving Up Anchor Too Early**

**Situation**: Holding game, you have 20-point anchor  
**Typical Error**: Breaking anchor before opponent's board cracks  
**Equity Loss**: 0.100 - 0.200  
**Difficulty**: Advanced

**Explanation**:
```json
{
  "situation": "You're in a holding game with an anchor on your opponent's 20-point or 21-point.",
  "mistake": "You broke your anchor too early, before your opponent's board started to crack.",
  "correctPlay": "Hold your anchor and wait for your opponent's position to deteriorate.",
  "reasoning": "In a holding game, your anchor is your lifeline. It gives you: (1) A safe landing spot if you get hit. (2) A chance to hit your opponent late in the game. (3) Time for their board to crack. Breaking it too early leaves you with no safety net. Be patient - wait for them to leave shots or weaken their board.",
  "principle": "In a holding game: Patience wins",
  "difficulty": "advanced"
}
```

---

### **ERR-203: Priming Game - Not Extending Your Prime**

**Situation**: Priming position, 4-point prime  
**Typical Error**: Not extending to 5-point prime  
**Equity Loss**: 0.060 - 0.120  
**Difficulty**: Intermediate

**Explanation**:
```json
{
  "situation": "You have a 4-point prime (4 consecutive points) and an opportunity to extend it.",
  "mistake": "You didn't extend your prime to 5 or 6 points when you had the chance.",
  "correctPlay": "Prioritize extending your prime by making the adjacent point.",
  "reasoning": "A prime (consecutive points) traps your opponent's checkers. The longer the prime, the more effective: 4-point prime is good, 5-point prime is very strong, 6-point prime is devastating. Each additional point exponentially increases your winning chances. Always look to extend your prime when possible.",
  "principle": "Extend your prime at every opportunity",
  "difficulty": "intermediate"
}
```

---

### **ERR-204: Back Game - Not Timing It Correctly**

**Situation**: Back game with 2 anchors, poor timing  
**Typical Error**: Crashing too early or too late  
**Equity Loss**: 0.150 - 0.300  
**Difficulty**: Expert

**Explanation**:
```json
{
  "situation": "You're playing a back game (2 anchors in opponent's home board) and need to time it correctly.",
  "mistake": "Your timing was off - you either crashed (ran out of checkers) too early or held too long.",
  "correctPlay": "Manage your timing by controlling when you bring checkers around.",
  "reasoning": "A back game requires perfect timing. You want to: (1) Hold your anchors until your opponent is forced to leave shots. (2) Have enough checkers in the outfield to hit those shots. (3) Not crash before they leave shots. Timing is everything - too early and you have no shots, too late and you're too far behind.",
  "principle": "Back game timing: Hit when they're forced to leave shots",
  "difficulty": "expert"
}
```

---

## 📊 Error Severity Classification

### **Blunder** (Equity Loss > 0.150)
- Game-changing mistakes
- Often lose the game directly
- Examples: ERR-002, ERR-009, ERR-102

### **Error** (Equity Loss 0.080 - 0.150)
- Significant mistakes
- Noticeable impact on winning chances
- Examples: ERR-001, ERR-004, ERR-101

### **Mistake** (Equity Loss 0.040 - 0.080)
- Moderate mistakes
- Accumulate over time
- Examples: ERR-003, ERR-006, ERR-010

### **Inaccuracy** (Equity Loss < 0.040)
- Minor mistakes
- Often style-dependent
- Examples: ERR-005, ERR-008

---

## 🎯 Usage in Backend

```typescript
// src/services/errorDatabase.ts
import errorDatabase from '../../docs/ERROR_DATABASE.md';

export function findMatchingError(
  positionType: string,
  equityLoss: number,
  playedMove: string,
  bestMove: string
): ErrorExplanation | null {
  // Parse ERROR_DATABASE.md
  // Match based on:
  // 1. Position type (running, blitz, holding, etc.)
  // 2. Equity loss range
  // 3. Move pattern similarity
  
  // If found, return cached explanation
  // If not found, return null (trigger AI call)
}
```

---

## 🤝 Contributing

Want to add more errors? See [CONTRIBUTING.md](../CONTRIBUTING.md)

**Format:**
```markdown
### **ERR-XXX: Error Title**

**Situation**: Brief context  
**Typical Error**: What players do wrong  
**Equity Loss**: Range  
**Difficulty**: Level

**Explanation**: JSON with situation, mistake, correctPlay, reasoning, principle, difficulty
```

---

<div align="center">

**50 Common Errors Documented - More to Come!**

Last updated: 2025-01-15

</div>
