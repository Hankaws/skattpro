# SkattPro AI Backend

AI-powered transaction categorization engine for automatic bookkeeping.

## Architecture

```
Bank APIs (Vipps/Klarna/Stripe)
  ↓
Transaction Stream
  ↓
LLM Categorization (Qwen2.5-72B)
  ↓
Auto-categorized Transactions
  ↓
User Confirmation (1-click approve)
  ↓
Accounting Ledger
```

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

## Environment Variables

```
DATABASE_URL=postgresql://user:pass@localhost:5432/skattpro_ai
LLM_API_URL=http://localhost:11434/api/generate  # Ollama local
# OR
LLM_API_URL=https://api.groq.com/openai/v1/chat/completions
LLM_API_KEY=your_key
VIPPS_API_KEY=your_vipps_key
KLARNA_API_KEY=your_klarna_key
STRIPE_API_KEY=your_stripe_key
```

## API Endpoints

### POST /api/categorize
Categorize a batch of transactions

**Input:**
```json
{
  "transactions": [
    {
      "id": "txn_123",
      "amount": -2499,
      "description": "KLARNA *Apple Store",
      "date": "2026-06-07",
      "type": "card_payment"
    }
  ]
}
```

**Output:**
```json
{
  "results": [
    {
      "id": "txn_123",
      "category": "Kontorutstyr",
      "account": "5400",
      "confidence": 0.94,
      "vat_code": "H1",  # Høy sats (25%)
      "explanation": "Apple Store purchase likely office equipment (computer/accessories)"
    }
  ]
}
```

### POST /api/receipt/ocr
Extract data from receipt image

**Input:** multipart/form-data with image file

**Output:**
```json
{
  "merchant": "Power",
  "date": "2026-06-12",
  "amount": 4999,
  "vat": 1249.75,
  "category": "Driftsmidler",
  "confidence": 0.91
}
```

### GET /api/stats
Get categorization accuracy stats

**Output:**
```json
{
  "total_transactions": 1247,
  "auto_categorized": 1185,
  "manual_review": 62,
  "accuracy": 0.95,
  "avg_confidence": 0.89
}
```

## LLM Prompt Strategy

We use a structured prompt with few-shot examples:

```
You are an expert Norwegian accountant. Categorize this bank transaction:

Transaction:
- Amount: -2,499 kr
- Description: "KLARNA *Apple Store"
- Date: 2026-06-07
- Type: Card payment

Available categories:
- 5400: Kontorutstyr (office supplies, equipment)
- 5050: Varekjøp (inventory for resale)
- 6290: Reklame og marked (marketing expenses)
- 7100: Reise og representasjon (travel, client entertainment)
- 4100: Salgsinntekt varer (sales revenue)
- 1920: Kortsiktig gjeld - Merverdiavgift (VAT payable)

Return JSON:
{
  "category": "string",
  "account": "string (4-digit)",
  "confidence": number (0-1),
  "vat_code": "H1|H0|F|I",  // Høy|Ingen|F megfelel|Mys
  "explanation": "string"
}
```

## Accuracy Targets

- **Month 1:** 80% auto-categorization (>0.85 confidence)
- **Month 2:** 90% auto-categorization (>0.88 confidence)
- **Month 3:** 95% auto-categorization (>0.90 confidence)

## Privacy & Security

✅ All LLM processing on Norwegian servers (no OpenAI)  
✅ Encryption at rest (AES-256)  
✅ GDPR-compliant data handling  
✅ No training on customer data without consent  
✅ Audit trail for all categorizations

## Next Steps

1. **Phase 1 (Week 1-2):** Mock categorizer with rule-based logic
2. **Phase 2 (Week 3-4):** Integrate real LLM API
3. **Phase 3 (Week 5-6):** Fine-tune on labeled Norwegian transactions
4. **Phase 4 (Week 7-8):** Build confidence scoring + human review queue