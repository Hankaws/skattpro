# SkattPro — Full Launch Plan (Phase 0 → MVP → Scale)
**Tagline:** Regnskap som holder deg i forkanten  
**Mission:** Build the most beautiful, fastest, AI-native Norwegian regnskap platform that makes Fiken feel dated. Target first 100 paying customers in <90 days.  
**Positioning:** Modern + delightful UX + 80-95% automation via AI for ENK + small AS. Undercut on price, crush on speed and "it just works".

**Date:** June 2026  
**Stack (as recommended + existing):** Next.js 15 App Router + TypeScript + Tailwind + shadcn/ui + TanStack Query + Prisma + PostgreSQL (Supabase/Neon) + NextAuth (email + future BankID) + Resend (emails) + Stripe + Tesseract.js (OCR) + Groq (LLM for hybrid AI). Hosting: Vercel + Supabase EU.

---

## 1. Analysis of the Polished Landing (skattpro-landing/index.html)

**Strengths (keep 100%):**
- Exact tagline + "Norsk regnskap, menneskelig design".
- Glassmorphism aesthetic (glass / glass-strong / glass-card) with subtle blur, premium feel vs Fiken's dated corporate UI.
- Hero with embedded live-feeling dashboard mock (P&L cards + bar chart) – high conversion.
- Stats with animated counters (social proof: 12.4k businesses, 98% satisfaction, 3500 hrs saved).
- Feature grids that map 1:1 to must-haves (OCR kvitteringer, bankavstemming, skattemelding, lønn).
- Pricing exactly as briefed: 0 / 149 / 399 kr/md. "Mest populær" badge on Pro. Explicit "14 dagers gratis prøveperiode · Ingen kredittkort".
- FAQ, newsletter, contact (static but functional JS).
- Perfect Norwegian Bokmål, mobile-first, accessibility (skip link, aria, focus-visible).
- Sticky floating CTA + scrollspy + theme toggle (light/dark) + back-to-top.
- Tone: Confident, helpful, zero corporate fluff. "Alt du trenger... i ett enkelt, moderne system."

**Conversion elements to preserve/port:**
- Immediate "Start gratis prøveperiode" CTAs.
- Visual "before you sign up" proof (dashboard screenshots/mocks).
- Clear tier differentiation (ENK vs AS/lønn).
- Trust signals: GDPR, EU data, "Betalt SSL".

**Gaps in static version (to fix in real product):**
- Forms are alerts only → wire to real Resend + waitlist DB + onboarding.
- No real auth gates or "Logg inn" flow leading to product.
- No live data in mocks.
- Pricing links dead.

**Recommendation:** Port this HTML verbatim in spirit (exact colors, spacing, micro-interactions, copy) into Next.js React components inside `(marketing)` route group. Make homepage = this experience. Add real "Logg inn" button in nav that goes to /auth/signin. After signup/login → redirect to /dashboard with company switcher.

Existing Desktop/skattpro/index.html is a good secondary/older variant but the skattpro-landing one is the "attached" winner.

---

## 2. Existing Assets Inventory (Leverage Ruthlessly)

**High-value code to port/integrate immediately:**
- `/skattpro` (this dir): Next.js 15 skeleton (perfect), partial Prisma (Account/Transaction/Company/Invoice), NextAuth wiring, dashboard stub with auth guard + StatCards mirroring landing numbers, TanStack Query ready, shadcn primitives.
- `Desktop/skattpro/ai-backend/`:
  - `src/categorizer.js` + `hybrid-categorizer.js` + `llm-categorizer.js`: 47+ Norwegian rules, 88%+ auto, hybrid routing (rules first, LLM only on low-conf/high-value). VAT codes (H1/H0/F/I), kontoplan mapping.
  - `src/receipts/ocr.js`: Tesseract.js + nor+eng, extracts merchant/date/amount/vat.
  - `src/tax/forskuddsskatt.js`: Accurate 2026 ENK calc (trygdeavgift 23.3%? + brackets + personal deduction + quarterly schedule Mar/May/Sep/Nov 15).
  - `src/services/pdf-generator.js`, `invoice-generator.js`, email stubs.
  - `src/integrations/vipps.js` stub.
  - Good Prisma models in its schema (User + AI fields on Transaction + Receipt + Correction feedback loop).
