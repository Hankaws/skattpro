# SkattPro License Server

Serverless backend for SkattPro Pro license key generation and validation.

## Architecture

```
Stripe Payment → Webhook → Generate Key → Send Email → Activate
                                              ↓
                                    Client validates + stores in localStorage
```

## Setup

### 1. Environment Variables

Create `.env` file:
```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (SendGrid)
SENDGRID_API_KEY=SG....
FROM_EMAIL=noreply@skattpro.no

# Database (optional - can use file-based for simplicity)
DATABASE_URL=file://./licenses.db
```

### 2. Install Dependencies

```bash
npm init -y
npm install express stripe @sendgrid/mail cors dotenv
```

### 3. Run Locally

```bash
node server.js
# Runs on http://localhost:3000
```

### 4. Deploy to Vercel/Netlify

- Push to GitHub
- Connect to Vercel
- Add environment variables
- Deploy

## API Endpoints

### POST /api/generate-key
**Trigger:** Stripe webhook after successful payment

**Request (from Stripe webhook):**
```json
{
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_test_...",
      "customer_email": "user@example.com",
      "metadata": {
        "product": "skattpro-pro"
      }
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "key": "SKATTPRO-PRO-2026A-0001",
  "email": "user@example.com"
}
```

### POST /api/validate
**Trigger:** Client-side validation (optional, for extra security)

**Request:**
```json
{
  "key": "SKATTPRO-PRO-2026A-0001"
}
```

**Response:**
```json
{
  "valid": true,
  "active": true,
  "expires": null
}
```

### GET /api/check/:key
**Alternative validation endpoint**

**Response:**
```json
{
  "status": "active",
  "product": "skattpro-pro",
  "activated_at": "2026-06-07T12:00:00Z"
}
```

## License Key Format

```
SKATTPRO-{TYPE}-{YEAR}{LETTER}-{SEQUENCE}
```

- **TYPE:** `PRO` (regular Pro), `PROS` (Pro Student/Discount)
- **YEAR:** Current year (2026)
- **LETTER:** A-L (month: A=Jan, B=Feb, etc.)
- **SEQUENCE:** 0001-9999

Examples:
- `SKATTPRO-PRO-2026A-0001` (Jan 2026, first customer)
- `SKATTPRO-PRO-2026F-0234` (Jun 2026, 234th customer)

## Email Template

Subject: `Din SkattPro Pro-lisens`

Body:
```
Hei!

Takk for at du kjøpte SkattPro Pro! 🎉

Din lisensnøkkel:
SKATTPRO-PRO-2026A-0001

Slik aktiverer du:
1. Gå til https://skattpro.no/pro-activate.html
2. Lim inn nøkkelen
3. Klikk "Aktiver Pro"

Nøkkelen fungerer på ubegrenset antall enheter.

Trenger du hjelp? Reply til denne e-posten!

Mvh,
SkattPro-teamet
```

## Database Schema (SQLite)

```sql
CREATE TABLE licenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  stripe_session_id TEXT UNIQUE,
  product TEXT DEFAULT 'skattpro-pro',
  status TEXT DEFAULT 'active', -- active, cancelled, expired
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  activated_at DATETIME,
  last_validated DATETIME
);

CREATE INDEX idx_key ON licenses(key);
CREATE INDEX idx_email ON licenses(email);
```

## Security Notes

- License keys are **client-side validated** by default (fast, no API calls)
- Server-side validation is **optional** (for advanced features or audits)
- Keys are **not encrypted** (they're meant to be shared across devices)
- Stripe webhook signature **must be verified** to prevent fraud
- Rate limit validation endpoint (100 req/min per IP)

## Testing

### Test License Key Generation
```bash
curl -X POST http://localhost:3000/api/generate-key \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","stripe_session_id":"cs_test_123"}'
```

### Test Validation
```bash
curl -X POST http://localhost:3000/api/validate \
  -H "Content-Type: application/json" \
  -d '{"key":"SKATTPRO-PRO-2026A-0001"}'
```

## Next Steps

1. ✅ Build basic server (this file)
2. ⏳ Integrate with Stripe webhook
3. ⏳ Add SendGrid email delivery
4. ⏳ Deploy to Vercel
5. ⏳ Update pro-activate.html to call validation API
6. ⏳ Add admin dashboard (view licenses, revoke if needed)