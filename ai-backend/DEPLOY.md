# Railway Deployment Guide

## Deploy to Railway

### Option 1: GitHub Integration (Recommended)

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose `Hankaws/skattpro` (private repo - you'll need to authorize Railway)
5. Select root directory: `ai-backend`
6. Railway auto-detects Node.js and deploys!

### Option 2: Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project in ai-backend folder
cd ~/skattpro/ai-backend
railway init

# Deploy
railway up
```

## Environment Variables (Railway Dashboard)

Add these in Railway dashboard → Variables:

```bash
# Required
PORT=3001
LLM_API_KEY=your_groq_api_key_here

# Optional
LLM_MODEL=qwen2.5-72b-versatile
ENABLE_AUDIT_LOG=true
DATA_RETENTION_DAYS=90
DATABASE_URL=postgresql://...  # Add when you set up DB
```

Get Groq API key: https://console.groq.com (free tier available)

## After Deployment

### Test Endpoint

```bash
curl https://your-app.railway.app/api/health
```

### Update Frontend

Edit `~/skattpro/index.html` to point to deployed backend:

```javascript
const API_BASE_URL = 'https://your-app.railway.app/api';
```

### Monitor

- Railway dashboard shows logs, CPU, memory
- Set up alerts for errors
- Monitor LLM API usage in Groq dashboard

## Cost Estimate

**Railway Hobby Plan:**
- $5/month credit
- Free tier: 500 compute hours/month
- **Our backend:** ~$2-3/month (low traffic)

**Groq API:**
- Free tier: 30 requests/minute
- **Our usage:** ~$0.05/month for 1000 txns

**Total:** ~$3-8/month for AI backend 🚀

---

## Production Checklist

- [ ] Set up PostgreSQL database (Railway has built-in Postgres)
- [ ] Enable HTTPS (Railway does this automatically)
- [ ] Set up custom domain (optional)
- [ ] Configure CORS for frontend domain
- [ ] Enable audit logging
- [ ] Set up monitoring/alerts
- [ ] Add rate limiting (prevent abuse)
- [ ] Test with real user data
- [ ] Document API for frontend integration

## Next Steps After Deployment

1. **Test API** with sample transactions
2. **Integrate with frontend** (index.html)
3. **Add user authentication** (optional for beta)
4. **Collect real transactions** from alpha users
5. **Measure actual performance** vs test data
6. **Iterate on rules** based on real usage

---

**Questions?** Check Railway docs: https://docs.railway.app