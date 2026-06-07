# SkattPro License Server Setup Guide

## Overview

This serverless backend handles:
- ✅ Automatic license key generation on Stripe payment
- ✅ Email delivery with beautiful HTML template
- ✅ Optional key validation API
- ✅ Rate limiting for security
- ✅ File-based "database" (upgrade to SQLite/Postgres later)

## Architecture

```
Customer purchases Pro
       ↓
Stripe webhook fires
       ↓
Vercel Function: /api/generate-key
       ↓
1. Generate unique key (SKATTPRO-PRO-2026F-0234)
2. Save to licenses.json
3. Send email via SendGrid
       ↓
Customer receives email with activation link
```

---

## Step 1: Install Dependencies

```bash
cd license-server
npm install
```

---

## Step 2: Get API Keys

### Stripe
1. Go to https://dashboard.stripe.com/apikeys
2. Copy **Secret Key** (starts with `sk_test_` or `sk_live_`)

### SendGrid
1. Go to https://app.sendgrid.com/settings/api_keys
2. Create API Key with "Full Access"
3. Copy the key (starts with `SG.`)

### (Optional) Stripe Webhook Secret
For production, you need webhook signature verification:
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-app.vercel.app/api/generate-key`
3. Select event: `checkout.session.completed`
4. Copy **Signing Secret**

---

## Step 3: Set Environment Variables

Create `.env` file in `license-server/`:

```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_51ABC...xyz

# SendGrid
SENDGRID_API_KEY=SG.xxxxxxxx.yyyyyyyy

# (Optional) Stripe Webhook Secret - for production
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxx

# (Optional) Database URL - for future PostgreSQL upgrade
DATABASE_URL=file://./licenses.json
```

---

## Step 4: Test Locally

```bash
# Install Vercel CLI globally
npm install -g vercel

# Link to your Vercel project
vercel link

# Run dev server
vercel dev
```

The server will run at `http://localhost:3000`

### Test License Generation

Simulate a Stripe webhook:

```bash
curl -X POST http://localhost:3000/api/generate-key \
  -H "Content-Type: application/json" \
  -d '{
    "type": "checkout.session.completed",
    "data": {
      "object": {
        "id": "cs_test_123",
        "customer_email": "test@example.com",
        "metadata": {
          "product": "skattpro-pro"
        },
        "amount_total": 14900,
        "currency": "nok"
      }
    }
  }'
```

Expected response:
```json
{
  "success": true,
  "key": "SKATTPRO-PRO-2026F-0234",
  "email": "test@example.com"
}
```

Check `licenses.json` to see the saved license.

---

## Step 5: Deploy to Vercel

```bash
# Deploy to production
vercel --prod
```

Vercel will give you a URL like: `https://skattpro-license-server.vercel.app`

### Add Environment Variables in Vercel

```bash
vercel env add STRIPE_SECRET_KEY
vercel env add SENDGRID_API_KEY
vercel env add STRIPE_WEBHOOK_SECRET
```

Or use the Vercel Dashboard: Project Settings → Environment Variables

---

## Step 6: Configure Stripe Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. **Add endpoint**
3. URL: `https://skattpro-license-server.vercel.app/api/generate-key`
4. Events to listen for: `checkout.session.completed`
5. Copy **Signing Secret** and add to Vercel env

Now when someone buys Pro, Stripe will automatically:
1. Fire webhook to your Vercel function
2. Function generates key + sends email
3. Customer gets their license instantly!

---

## Step 7: Update Stripe Product Metadata

In your Stripe Product settings (or Payment Link), ensure metadata includes:

```json
{
  "product": "skattpro-pro"
}
```

This ensures only SkattPro-Pro purchases trigger license generation.

---

## File Structure

```
license-server/
├── api/
│   ├── generate-key.js   # Main webhook handler
│   └── validate-key.js   # Optional validation endpoint
├── licenses.json          # Database (auto-created)
├── package.json
├── vercel.json
├── .env                   # Environment variables (gitignore this!)
└── README.md              # This file
```

---

## Database Schema

Each license entry in `licenses.json`:

```json
{
  "key": "SKATTPRO-PRO-2026F-0234",
  "email": "customer@example.com",
  "stripe_session_id": "cs_test_123",
  "product": "skattpro-pro",
  "status": "active",
  "created_at": "2026-06-07T12:00:00Z",
  "activated_at": null,
  "last_validated": null,
  "amount_paid": 149,
  "currency": "nok"
}
```

---

## Email Template

The license email includes:
- ✅ Beautiful gradient header
- ✅ Large, clear license key in dashed box
- ✅ Step-by-step activation instructions
- ✅ Pro features list
- ✅ Support contact info
- ✅mobile-responsive design

---

## Security

- ✅ Rate limiting on validation endpoint (100 req/min/IP)
- ✅ Stripe webhook signature verification (production)
- ✅ Email masking in validation responses
- ✅ CORS headers configured
- ✅ Input validation on all endpoints

---

## Future Upgrades

1. **PostgreSQL Database** (instead of JSON file)
   ```bash
   npm install pg
   ```
   
2. **License Revocation Endpoint**
   ```javascript
   POST /api/revoke-key
   ```

3. **Admin Dashboard**
   - View all licenses
   - Revoke/renew keys
   - Analytics (revenue, activations, etc.)

4. **License Tiers**
   - `PRO` (149 kr/md)
   - `PROS` (student discount, 79 kr/md)
   - `PROLIFE` (lifetime, 1490 kr)

---

## Testing Checklist

- [ ] Local dev server runs (`vercel dev`)
- [ ] License key generates correctly
- [ ] Email sends successfully (check spam folder)
- [ ] Email renders properly on desktop+mobile
- [ ] License saves to `licenses.json`
- [ ] Validation endpoint returns correct response
- [ ] Deployed to Vercel
- [ ] Stripe webhook fires correctly
- [ ] Production environment variables set

---

## Support

Issues? Check:
- Vercel logs: `vercel logs`
- SendGrid logs: https://app.sendgrid.com/email_activity
- Stripe logs: https://dashboard.stripe.com/logs

Need help? Deploy locally and debug with `console.log()`.

---

## Cost Breakdown

**Free tier should cover MVP:**
- Vercel Serverless Functions: Free (100GB-hours/month)
- SendGrid: Free (100 emails/day)
- Stripe: Standard fees (2.9% + 1.75 kr per transaction)

**When you scale:**
- Vercel Pro: $20/month (if needed)
- SendGrid Essentials: $15/month (40k emails)
- PostgreSQL (supabase): Free tier → $25/month

**Total:** ~$0-60/month depending on volume

---

## Next Steps

1. ✅ Install dependencies
2. ✅ Get API keys
3. ✅ Test locally
4. ✅ Deploy to Vercel
5. ✅ Configure Stripe webhook
6. ✅ Test full flow (purchase → email → activate)
7. ✅ Add to production Stripe payment link

Ready to deploy? Run:
```bash
cd license-server
npm install
vercel --prod
```