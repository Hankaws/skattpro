# 🚀 SkattPro vs Fiken - Competitive Strategy

**Mission:** Beat Fiken with AI-first, zero-touch bookkeeping for Norwegian freelancers (ENK)

---

## 🎯 Strategic Wedge

**Target Segment:** Freelancers / ENK (Enkeltpersonforetak)
- ~400,000 ENKs in Norway (2026)
- Fiken charges 149-399 kr/md
- Pain point: Manual receipt categorization, invoice creation, expense tracking
- **Our advantage:** 95%+ automation via LLM + open banking (Vipps/Klarna/Stripe integration)

**Why this wedge:**
- Lower complexity than SMB accounting (no employees, simpler VAT)
- High willingness to pay for time savings
- Fiken is "good enough" but not delightful
- Can expand vertically to håndverkere (tradespeople) later

---

## 📅 Timeline & Milestones

### Phase 1: Foundation (Q2 2026 - Apr-Jun)
**Goal:** Launch AI beta with core automation

**Must Have:**
- [ ] Open banking integration (Vipps Bedrift, Klarna, Stripe)
- [ ] LLM-powered transaction categorization (95%+ accuracy)
- [ ] Receipt OCR + auto-categorization
- [ ] Automated invoice generation from bank data
- [ ] ENK-specific tax optimization (forskuddsskatt calculator)
- [ ] Simple dashboard: "Here's what you earned, here's what you owe"

**Differentiation vs Fiken:**
- Fiken: Manual categorization, rule-based
- SkattPro: AI auto-categorizes, learns from your behavior
- Fiken: "Here's a tool"
- SkattPro: "Here's your done-for-you bookkeeping"

### Phase 2: Expansion (Q3 2026 - Jul-Sep)
**Goal:** Prove retention + word-of-mouth growth

