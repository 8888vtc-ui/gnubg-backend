# 💎 Freemium System

> **Economic model, quotas, and anti-fraud mechanisms**

---

## 💰 Economic Model

### **Galaxy Model (9€/month)**

```
┌─────────────────────────────────────┐
│  Subscription: 9€/month             │
│  ├─ 500 points at signup (one-time)│
│  ├─ Unlimited AI analyses           │
│  ├─ Unlimited games vs GNUBG        │
│  └─ Unlimited multiplayer           │
└─────────────────────────────────────┘
```

### **Commission System**

- **20% commission** on all games (vs GNUBG or multiplayer)
- Example: Stake 200 points → Winner receives 160 points → House keeps 40 points

### **Point Packages**

| Package | Points | Price | Bonus |
|---------|--------|-------|-------|
| Small | 500 | 5€ | 0% |
| Medium | 1200 | 10€ | 20% |
| Large | 2600 | 20€ | 30% |

---

## 🎁 Free Tier

### **What's Included**

- **500 points** at signup (one-time)
- **5 AI analyses/month**
- **Unlimited quiz** access
- **Unlimited games** (until points run out)

### **Limitations**

- No point recharge (must buy or upgrade)
- AI quota resets monthly
- No priority support

---

## 🔐 Quota Management

### **Database Schema**

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255),
  points INTEGER DEFAULT 500,
  is_premium BOOLEAN DEFAULT false,
  ai_quota_used INTEGER DEFAULT 0,
  ai_quota_reset_date TIMESTAMP,
  device_fingerprint VARCHAR(255),
  ip_address INET,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type VARCHAR(20), -- 'subscription' | 'purchase' | 'game_win' | 'game_loss' | 'commission'
  amount INTEGER,
  balance_after INTEGER,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **Quota Check Middleware**

```typescript
// src/middleware/quota.ts
export async function checkAIQuota(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.user.id;
  
  const user = await db.query(
    'SELECT is_premium, ai_quota_used, ai_quota_reset_date FROM users WHERE id = $1',
    [userId]
  );
  
  // Premium users have unlimited quota
  if (user.rows[0].is_premium) {
    return next();
  }
  
  // Check if quota needs reset (monthly)
  const resetDate = new Date(user.rows[0].ai_quota_reset_date);
  if (resetDate < new Date()) {
    await db.query(
      'UPDATE users SET ai_quota_used = 0, ai_quota_reset_date = $1 WHERE id = $2',
      [addMonths(new Date(), 1), userId]
    );
    return next();
  }
  
  // Check quota
  if (user.rows[0].ai_quota_used >= 5) {
    return res.status(403).json({
      error: 'AI quota exceeded',
      quotaRemaining: 0,
      message: 'Upgrade to premium for unlimited AI analyses',
      upgradeUrl: '/pricing'
    });
  }
  
  next();
}

export async function decrementQuota(userId: string) {
  await db.query(
    'UPDATE users SET ai_quota_used = ai_quota_used + 1 WHERE id = $1',
    [userId]
  );
}
```

---

## 🛡️ Anti-Fraud System

### **Device Fingerprinting**

```typescript
// src/services/fingerprint.ts
import FingerprintJS from '@fingerprintjs/fingerprintjs';

export async function getDeviceFingerprint(req: Request): Promise<string> {
  // Client-side fingerprinting (sent in request)
  const clientFingerprint = req.headers['x-device-fingerprint'];
  
  // Server-side fingerprinting
  const serverFingerprint = createHash('sha256')
    .update(req.headers['user-agent'] || '')
    .update(req.headers['accept-language'] || '')
    .update(req.ip || '')
    .digest('hex');
  
  // Combine both
  return createHash('sha256')
    .update(clientFingerprint + serverFingerprint)
    .digest('hex');
}

export async function checkMultiAccounting(
  fingerprint: string
): Promise<boolean> {
  const accounts = await db.query(
    'SELECT COUNT(*) FROM users WHERE device_fingerprint = $1',
    [fingerprint]
  );
  
  // Flag if more than 3 accounts from same device
  return accounts.rows[0].count > 3;
}
```

### **IP Tracking**

```typescript
// src/middleware/ipTracking.ts
export async function trackIP(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const ip = req.ip || req.headers['x-forwarded-for'];
  const userId = req.user?.id;
  
  if (userId) {
    await db.query(
      'UPDATE users SET ip_address = $1, last_seen = NOW() WHERE id = $2',
      [ip, userId]
    );
    
    // Check for suspicious activity
    const recentLogins = await db.query(
      'SELECT COUNT(DISTINCT ip_address) FROM user_sessions WHERE user_id = $1 AND created_at > NOW() - INTERVAL \'1 hour\'',
      [userId]
    );
    
    if (recentLogins.rows[0].count > 5) {
      logger.warn('Suspicious activity detected', { userId, ip });
      // Trigger review or temporary lock
    }
  }
  
  next();
}
```

