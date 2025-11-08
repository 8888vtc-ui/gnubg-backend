# 🚀 Deployment Guide

> **Production deployment on Railway, Vercel, and Neon**

---

## 🏗️ Infrastructure Overview

```
┌──────────────┐
│   Vercel     │  ← Frontend (Vue 3 PWA)
│  (Frontend)  │     - Automatic deployments from GitHub
└──────────────┘     - CDN + Edge functions
        │
        │ HTTPS
        ▼
┌──────────────┐
│   Railway    │  ← Backend (Node.js + GNUBG)
│  (Backend)   │     - Automatic deployments from GitHub
└──────────────┘     - Environment variables
        │
        ├─────→ Neon (PostgreSQL)
        ├─────→ Claude API
        └─────→ Stripe API
```

---

## 📦 Prerequisites

- GitHub account
- Railway account (free tier available)
- Vercel account (free tier available)
- Neon account (free tier available)
- Stripe account
- Claude API key

---

## 🗄️ Database Setup (Neon)

### **1. Create Database**

1. Go to [neon.tech](https://neon.tech)
2. Create new project: `gammonguru-prod`
3. Copy connection string

### **2. Run Migrations**

```bash
# Install Neon CLI
npm install -g neonctl

# Connect to database
psql "postgresql://user:password@host/database"

# Run schema
\i docs/schema.sql
```

### **3. Schema**

```sql
-- See ARCHITECTURE.md for full schema
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  points INTEGER DEFAULT 500,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add other tables...
```

---

## 🖥️ Backend Deployment (Railway)

### **1. Connect Repository**

1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Select `gnubg-backend` repository
4. Railway auto-detects Node.js

### **2. Environment Variables**

```bash
# Database
DATABASE_URL=postgresql://...  # From Neon

# API Keys
CLAUDE_API_KEY=sk-ant-...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# JWT
JWT_SECRET=your-super-secret-key-change-this

# Environment
NODE_ENV=production
PORT=3000

# GNUBG
GNUBG_PATH=/usr/bin/gnubg  # Railway provides GNUBG
```

### **3. Install GNUBG on Railway**

Create `railway.toml`:

```toml
[build]
builder = "nixpacks"

[build.nixpacksConfig]
packages = ["gnubg", "nodejs-20_x"]
```

Or use `nixpacks.toml`:

```toml
[phases.setup]
nixPkgs = ["gnubg"]
```

### **4. Build Configuration**

`package.json`:
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "dev": "nodemon --exec ts-node src/server.ts"
  }
}
```

### **5. Deploy**

```bash
# Push to GitHub main branch
git push origin main

# Railway auto-deploys
# Check logs: railway logs
```

### **6. Custom Domain**

1. Railway Dashboard → Settings → Domains
2. Add custom domain: `api.gammonguru.com`
3. Update DNS: CNAME → railway.app

---

## 🌐 Frontend Deployment (Vercel)

### **1. Connect Repository**

1. Go to [vercel.com](https://vercel.com)
2. Import Project → Select `gnubg-frontend` repo
3. Vercel auto-detects Vue

### **2. Environment Variables**

```bash
VITE_API_URL=https://api.gammonguru.com
VITE_STRIPE_PUBLIC_KEY=pk_live_...
VITE_GA_TRACKING_ID=G-...
```

### **3. Build Configuration**

`vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### **4. Deploy**

```bash
# Push to GitHub main branch
git push origin main

# Vercel auto-deploys
# Preview: https://gnubg-frontend-git-main.vercel.app
# Production: https://gammonguru.com
```

### **5. Custom Domain**

1. Vercel Dashboard → Settings → Domains
2. Add domain: `gammonguru.com` and `www.gammonguru.com`
3. Update DNS: A record → Vercel IP

---

## 🔐 Secrets Management

### **Railway Secrets**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Set secrets
railway variables set DATABASE_URL="postgresql://..."
railway variables set CLAUDE_API_KEY="sk-ant-..."
railway variables set JWT_SECRET="$(openssl rand -base64 32)"
```

### **Vercel Secrets**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Set secrets
vercel env add VITE_API_URL production
vercel env add VITE_STRIPE_PUBLIC_KEY production
```

