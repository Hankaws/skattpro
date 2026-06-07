# 🚀 SkattPro AI - Production Deployment Guide

**Version:** 0.3.0 (Enterprise Ready)  
**Status:** ✅ Production Ready

---

## 📦 What's New in v0.3.0

### Enterprise Features
- ✅ **PostgreSQL Database** - User data persistence
- ✅ **User Authentication** - JWT-based auth
- ✅ **Batch Upload** - CSV/JSON transaction import
- ✅ **Forskuddsskatt Calculator** - Advance tax calculation
- ✅ **Review Queue** - Manual categorization workflow
- ✅ **User Corrections** - Model improvement loop

### API Endpoints (New)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get user profile
- `GET /api/transactions` - Get user's transactions
- `POST /api/forskuddsskatt` - Calculate advance tax
- `GET /api/review-queue` - Get pending reviews
- `POST /api/correction` - Submit corrections

---

## 🏗️ Architecture

```
┌──────────────────────┐
│  Frontend (Vercel)   │
│  - Tax Calculator    │
│  - Review Queue UI   │
│  - Forskuddsskatt    │
└──────────┬───────────┘
           │ HTTPS + JWT
           ↓
┌──────────────────────┐
│  AI Backend (Railway)│
│  - Express Server    │
│  - JWT Auth          │
│  - Hybrid AI         │
│  - Receipt OCR       │
└──────────┬───────────┘
           │
           ↓
┌──────────────────────┐
│  PostgreSQL (Railway)│
│  - Users             │
│  - Transactions      │
│  - Receipts          │
│  - Corrections       │
└──────────────────────┘
```

---

## 🚀 Deployment Steps (15 Minutes)

### Step 1: Set Up Railway PostgreSQL

1. Go to https://railway.app
2. Create new project: `skattpro-ai`
3. Add **PostgreSQL** database:
   - Click "New" → "Database" → "PostgreSQL"
   - Wait for deployment
   - Copy the `DATABASE_URL`

### Step 2: Deploy AI Backend

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Navigate to backend
cd ~/skattpro/ai-backend

# Initialize Railway
railway init

# Link to your project
railway link

# Set environment variables
railway vars set DATABASE_URL="postgresql://..."
railway vars set LLM_API_KEY="your_groq_key"
railway vars set JWT_SECRET="your_secure_random_string"

# Deploy
railway up
```

### Step 3: Run Database Migrations

```bash
# Install Prisma CLI globally
npm install -g prisma

# Connect to Railway DB
export DATABASE_URL="postgresql://..."

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed database
node prisma/seed.js
```

### Step 4: Deploy Frontend to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to root
cd ~/skattpro

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? (your account)
# - Link to existing project? N
# - Project name? skattpro
# - Directory? ./
# - Override settings? N
```

### Step 5: Update Frontend API URL

Edit `~/skattpro/index.html` and `review-queue.html`:

```javascript
const API_BASE_URL = 'https://your-app.railway.app/api';
```

Commit and push:

```bash
git add -A
git commit -m "Update API URL for production"
git push
```

---

## 🔐 Environment Variables

### Required (.env)

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/db

# Security
JWT_SECRET=your_32_character_random_string_here

# AI
LLM_API_KEY=gsk_...  # Get from https://console.groq.com

# Server
PORT=3001
NODE_ENV=production
```

### Optional

```bash
# Logging
LOG_LEVEL=info

# Rate limiting
RATE_LIMIT_PER_MINUTE=60

# File upload
MAX_FILE_SIZE_MB=10

# CORS
ALLOWED_ORIGINS=https://skattpro.vercel.app
```

---

## 🧪 Testing Production Deployment

### 1. Health Check

```bash
curl https://your-app.railway.app/api/health
```

Expected:
```json
{
  "status": "ok",
  "version": "0.3.0",
  "database": "connected"
}
```

### 2. Register User

```bash
curl -X POST https://your-app.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!",
    "name": "Test User"
  }'
```

Save the returned `token` for next requests.

### 3. Categorize Transactions (Authenticated)

```bash
curl -X POST https://your-app.railway.app/api/categorize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "transactions": [
      {"id": "1", "amount": -2499, "description": "KLARNA APPLE STORE"},
      {"id": "2", "amount": -899, "description": "VY FLOGBANE"}
    ]
  }'