- Static prototypes (`create-invoice.html`, `dashboard.html`, `utgiftssporing.html`, `paminnelser.html` etc.): Use for exact flows, copy, microcopy, and component inspiration.
- `kommuner.json`, research docs (COMPETE-WITH-FIKEN.md, FEATURES.md): Gold for copy and roadmap.
- `skattpro-v2/`, `skattpro-landing/`: Source of truth for marketing visuals/CSS.

**Consolidation rule:** Everything lives in `C:\Users\Hanka\skattpro` going forward. Copy key logic from ai-backend/src into `src/lib/ai/`, `src/lib/tax/`, `src/lib/ocr/`. Keep ai-backend as reference or delete after port. Use the root Prisma schema as base and merge the best fields.

**Current state of /skattpro Next.js:**
- Root `/` redirects to dashboard (change this).
- Basic (app) group with stubs + auth layout.
- Good deps already (Prisma, NextAuth beta, shadcn pieces, Tanstack, zod, rhf).
- Missing for speed: date-fns, papaparse (CSV), tesseract.js, @react-pdf/renderer or pdf-lib, sonner (toasts), framer-motion (for landing animations), lucide already good, resend, stripe, @supabase/ssr or direct pg.

---

## 3. Recommended Project Structure (Final)

```
skattpro/
├── src/
│   ├── app/
│   │   ├── (marketing)/                 # ← The beautiful landing lives here
│   │   │   ├── layout.tsx               # Public nav (no app chrome)
│   │   │   ├── page.tsx                 # Exact port of skattpro-landing/index.html (React)
│   │   │   ├── features/
│   │   │   ├── pricing/
│   │   │   ├── blog/                    # SEO content (Phase 1+)
│   │   │   └── ...
│   │   ├── (app)/                       # Authenticated SaaS
│   │   │   ├── layout.tsx               # App shell + company switcher + user menu
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx             # Real-time P&L, cashflow, forecasts, AI insights
│   │   │   ├── transactions/
│   │   │   │   ├── page.tsx
│   │   │   │   └── upload/
│   │   │   ├── receipts/
│   │   │   │   └── page.tsx             # Camera/Upload + OCR results + confirm
│   │   │   ├── invoices/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/
│   │   │   │   └── [id]/
│   │   │   ├── reports/
│   │   │   │   ├── mva/
│   │   │   │   ├── forskuddsskatt/
│   │   │   │   └── annual/
│   │   │   ├── payroll/                 # Phase 2
│   │   │   ├── settings/
│   │   │   │   ├── company/
│   │   │   │   ├── integrations/        # Bank, Vipps, Stripe connect stubs
│   │   │   │   └── billing/
│   │   │   └── companies/               # Multi-company switcher + create
│   │   ├── (auth)/
│   │   │   ├── signin/
│   │   │   └── signup/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/
│   │   │   ├── companies/
│   │   │   ├── transactions/
│   │   │   │   ├── route.ts
│   │   │   │   └── upload/route.ts      # CSV + direct
│   │   │   ├── receipts/                # OCR + create tx
│   │   │   ├── invoices/
│   │   │   ├── categorize/              # POST batch → hybrid AI
│   │   │   ├── stripe/
│   │   │   │   └── webhook/route.ts
│   │   │   ├── reports/
│   │   │   └── integrations/vipps/...
│   │   ├── globals.css                  # Merge landing glass styles + shadcn
│   │   ├── layout.tsx                   # Root (metadata, providers)
│   │   └── providers.tsx
│   ├── components/
│   │   ├── marketing/                   # Hero, PricingCard, FAQ, StatsCounter, GlassCard, etc.
│   │   ├── app/                         # AppShell, CompanySwitcher, TransactionTable, ReceiptUploader, InvoiceForm, etc.
│   │   └── ui/                          # shadcn + custom (glass variants)
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── hybrid-categorizer.ts    # Port + TS + seed 60+ rules
│   │   │   ├── rules.ts
│   │   │   └── llm.ts                   # Groq client (thin)
│   │   ├── tax/
│   │   │   ├── forskuddsskatt.ts
│   │   │   ├── mva.ts
│   │   │   └── kontoplan.ts             # Full standard Norwegian 4-digit + descriptions
│   │   ├── ocr/
│   │   │   └── client.ts                # Tesseract wrapper (client or server)
│   │   ├── db.ts                        # prisma singleton
│   │   ├── stripe.ts
│   │   ├── utils.ts
│   │   └── constants.ts                 # VAT rates, payment schedules, etc.
│   ├── server/
│   │   └── actions/                     # Server actions for mutations (invoices, categorize)
│   └── types/
├── prisma/
│   └── schema.prisma                    # Master schema (expanded)
├── public/
│   ├── logo.svg (from existing)
│   └── images/ (mocks, illustrations)
├── .env.example
├── .env.local (gitignored)
├── next.config.js
├── tailwind.config.ts                   # Extend with glass tokens + primary #3B82F6 or #4f46e5 (match landing)
├── LAUNCH-PLAN.md
├── COMPETE-WITH-FIKEN.md (copy key ones here)
└── package.json
```