**Features:**
- [ ] Forskuddsskatt auto-calculation + payment reminders
- [ ]智能 invoice suggestions ("You worked with Client X last month, want to invoice them?")
- [ ] Expense optimization ("You spent 5,000 kr on equipment - want to depreciate over 3 years?")
- [ ](["You're on track to pay 42% tax - consider increasing BSU contribution")
- [ ] Integration with Regnskapsterminalen, Visma eAccounting (export)

**Metrics to hit:**
- 100+ paying ENK customers
- >50% MoM growth
- <10% churn
- NPS >40

### Phase 3: Platform (Q4 2026 - Oct-Dec)
**Goal:** Full product launch for 2027 e-invoicing mandate

**Features:**
- [ ] E-invoicing compliance (required 2027)
- [ ] Payroll for 1-3 employees (expand to håndverkere)
- [ ] VAT return auto-filing
- [ ] API for accountants
- [ ] White-label for accounting firms

**Expand to:**
- Håndverkere (electricians, plumbers, carpenters)
- Small agencies (design, marketing, dev shops)
- E-commerce sellers (Vipps + Stripe + Shopify integration)

---

## 💰 Business Model

### Current (Pre-AI)
- **Free:** Tax calculator, basic features
- **Pro (149 kr/md):** Unlimited calcs, PDF export, 3 employees, expense tracking
- **Target:** 2% conversion from free users

### AI Era (Q2 2026+)
- **Free:** Tax calculator + 10 transactions/month auto-categorized
- **ENK (199 kr/md):** Unlimited transactions, auto-invoicing, forskuddsskatt optimization
- **Pro+ (299 kr/md):** ENK + 1 employee, VAT filing, accountant access
- **Target:** 8% conversion (AI is the hook)

**Unit Economics:**
- CAC: 150 kr (content marketing + referral program)
- LTV: 2,388 kr (199 kr × 12 months × 1.0 retention)
- LTV/CAC: 16x (insanely good)

---

## 🏗️ Technical Architecture

### Data Flow
```
Bank APIs (Vipps/Klarna/Stripe) 
  ↓
Transaction Stream
  ↓
LLM Categorization Engine (local LLM for privacy)
  ↓
Auto-generated Invoice/Expense
  ↓
User Confirmation (1-click approve)
  ↓
Accounting Ledger + Tax Calculation
  ↓
Forskuddsskatt Payment Suggestion
```

### Tech Stack
- **Frontend:** Next.js 15, Tailwind, shadcn/ui
- **Backend:** Node.js + Express, PostgreSQL
- **AI:** Qwen2.5-72B-Instruct (local via Ollama or Groq API)
- **Banking:** Vipps Bedrift API, Klarna Merchant API, Stripe API
- **OCR:** Tesseract.js + GPT-4 Vision for receipt parsing
- **Hosting:** Vercel (frontend) + Railway (backend/DB)

### Privacy-First Design
- All LLM processing on Norwegian servers (no data to OpenAI)
- Local encryption for sensitive financial data
- GDPR-compliant by default

---

## ⚔️ Competitive Advantages vs Fiken

| Feature | Fiken | SkattPro | Winner |
|---------|-------|----------|--------|
| **Transaction categorization** | Manual rules | AI auto-learning | 🏆 SkattPro |
| **Invoice creation** | Manual entry | Auto-generated from bank data | 🏆 SkattPro |
| **Receipt handling** | Photo + manual categorize | OCR + AI categorization | 🏆 SkattPro |
| **Tax optimization** | Basic calculator | AI-powered suggestions | 🏆 SkattPro |
| **Forskuddsskatt** | Not included | Auto-calc + payment reminders | 🏆 SkattPro |
| **Pricing** | 149-399 kr/md | 199 kr/md (AI included) | 🏆 SkattPro |
| **Mobile app** | Yes (4.2★) | Web-first (phase 2) | Fiken |
| **Accountant network** | 500+ partners | Phase 3 | Fiken |
| **Brand recognition** | High (market leader) | Low (startup) | Fiken |

**Our wedge:** AI-first automation so good, manual bookkeeping feels archaic

---

## 📈 Go-to-Market Strategy

### Phase 1: Content-Led Growth (Q2 2026)
**Channels:**
- SEO: "ENK regnskap", "forskuddsskatt kalkulator", "frilanser skatt"
- YouTube: "Slik sparer du 10,000 kr i skatt som ENK"
- TikTok/Reels: 30s tax tips for freelancers
- Partnerships: Influencer freelancers (designers, devs, consultants)

**Hook:** "Fiken er bra, men visste du at AI kan gjøre 95% av jobben?"

### Phase 2: Referral Engine (Q3 2026)
- "Inviter 3 venner → 1 month free"
- "Del din skattebesparelse" social share feature
- Freemium model: Free AI categorization for 10 transactions/month

### Phase 3: B2B Expansion (Q4 2026)
- White-label for accounting firms
- API for neobanks (SpareBank 1, Sbanken)
- Integration with Procountor, Visma

---

## 🎯 Success Metrics

### Q2 2026 (AI Beta Launch)
- [ ] 500 waitlist signups
- [ ] 100 beta users (ENK segment)
- [ ] 90%+ transaction categorization accuracy
- [ ] 15% MoM growth

### Q3 2026 (Public Launch)
- [ ] 1,000 paying customers
- [ ] 5% conversion rate (free → paid)
- [ ] <8% monthly churn
- [ ] NPS >40

### Q4 2026 (Scale)
- [ ] 5,000 paying customers
- [ ] 20% of revenue from referrals
- [ ] Expand to håndverkere vertical
- [ ] Series A fundraising (5-10 MNOK)

---

## 🚨 Risks & Mitigation

**Risk:** Fiken launches AI features
- **Mitigation:** Move fast, own the "AI-first" narrative, build moat with proprietary data

**Risk:** Banks block API access
- **Mitigation:** Partner early, use aggregators (Nordigen/Tink), build direct integrations

**Risk:** GDPR/data privacy concerns
- **Mitigation:** Norwegian servers, local LLM, transparent data policy, SOC 2 certification

**Risk:** LLM hallucinations on accounting
- **Mitigation:** Human-in-the-loop (user confirms), audit trail, error detection alerts

---

## 💡 First 30-Day Action Plan

**Week 1-2: Research**
- [ ] Interview 20 ENK freelancers about Fiken pain points
- [ ] Map Vipps/Klarna/Stripe API requirements
- [ ] Prototype LLM categorization with sample bank data

**Week 3-4: Build MVP**
- [ ] Landing page: "AI-powered bookkeeping for ENK"
- [ ] Waitlist form with referral tracking
- [ ] Demo video: "Watch AI categorize 100 transactions in 30 seconds"

**Week 5-6: Alpha Test**
- [ ] Onboard 10 alpha users
- [ ] Manual concierge: We categorize their transactions by hand
- [ ] Learn what 95% automation feels like

**Week 7-8: Build AI**
- [ ] Fine-tune LLM on labeled transactions
- [ ] Build confidence scoring (only auto-approve >90% certain)
- [ ] Create "review queue" for uncertain categorizations

---

## 🔥 North Star Metric

**"Hours saved per customer per month"**

- Fiken user: 5 hours/month on bookkeeping
- SkattPro target: 30 minutes/month (90% time savings)
- Messaging: "Get 4.5 hours back every month"

---

**Bottom line:** Fiken sells tools. SkattPro sells *time back*. That's the wedge.