```

### 4. Calculate Forskuddsskatt

```bash
curl -X POST https://your-app.railway.app/api/forskuddsskatt \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "income": 600000,
    "expenses": 150000,
    "isOslo": true
  }'
```

Expected: ~207k kr annual tax

### 5. Get Review Queue

```bash
curl -X GET https://your-app.railway.app/api/review-queue \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 Monitoring & Maintenance

### Railway Dashboard

- **Logs**: Real-time server logs
- **Metrics**: CPU, memory, network
- **Deployments**: Rollback if needed
- **Environment**: Edit variables

### Database (Prisma Studio)

```bash
# Open Prisma Studio
npx prisma studio
```

Browse users, transactions, corrections visually.

### Alerts to Set Up

1. **Error Rate** - Alert if >5% of requests fail
2. **Response Time** - Alert if avg >1s
3. **Database Size** - Alert if >1GB
4. **LLM Costs** - Alert if >$10/month

---

## 🔒 Security Checklist

- [x] JWT tokens expire (30 days)
- [x] Passwords hashed with bcrypt
- [x] CORS configured for production domain
- [x] File upload size limits (10MB)
- [x] Rate limiting (optional)
- [x] SQL injection prevention (Prisma ORM)
- [x] XSS prevention (React/Vue sanitization)
- [ ] HTTPS enforced (Railway does this)
- [ ] Regular security audits

---

## 💰 Cost Breakdown (Production)

### Monthly Costs

| Service | Tier | Cost | Notes |
|---------|------|------|-------|
| **Railway** | Hobby | $5 | 500 compute hours |
| **PostgreSQL** | Railway | Included | Up to 1GB |
| **Groq API** | Pay-as-you-go | ~$0.50 | 1000 txns/month |
| **Vercel** | Hobby | Free | Unlimited deployments |
| **Total** | | **~$5.50/month** | |

### At Scale (1000 users)

| Metric | Value | Cost |
|--------|-------|------|
| Users | 1000 | - |
| Txn/user/month | 50 | 50,000 total |
| LLM usage (22%) | 11,000 | ~$4.40 |
| Railway (Pro) | 2 instances | $20 |
| **Total** | | **~$25/month** |
| **Revenue** (10% Pro @ 199 kr) | 20,000 kr | **~$2,000** |
| **Margin** | | **99%** |

---

## 🚧 Troubleshooting

### Database Connection Failed

```bash
# Check DATABASE_URL format
echo $DATABASE_URL

# Should be:
# postgresql://user:password@host:5432/dbname

# Test connection
npx prisma db pull
```

### Migration Errors

```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Or deploy fresh
npx prisma migrate deploy
```

### LLM Not Working

```bash
# Test Groq API
curl https://api.groq.com/openai/v1/chat/completions \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"qwen2.5-72b-versatile","messages":[{"role":"user","content":"test"}]}'
```

### High Memory Usage

```bash
# Check Railway metrics
# If >80%, upgrade plan or optimize

# Enable production logging
railway vars set NODE_ENV=production
```

---

## 🎯 Post-Deployment Checklist

### Day 1
- [ ] Health check passes
- [ ] Database migrations applied
- [ ] Test user registration
- [ ] Test transaction categorization
- [ ] Test receipt upload
- [ ] Test forskuddsskatt calculator

### Week 1
- [ ] Monitor error logs daily
- [ ] Check LLM API usage/costs
- [ ] Review first user corrections
- [ ] Collect user feedback

### Month 1
- [ ] Analyze auto-categorization rate
- [ ] Review top corrections (improve rules)
- [ ] Calculate unit economics
- [ ] Plan feature roadmap

---

## 📞 Support

### Documentation
- `QUICKSTART.md` - Getting started
- `DEPLOY.md` - This file
- `WEEK1-4-REPORT.md` - Development reports
- API docs: `GET /api/categories`

### Contact
- GitHub Issues (private repo)
- Email: support@skattpro.no (pending)

---

**Deployed with ❤️ in Stavanger, Norway** 🇳🇴  
**Version 0.3.0** | **Last Updated: June 7, 2026**