**Key principle:** Marketing experience (glass, delightful, fast) must feel identical to the static landing. App experience re-uses the same visual language but with functional tables, forms, toasts, real-time feel.

---

## 4. Database Schema (Prisma) — Final MVP Version

Merge the two existing schemas + add what's missing for compliance + features. Use Decimal everywhere for money.

```prisma
// prisma/schema.prisma (full recommended)
generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql"; url = env("DATABASE_URL") }

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  // NextAuth
  accounts      Account[]
  sessions      Session[]
  // Business
  companies     Company[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Company {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  name          String
  orgNumber     String?  @unique
  type          String   // ENK | AS | ANS | etc.
  address       String?
  postalCode    String?
  city          String?
  country       String   @default("NO")
  vatRegistered Boolean  @default(true)
  fiscalYearStart DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  accounts      Account[]
  transactions  Transaction[]
  invoices      Invoice[]
  receipts      Receipt[]
  subscriptions Subscription[]
  // later: employees, payrollRuns
}

model Account {  // Bank / cash accounts
  id               String   @id @default(cuid())
  companyId        String
  company          Company  @relation(fields: [companyId], references: [id])
  name             String
  type             String   // bank | cash | card
  iban             String?
  last4            String?
  balance          Decimal  @default(0) @db.Decimal(12,2)
  lastReconciledAt DateTime?
  createdAt        DateTime @default(now())
}

model Transaction {
  id          String   @id @default(cuid())
  companyId   String
  company     Company  @relation(fields: [companyId], references: [id])
  accountId   String?
  account     Account? @relation(fields: [accountId], references: [id])

  date        DateTime
  amount      Decimal  @db.Decimal(12,2)   // negative = expense
  description String
  merchant    String?
  reference   String?

  // Bookkeeping
  category    String?  // e.g. "Salgsinntekt tjenester"
  accountCode String?  // "3010"
  vatCode     String?  // "H1" | "H0" | "F" | "I" | "K" (use accurate Norwegian)
  vatRate     Decimal? @db.Decimal(5,2)
  vatAmount   Decimal? @db.Decimal(12,2)

  // AI
  aiConfidence Float?
  aiMethod     String?  // rule | llm | hybrid | manual
  aiExplanation String?

  isReconciled Boolean @default(false)
  attachments  String[] @default([])  // receipt ids or urls

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([companyId, date])
  @@index([companyId, category])
}

model Receipt {
  id            String   @id @default(cuid())
  companyId     String
  company       Company  @relation(fields: [companyId], references: [id])
  transactionId String?  @unique
  transaction   Transaction? @relation(fields: [transactionId], references: [id])

  imageUrl      String
  originalName  String
  ocrText       String?
  ocrMerchant   String?
  ocrDate       DateTime?
  ocrAmount     Decimal? @db.Decimal(12,2)
  ocrVatAmount  Decimal?
  ocrVatRate    Float?
  ocrConfidence Float?
  createdAt     DateTime @default(now())
}

model Invoice {
  id            String   @id @default(cuid())
  companyId     String
  company       Company  @relation(fields: [companyId], references: [id])

  invoiceNumber String   @unique
  status        String   // draft | sent | paid | overdue | canceled | reminded
  customerName  String
  customerEmail String?
  customerOrgNr String?

  issueDate     DateTime
  dueDate       DateTime
  currency      String   @default("NOK")

  subtotal      Decimal  @db.Decimal(12,2)
  vatAmount     Decimal  @db.Decimal(12,2)
  total         Decimal  @db.Decimal(12,2)

  lineItems     Json     // [{desc, qty, unitPrice, vatRate, accountCode}]
  pdfUrl        String?
  ehfXmlUrl     String?  // Phase 2

  sentAt        DateTime?
  paidAt        DateTime?
  reminderCount Int      @default(0)
  lastReminderAt DateTime?

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([companyId, status])
}

model Subscription {
  id            String   @id @default(cuid())
  companyId     String   @unique
  company       Company  @relation(fields: [companyId], references: [id])
  plan          String   // starter | pro | bedrift
  status        String   // trialing | active | past_due | canceled
  stripeSubId   String?  @unique
  stripePriceId String?
  currentPeriodEnd DateTime?
  trialEndsAt   DateTime?
  createdAt     DateTime @default(now())
}

// NextAuth tables (standard)
model Account { ... } // NextAuth Account
model Session { ... }
model VerificationToken { ... }

// Future MVP+ models (add when needed):
// PayrollRun, Employee, MvaReport, BankConnection (for future PSD2 tokens)
```