### **Rate Limiting**

```typescript
// src/middleware/rateLimit.ts
import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests',
      message: 'Please slow down and try again later'
    });
  }
});

export const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 AI calls per minute
  skipSuccessfulRequests: false,
  keyGenerator: (req) => req.user?.id || req.ip
});
```

---

## 💳 Payment Integration

### **Stripe Subscription**

```typescript
// src/services/stripe.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createSubscription(
  userId: string,
  email: string
): Promise<string> {
  // Create customer
  const customer = await stripe.customers.create({
    email,
    metadata: { userId }
  });
  
  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customer.id,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{
      price: process.env.STRIPE_PRICE_ID, // 9€/month
      quantity: 1
    }],
    success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/pricing`
  });
  
  return session.url;
}

export async function handleWebhook(
  event: Stripe.Event
): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      await activatePremium(session.metadata.userId);
      break;
      
    case 'invoice.payment_succeeded':
      // Renewal successful
      break;
      
    case 'invoice.payment_failed':
      const invoice = event.data.object as Stripe.Invoice;
      await deactivatePremium(invoice.customer as string);
      break;
      
    case 'customer.subscription.deleted':
      const subscription = event.data.object as Stripe.Subscription;
      await deactivatePremium(subscription.customer as string);
      break;
  }
}
```

### **Point Purchase**

```typescript
export async function purchasePoints(
  userId: string,
  packageType: 'small' | 'medium' | 'large'
): Promise<string> {
  const packages = {
    small: { points: 500, price: 500 }, // 5€ in cents
    medium: { points: 1200, price: 1000 },
    large: { points: 2600, price: 2000 }
  };
  
  const pkg = packages[packageType];
  
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'eur',
        product_data: {
          name: `${pkg.points} Points`,
          description: `GammonGuru Points Package`
        },
        unit_amount: pkg.price
      },
      quantity: 1
    }],
    metadata: {
      userId,
      points: pkg.points,
      type: 'point_purchase'
    },
    success_url: `${process.env.FRONTEND_URL}/success`,
    cancel_url: `${process.env.FRONTEND_URL}/points`
  });
  
  return session.url;
}
```

---

## 🎮 Point Transactions

### **Game Stake**

```typescript
export async function stakePoints(
  userId: string,
  amount: number
): Promise<void> {
  const user = await getUser(userId);
  
  if (user.points < amount) {
    throw new Error('Insufficient points');
  }
  
  await db.query('BEGIN');
  
  try {
    // Deduct points
    await db.query(
      'UPDATE users SET points = points - $1 WHERE id = $2',
      [amount, userId]
    );
    
    // Record transaction
    await db.query(
      'INSERT INTO transactions (user_id, type, amount, balance_after) VALUES ($1, $2, $3, (SELECT points FROM users WHERE id = $1))',
      [userId, 'game_stake', -amount]
    );
    
    await db.query('COMMIT');
  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  }
}
```

### **Game Win**

```typescript
export async function distributeWinnings(
  winnerId: string,
  loserId: string,
  stake: number
): Promise<void> {
  const commission = Math.floor(stake * 0.2); // 20%
  const winnings = stake - commission;
  
  await db.query('BEGIN');
  
  try {
    // Winner receives 80% of opponent's stake
    await db.query(
      'UPDATE users SET points = points + $1 WHERE id = $2',
      [winnings, winnerId]
    );
    
    await db.query(
      'INSERT INTO transactions (user_id, type, amount, balance_after, metadata) VALUES ($1, $2, $3, (SELECT points FROM users WHERE id = $1), $4)',
      [winnerId, 'game_win', winnings, JSON.stringify({ stake, commission })]
    );
    
    // Record commission
    await db.query(
      'INSERT INTO transactions (user_id, type, amount, metadata) VALUES (NULL, $1, $2, $3)',
      ['commission', commission, JSON.stringify({ winnerId, loserId, stake })]
    );
    
    await db.query('COMMIT');
  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  }
}
```

---

## 📊 Analytics

### **Revenue Tracking**

```typescript
export async function getRevenueMetrics(
  startDate: Date,
  endDate: Date
): Promise<RevenueMetrics> {
  const result = await db.query(`
    SELECT 
      SUM(CASE WHEN type = 'subscription' THEN amount ELSE 0 END) as subscription_revenue,
      SUM(CASE WHEN type = 'purchase' THEN amount ELSE 0 END) as point_purchase_revenue,
      SUM(CASE WHEN type = 'commission' THEN amount ELSE 0 END) as commission_revenue,
      COUNT(DISTINCT CASE WHEN type = 'subscription' THEN user_id END) as premium_users,
      COUNT(CASE WHEN type = 'commission' THEN 1 END) as total_games
    FROM transactions
    WHERE created_at BETWEEN $1 AND $2
  `, [startDate, endDate]);
  
  return result.rows[0];
}
```

---

<div align="center">

**Freemium Model - Fair, Transparent, Scalable**

</div>
