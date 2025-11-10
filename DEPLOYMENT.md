# 🚀 GammonGuru Deployment Guide

## 📋 Overview

GammonGuru is a real-time Backgammon game with AI coaching, featuring:
- WebSocket multiplayer functionality
- Claude AI and OpenAI integration
- Image generation with Replicate
- Vue.js frontend + Node.js backend

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   AI Services   │
│   (Netlify)     │◄──►│   (Railway)     │◄──►│  (Claude/OpenAI)│
│   Vue.js        │    │   Node.js       │    │   Replicate     │
│   WebSocket     │    │   Express       │    │   APIs          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Backend Deployment (Railway)

### 1. Prerequisites
- Railway account
- GitHub repository connected

### 2. Configuration
The `railway.toml` file contains all necessary configurations:
- Environment variables
- Build settings
- Health checks
- Auto-scaling

### 3. Environment Variables
Set these in Railway dashboard:
```bash
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-proj-...
REPLICATE_API_TOKEN=r8_...
```

### 4. Deployment Steps
1. Connect repo to Railway
2. Railway will auto-detect Node.js
3. Set environment variables
4. Deploy - Railway handles the rest!

### 5. Health Check
Backend will be available at: `https://your-app.railway.app/health`

## 🌐 Frontend Deployment (Netlify)

### 1. Prerequisites
- Netlify account
- Built frontend files

### 2. Build Commands
```bash
cd frontend
npm install
npm run build
```

### 3. Configuration
The `netlify.toml` file contains:
- Build settings
- SPA routing
- Security headers
- API redirects

### 4. Environment Variables
Set these in Netlify dashboard:
```bash
VITE_API_BASE_URL=https://your-backend.railway.app
VITE_WS_BASE_URL=wss://your-backend.railway.app
VITE_CLAUDE_API_KEY=sk-ant-api03-...
VITE_OPENAI_API_KEY=sk-proj-...
VITE_REPLICATE_API_TOKEN=r8_...
```

### 5. Deployment Steps
1. Connect repo to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `frontend/dist`
4. Add environment variables
5. Deploy!

## 🔌 WebSocket Configuration

### Development
- Backend: `ws://localhost:3000`
- Frontend: `http://localhost:5173`

### Production
- Backend: `wss://your-backend.railway.app`
- Frontend: `https://your-frontend.netlify.app`

### WebSocket Endpoints
- Notifications: `wss://backend/ws/notifications?token=xxx`
- Game rooms: `wss://backend/ws/game/:id?token=xxx`
- Chat rooms: `wss://backend/ws/chat/:id?token=xxx`
- Tournament: `wss://backend/ws/tournament/:id?token=xxx`

## 🤖 AI Services Integration

### Claude AI (Anthropic)
```javascript
// API endpoint: /api/claude/chat
// Features: Game analysis, move suggestions, coaching
```

### OpenAI GPT
```javascript
// API endpoint: /api/openai/chat
// Features: General conversation, help system
```

### Image Generation (Replicate)
```javascript
// API endpoint: /api/images/generate
// Features: Board images, diagrams, avatars
```

## 🧪 Testing Production

### 1. Health Checks
```bash
# Backend health
curl https://your-backend.railway.app/health

# WebSocket stats
curl https://your-backend.railway.app/api/ws/stats

# Frontend accessibility
curl https://your-frontend.netlify.app
```

### 2. WebSocket Testing
Open browser console and test:
```javascript
// Test WebSocket connection
const ws = new WebSocket('wss://your-backend.railway.app/ws/notifications?token=your-token');
ws.onopen = () => console.log('WebSocket connected!');
ws.onmessage = (e) => console.log('Received:', e.data);
```

### 3. AI Services Testing
```javascript
// Test Claude API
fetch('https://your-backend.railway.app/api/claude/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Analyze this backgammon position',
    apiKey: 'your-claude-key'
  })
});
```

## 🔒 Security Considerations

### 1. API Keys
- Never expose API keys in frontend code
- Use environment variables
- Rotate keys regularly

### 2. JWT Authentication
- Strong secret keys
- Token expiration
- Secure token storage

### 3. CORS Configuration
- Whitelist allowed domains
- Secure headers
- HTTPS only in production

### 4. WebSocket Security
- Token-based authentication
- Rate limiting
- Connection monitoring

## 📊 Monitoring & Scaling

### Railway (Backend)
- Auto-scaling enabled
- Health checks every 30s
- Logs and metrics available
- Restart on failure

### Netlify (Frontend)
- CDN distribution
- Edge caching
- Build logs
- Form handling

### WebSocket Monitoring
```bash
# Check active connections
curl /api/ws/stats

# Monitor connection health
# View logs in Railway dashboard
```

## 🚨 Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Check WSS URL (not WS)
   - Verify JWT token
   - Check CORS settings

2. **AI API Errors**
   - Verify API keys
   - Check rate limits
   - Review API permissions

3. **Build Failures**
   - Check Node.js version (20+)
   - Verify dependencies
   - Review build logs

4. **Environment Variables**
   - Ensure VITE_ prefix for frontend
   - Check Railway/Netlify dashboards
   - Restart services after changes

### Debug Commands
```bash
# Backend logs (Railway)
railway logs

# Frontend build test
cd frontend && npm run build

# WebSocket test
node backend/src/tests/quick-websocket-test.js
```

## 🎯 Going Live

### Pre-launch Checklist
- [ ] All environment variables set
- [ ] HTTPS certificates active
- [ ] Health checks passing
- [ ] WebSocket connections working
- [ ] AI services responding
- [ ] Frontend builds successfully
- [ ] Security headers configured
- [ ] Monitoring enabled

### Post-launch
- Monitor error rates
- Check WebSocket performance
- Review AI API usage
- Update documentation
- Plan scaling strategy

---

## 📞 Support

For deployment issues:
1. Check Railway and Netlify logs
2. Review this documentation
3. Test with the provided commands
4. Monitor WebSocket connections

**Happy Gaming! 🎲**