---

## 🔄 CI/CD Pipeline

### **GitHub Actions**

`.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build

  deploy-backend:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: |
          # Railway auto-deploys on push to main
          echo "Backend deployed to Railway"

  deploy-frontend:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        run: |
          # Vercel auto-deploys on push to main
          echo "Frontend deployed to Vercel"
```

---

## 📊 Monitoring Setup

### **Sentry**

```bash
# Install Sentry
npm install @sentry/node @sentry/tracing

# Configure
# src/server.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1
});
```

### **UptimeRobot**

1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Add Monitor → HTTP(s)
3. URL: `https://api.gammonguru.com/health`
4. Interval: 5 minutes
5. Alert: Email + Discord webhook

### **Railway Logs**

```bash
# View logs
railway logs

# Follow logs
railway logs --follow

# Filter by service
railway logs --service backend
```

---

## 🔒 SSL/TLS

Both Railway and Vercel provide automatic HTTPS:

- Railway: Automatic SSL via Let's Encrypt
- Vercel: Automatic SSL via Let's Encrypt
- Custom domains: SSL auto-provisioned

---

## 🌍 Environment-Specific Configs

### **Development**

```bash
# .env.development
DATABASE_URL=postgresql://localhost:5432/gammonguru_dev
CLAUDE_API_KEY=sk-ant-test-key
NODE_ENV=development
```

### **Staging**

```bash
# Railway staging environment
DATABASE_URL=postgresql://staging.neon.tech/...
CLAUDE_API_KEY=sk-ant-staging-key
NODE_ENV=staging
```

### **Production**

```bash
# Railway production environment
DATABASE_URL=postgresql://prod.neon.tech/...
CLAUDE_API_KEY=sk-ant-prod-key
NODE_ENV=production
```

---

## 🔄 Rollback Strategy

### **Railway Rollback**

```bash
# View deployments
railway deployments

# Rollback to previous
railway rollback <deployment-id>
```

### **Vercel Rollback**

```bash
# View deployments
vercel ls

# Promote previous deployment
vercel promote <deployment-url>
```

### **Database Rollback**

```bash
# Neon supports point-in-time recovery
# Dashboard → Restore → Select timestamp
```

---

## 📈 Scaling

### **Railway Scaling**

```bash
# Upgrade plan for more resources
# Dashboard → Settings → Plan

# Horizontal scaling (multiple instances)
# Available on Pro plan
```

### **Database Scaling**

```bash
# Neon auto-scales
# Upgrade plan for more storage/connections
```

### **CDN Scaling**

```bash
# Vercel Edge Network handles scaling automatically
# No configuration needed
```

---

## 🧪 Health Checks

### **Backend Health Endpoint**

```typescript
// src/routes/health.ts
app.get('/health', async (req, res) => {
  try {
    // Check database
    await db.query('SELECT 1');
    
    // Check GNUBG
    await executeGNUBGCommand(['hint']);
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'up',
        gnubg: 'up'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});
```

---

## 📋 Deployment Checklist

### **Pre-Deployment**

- [ ] All tests passing
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] GNUBG installed and tested
- [ ] SSL certificates configured
- [ ] Monitoring tools set up

### **Post-Deployment**

- [ ] Health check passing
- [ ] API endpoints responding
- [ ] Frontend loading correctly
- [ ] Database connections working
- [ ] Logs showing no errors
- [ ] Monitoring dashboards active

---

## 🆘 Troubleshooting

### **GNUBG Not Found**

```bash
# Railway: Check nixpacks.toml
# Verify GNUBG_PATH environment variable
railway run gnubg --version
```

### **Database Connection Failed**

```bash
# Check DATABASE_URL format
# Verify Neon database is running
# Check connection limits
```

### **High Memory Usage**

```bash
# Check for GNUBG process leaks
# Implement process pooling
# Monitor with Railway metrics
```

---

<div align="center">

**Deployed on Railway + Vercel + Neon - Production Ready**

</div>
