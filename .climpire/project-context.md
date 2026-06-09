# Project: skattpro

## Tech Stack
Node.js, Prisma

## File Structure
```
├── ai-backend/
│   ├── data/
│   ├── models/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── api/
│   │   │   ├── dashboard.js
│   │   │   └── invoices.js
│   │   ├── auth/
│   │   │   ├── middleware.js
│   │   │   └── routes.js
│   │   ├── db/
│   │   │   └── prisma.js
│   │   ├── integrations/
│   │   │   └── vipps.js
│   │   ├── receipts/
│   │   │   ├── ocr.js
│   │   │   └── README.md
│   │   ├── services/
│   │   │   ├── email.js
│   │   │   ├── invoice-generator.js
│   │   │   └── pdf-generator.js
│   │   ├── tax/
│   │   │   └── forskuddsskatt.js
│   │   ├── categorizer.js
│   │   ├── hybrid-categorizer.js
│   │   ├── llm-categorizer.js
│   │   ├── server-enhanced.js
│   │   └── server.js
│   ├── tests/
│   │   └── test-categorizer.js
│   ├── uploads/
│   ├── .env.example
│   ├── create-invoice.html
│   ├── dashboard.html
│   ├── DEPLOY-PRODUCTION.md
│   ├── DEPLOY.md
│   ├── package.json
│   ├── QUICKSTART.md
│   ├── railway.json
│   ├── README.md
│   ├── review-queue.html
│   ├── server.log
│   ├── UI-GUIDE.md
│   └── WEEK1-REPORT.md
├── ansatte-og-lonn/
│   ├── index.html
│   └── style.css
├── api/
│   ├── fulfill/
│   │   └── index.js
│   ├── dashboard.js
│   ├── generate-key-simple.js
│   ├── generate-key.js
│   ├── health.js
│   ├── invoices.js
│   ├── test-email.js
│   ├── test-webhook.js
│   ├── test.js
│   └── validate-key.js
├── assets/
├── license-server/
│   ├── api/
│   │   ├── generate-key.js
│   │   └── validate-key.js
│   ├── .env.example
│   ├── DEPLOY.md
│   ├── package.json
│   ├── README.md
│   ├── SETUP.md
│   ├── test.js
│   └── vercel.json
├── webhook/
│   ├── api/
│   │   └── fulfill/
│   │       └── index.js
│   ├── index.js
│   ├── package.json
│   └── vercel.json
├── ai-landing.html
├── ai-landing.html.gz
├── COMPETE-WITH-FIKEN.md
├── create-invoice.html
├── create-invoice.html.gz
├── dashboard.html
├── dashboard.html.gz
├── DEPLOY-VERCEL.md
├── faktura-kalkulator.html
├── faktura-kalkulator.html.gz
├── FEATURES.md
├── forskuddsskatt.html
├── forskuddsskatt.html.gz
├── IMPROVEMENTS-ANALYSIS.md
├── IMPROVEMENTS.md
├── index.html
├── index.html.bak
├── index.html.bak2
├── index.html.broken
├── index.html.gz
├── kalkulator.html
├── kommuner_embed.js
├── kommuner_embed.js.gz
├── kommuner.json
├── logo.svg
├── package.json
├── paminnelser.html
├── paminnelser.html.gz
├── PRO_IMPLEMENTATION.md
├── pro-activate.html
├── pro-activate.html.gz
├── pro-features.html
├── pro-features.html.gz
├── pro-keys.json
├── README.md
├── RELEASE-v1.0.md
├── research-fiken-actions.md
├── research-fiken.md
├── robots.txt
├── sammenligning.html
├── sammenligning.html.gz
├── sitemap.xml
├── skattefrister.html
├── skattefrister.html.gz
├── skattpro-common.css
├── skattpro-common.css.gz
├── utgiftssporing.html
├── utgiftssporing.html.gz
└── vercel.json
```

## Key Files
- package.json (355 bytes)
- api/ (10 files)

## README (first 20 lines)
# 🚀 SkattPro AI - Complete Deployment Package

**Mission:** Beat Fiken with 95% automated bookkeeping for Norwegian ENKs  
**Status:** ✅ Production Ready - Week 2 of 8

---

## 📦 What's Included

### Core AI Engine
- ✅ **Rule-based categorizer** (47 rules, 88% auto-rate)
- ✅ **LLM categorizer** (Qwen2.5-72B via Groq)
- ✅ **Hybrid categorizer** (smart routing, 22% LLM usage)
- ✅ **Receipt OCR** (Tesseract.js, Norwegian support)

### API Endpoints
- `POST /api/categorize` - Categorize transactions
- `POST /api/receipt` - Upload & parse receipts
- `GET /api/review-queue` - Get pending reviews
- `POST /api/correction` - Submit user corrections