**Seeding:**
- `kontoplan` as JSON or separate table (code + name + vat_default + type).
- Default company on signup for ENK flow (fastest path).

**Migrations:** Use `prisma migrate dev` early.

---

## 5. Phase 0: Foundation (Days 1-4) — Concrete Commands & Tasks

**Goal:** Have the exact landing live at root, real auth, working DB, deployable skeleton. Users can sign up and see a beautiful (if empty) app.

**First commands to run (PowerShell, from C:\Users\Hanka\skattpro):**

```powershell
# 1. Install missing production deps (speed + features)
npm install date-fns papaparse tesseract.js sonner resend stripe @react-pdf/renderer lucide-react@latest framer-motion

# Dev only
npm install -D @types/papaparse

# 2. shadcn/ui additions (run one by one or batch)
npx shadcn@latest add button card dialog dropdown-menu input label select table tabs textarea toast form avatar badge alert

# 3. Prisma (enhance schema first, then)
npx prisma generate
# After schema edit:
npx prisma db push   # or migrate dev for real history

# 4. Create .env.local from example (see below)
# Add:
# DATABASE_URL="postgresql://..."
# NEXTAUTH_SECRET=...
# NEXTAUTH_URL=http://localhost:3000
# GROQ_API_KEY=...          # for AI (or skip for pure rules MVP)
# RESEND_API_KEY=...
# STRIPE_SECRET_KEY=...
# STRIPE_WEBHOOK_SECRET=...
# UPLOADTHING or SUPABASE keys later for storage

# 5. Run dev
npm run dev
```

**.env.example additions (Norwegian friendly):**
```
DATABASE_URL="postgres://..."
DIRECT_URL="..." # for Supabase pooling if used

# Norwegian business
DEFAULT_VAT_RATE=0.25
FORSKUDDSSKATT_QUARTERS=2026-03-15,2026-05-15,2026-09-15,2026-11-15

# AI (optional early)
GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile   # or qwen if available

# Email + Payments
RESEND_API_KEY=
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Storage (Phase 1.5)
# SUPABASE_URL=...
```

**Phase 0 deliverables (must ship before Phase 1 code):**
- Marketing homepage = pixel-perfect (or 98%) React port of skattpro-landing/index.html.
  - All sections, animations (use framer + useEffect for counters/FAQ/scrollspy/theme).
  - Theme toggle matches exactly.
  - Pricing cards with real "Start 14-dagers prøve" buttons → /auth/signup?plan=pro (with trial flag).
  - "Logg inn" in nav → /auth/signin.
- Auth: Working email/password or magic link via NextAuth + Prisma adapter. On signup create default Company (ENK) + Subscription (trialing 14 days, plan=pro).
- Basic app shell in (app)/layout with CompanySwitcher (even if 1 company), user menu, logout.
- One seeded "demo" transaction + receipt flow for new users (or empty state with "Upload your first CSV" or "Try demo data").
- Deploy to Vercel (connect repo, add envs). Custom domain later (skattpro.no).
- Health check + basic /api/health.

**Porting the landing — exact steps:**
1. Create `src/app/(marketing)/layout.tsx` (minimal nav + footer + no auth chrome).
2. Create `src/app/(marketing)/page.tsx`.
3. Extract reusable: `components/marketing/GlassCard.tsx`, `StatsCounter.tsx` (use useInView + framer or requestAnimationFrame), `PricingCard.tsx`, `FAQAccordion.tsx`, `HeroDashboardMock.tsx` (the SVG-ish bar chart + 3 stat cards).
4. Copy all Tailwind custom CSS from <style> into globals.css under .glass etc. (or scoped).
5. Recreate all JS behavior with React (useState for FAQ open, useEffect for observers, theme via next-themes or custom to match exactly).
6. Replace hard-coded numbers in mocks with small live stats if possible (or keep as social proof).
7. Add real CTAs.

**Update root layout metadata** to match landing exactly.

---

## 6. Priority Feature Implementation Order (MVP — Phase 1, Weeks 1-5)

**North Star:** "User uploads bank CSV or photo → 85%+ auto-categorized + reconciled + beautiful dashboard + one-click invoice in <5 min total."

**Order (do not deviate — each unlocks the next):**

1. **Multi-company + Company context (2-3 days)**
   - Company model + switcher in app header (dropdown + create new ENK/AS form with orgnr lookup via Brreg API proxy).
   - All queries scoped by companyId (middleware or RLS pattern in actions).
   - Onboarding: after signup, "Create your company" (pre-fill ENK if possible).

2. **Transactions core + Bank import (manual first) (4-5 days)**
   - /transactions page: table (date, desc, amount, category, accountCode, vat, confidence badge, actions).
   - CSV upload (papaparse) — support common Norwegian bank formats (DNB, Nordea "kontoutskrift", Sparebank1). Auto-detect columns or simple mapper.
   - Manual add transaction form.
   - "Sync" button (stub for future).
   - On import: run hybrid-categorizer immediately → save with confidence badges (green >85, yellow 60-85, red <60 → needs review).
   - Reconcile toggle + bulk actions.

3. **Hybrid AI Categorization (port immediately, 2 days)**
   - Port rules + hybrid logic to `src/lib/ai/hybrid-categorizer.ts`.
   - Expand rules to 60+ (use existing + add more from real bank samples: Meny, Vy, Klarna, etc.).
   - Seed full kontoplan (use the CATEGORIES + more standard ones: 1920 MVA, 1500 etc.).
   - API route or server action: POST /api/categorize { transactions: [...] } → returns categorized.
   - Feedback: "Correct category" button → write to Correction table + optionally re-train signal (for future fine-tune).
   - Early win: "AI just categorized 87 of your 92 transactions. Review the 5 uncertain ones?"

4. **Receipts + OCR (3-4 days)**
   - /receipts page: Drag-drop or camera (mobile) upload.
   - Client-side Tesseract (tesseract.js) for instant OCR (privacy win) → preview extracted fields.
   - On confirm: create Receipt + auto-create Transaction (pre-categorized) + link.
   - Server fallback or enhancement with vision if Groq/OpenAI key (add "Use AI vision" toggle).
   - List of receipts with "Match to transaction" or auto-match by amount/date.

5. **Invoicing MVP + Recurring + Purring (5-7 days)**
   - /invoices: list + status filters (use existing Invoice model).
   - New invoice form (customer, lines with accountCode + VAT auto, totals live calc).
   - Generate PDF (use @react-pdf/renderer or port existing pdf service — embed logo, Norwegian terms, MVA breakdown, "Betales til konto XXX").
   - Send (Resend email with PDF link or attachment).
   - Mark paid (one click → creates revenue transaction).
   - Recurring: simple "Create recurring" (cron stub or manual "Generate next" for MVP).
   - Purring: "Send reminder" button (increments reminderCount, sends polite Norwegian email template: "Purring: Faktura #INV-0042 forfalt 12 dager siden").
   - Status auto: overdue if past due + not paid.

6. **Dashboard — Real & Beautiful (3 days)**
   - Pull live aggregates (use TanStack Query + server actions or API).
   - Cards: Omsetning YTD/MTD, Utgifter, Resultat, Cash position (bank balances).
   - Charts: Monthly P&L bars (recharts or simple CSS bars first), Cashflow line.
   - AI insights box (from tx data): "You are on track for 42% effective tax. Consider equipment purchase before Dec 31." (hardcoded rules + later LLM).
   - Recent activity + "Review 4 low-confidence items" CTA.
   - Forecast stub (simple: average last 3 months run-rate).

7. **Simple Bookkeeping & MVA basics (parallel with above)**
   - Chart of accounts view (read-only seed of standard Norwegian).
   - MVA report page: Period selector → auto calc output tax (sales H1), input tax (expenses), net payable/refundable. Export CSV ready for Altinn.
   - Bilag view: Every tx is a bilag. Add attachment/notes.

8. **Billing for SkattPro itself (parallel, 3 days)**
   - /settings/billing: Current plan badge (from Subscription).
   - "Upgrade to Pro — 149 kr/md" → Stripe Checkout (14-day trial enforced server-side).
   - Webhook handler: update Subscription on invoice.paid, trial ends, etc.
   - Enforce limits softly first (e.g. Starter: max 50 tx/month — show upgrade nudge).

**Phase 1 exit criteria (ready for closed beta):**
- New user: signup → create company → upload CSV or 3 receipts → 80%+ categorized → dashboard shows real numbers → creates + sends 1 invoice → sees MVA summary.
- 14-day trial active.
- Mobile: Upload receipt from phone camera works great.
- Everything feels faster and cleaner than Fiken.

---

## 7. Phase 2: Compliance, Bank, Polish & Differentiation (Weeks 5-9)

- Real bank connections: Add "Connect with Vipps Bedrift" (finish the stub) + "Upload full statement" (OFX + more CSV parsers). Document PSD2 path (Tink/Nordigen + BankID consent flow).
- EHF generation: Basic EHF 3.0 XML for invoices (Peppol). Button "Send as EHF" (save file or email to customer).
- Skattemelding / Årsoppgjør prep: Forskuddsskatt UI (port the excellent calculator, save estimates, set reminders). Generate "Skatteoppgave 2026" PDF with all relevant data + export for RF-1037 etc. (ENK personal tax return includes business).
- A-melding + Lønn (small teams): Simple employee add (name, fnr last4, salary type), monthly lønnskjøring calc (brutto→netto with trygdeavgift + skattetrekk stub), generate A-melding XML stub + "Download for Altinn".
- Advanced AI: Tax optimization suggestions drawer. Anomaly flagging. "Smart invoice suggestion" from recurring bank credits.
- Better forecasts + scenarios.
- Accountant read-only invite (Phase 2.5).
- PWA manifest + offline receipts for field workers (håndverkere wedge).

**Norwegian compliance checklist (non-negotiable):**
- All money in NOK, Decimal precision.
- Correct MVA rates/codes (25% standard, 15% food, 12% transport/passenger, 0% export/medical). Use official terms: "Merverdiavgift", "Inngående mva", "Utgående mva".
- Forskuddsskatt dates exact.
- 5-year retention note in privacy.
- Data residency: Supabase/Neon in EU/NO region + clear "Data lagres i Europa".
- Export everything (CSV + full JSON + PDF reports).
- Altinn/Skatteetaten: "Klar for innsending" badges + step-by-step guides + generated files. Never claim "we file for you" until you have proper integration/partner status.
- Brønnøysund: Proxy https://data.brreg.no/enhetsregisteret/api/enheter/{orgnr} for name/address auto-fill.
- GDPR: Privacy page (from landing), "Slett alle data" button in settings (cascade delete), data export endpoint.

---

## 8. Early AI Features to Differentiate (Add in Phase 1)

1. Hybrid categorization (already prototyped — highest leverage).
2. Receipt → full transaction in one flow.
3. "Did you mean to invoice this?" — after import of large credit, suggest draft invoice prefilled.
4. Weekly email (Resend) + in-app: "You saved 4.2 hours this week. AI auto-categorized 94%."
5. Simple tax forecaster on dashboard: "Estimated forskuddsskatt next quarter: 48 200 kr. Pay by 15 May."
6. Correction learning loop (store every override).
7. Later (cheap): Call Groq with transaction + recent user history for "why this category" explanation.

**Cost control:** Rules first (0 cost). LLM only on <15-20% of tx or high-value. Target < $0.001 per tx.

---

## 9. Marketing & Launch Strategy — First 100 Paying Customers Fast

**Positioning (repeat everywhere):**
- "Fiken er bra. SkattPro er ferdig."
- "95% automatisert regnskap for ENK og små AS."
- "Få 4-5 timer tilbake hver måned."

**Pricing (match landing exactly, with annual 20% off hook):**
- Starter 0 kr (capped, great for testing).
- Pro 149 kr/md (or 1 490 kr/år).
- Bedrift 399 kr/md.
- 14 days full Pro trial, no card. Clear "Cancel anytime".

**GTM — Content + Distribution (start Day 1 of Phase 0):**

**Content (Norwegian, high-intent SEO + social):**
- Blog posts (add /blog in marketing): "Forskuddsskatt 2026 – frister og kalkulator", "Slik sparer du skatt som ENK i 2026", "MVA-fradrag for frilansere og håndverkere", "EHF-faktura fra 2027 – er du klar?", "Hva koster regnskap egentlig? Fiken vs SkattPro".
- Free tools: Embed the forskuddsskatt calculator as public tool (drives signups).
- YouTube/TikTok/Instagram Reels: 60-90s "Jeg lastet opp 3 måneders bankutskrift → AI gjorde alt på 40 sekunder".
- Comparison: /sammenligning (port existing) with honest "Fiken vs SkattPro" table (we win on AI/automation/speed/price).

**Acquisition channels for first 100:**
1. **SEO + organic (long tail):** Target "regnskap online", "faktura program ENK", "alternativ til Fiken", "forskuddsskatt kalkulator", "a-melding ENK".
2. **Referral:** "Inviter en venn → begge får 1 måned Pro gratis". Viral in frilanser Slack/Discord/Facebook groups.
3. **Direct outreach:** Find 200 ENK on LinkedIn (designers, devs, konsulenter, fotografer) + personalized "Jeg bygde dette fordi Fiken føles tregt. Prøv gratis 14 dager?".
4. **Partnerships:** 5-10 regnskapsførere / regnskapskontor (give them free Bedrift seats for clients + revenue share). They hate manual data entry too.
5. **Communities:** Frilans Norge, Håndverksbedrift groups, "ENK Norge" FB groups. Offer free Pro for first 50 beta users who give feedback.
6. **PR:** Reach out to Shifter, DN, TU. "Norsk AI-regnskap startup tar opp kampen med Fiken".
7. **Waitlist on landing:** Even before full features, capture emails with "Beta access + early pricing".

**Metrics to hit for "first 100":**
- 500+ signups in first 30 days of public.
- 25-30% trial → paid (AI delight drives this).
- <8% monthly churn.
- NPS > 50 from beta users.
- Content: 3-4 high-ranking blog posts.

**Launch sequence:**
- Week 0-4: Closed alpha (friends + 10 ENK from network) → iterate on real feedback.
- Week 5: Public beta with "Founding member" badge + lifetime discount for first 100.
- Day of public: Post on LinkedIn + X + Norwegian forums + email waitlist. "SkattPro er live. Prøv gratis i 14 dager."
- Ongoing: Weekly content drop + feature release notes.

---

## 10. Risks & Mitigations (Be Honest)

- Bank APIs hard/expensive → MVP = excellent manual + CSV + Vipps. Market "Works great with the banks you already use".
- Altinn filing complexity → "Export ready for Altinn in 2 clicks + full instructions". Partner for full auto later.
- LLM hallucinations on tax → Human review always + confidence scores + "This is a suggestion" + audit trail. Never auto-file.
- Fiken copies AI → Move faster on UX + niche (ENK + beautiful) + data moat from corrections.
- Churn → Obsess over time-saved metric. Send "You saved X hours this month" emails.
- Data residency fears → Be extremely transparent: "All data in EU. Full export + delete in one click."

---

## 11. Immediate Next Actions (Start Today)

1. (You are here) Read this plan.
2. Run the Phase 0 npm + shadcn commands above.
3. Copy the full skattpro-landing/index.html content + styles into a working (marketing) page.tsx (or use this plan as spec and have an implementer agent do it).
4. Expand Prisma schema + `prisma db push`.
5. Port the hybrid categorizer + 1-2 rules tests.
6. Make the first real transaction import + categorize flow work end-to-end.
7. Deploy the marketing site (even with stub app links) and share the Vercel URL for feedback.

**This is buildable in 4-6 focused weeks to a compelling public beta.**

SkattPro will win because it feels like the future while doing Norwegian compliance correctly and saving real humans real hours.

Let's ship. 🇳🇴

---

**Appendix Quick Links (internal)**
- Existing AI logic: Desktop/skattpro/ai-backend/src/
- Landing source: ../skattpro-landing/index.html (or Desktop/skattpro/index.html)
- Prototypes for flows: Desktop/skattpro/*.html
- Research: COMPETE-WITH-FIKEN.md, FEATURES.md

Update this plan as we learn from real users.
