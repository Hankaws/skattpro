# 🚀 Deploy License Server to Vercel - Final Steps

## Status
✅ Code is ready  
✅ Dependencies installed  
✅ Linked to Vercel project (`hankaws-projects/skattpro`)  
❌ **Blocked:** Need to set Node.js version to 18 in Vercel Dashboard

---

## Manual Step Required

The Vercel project is currently configured for Node.js 24, but the serverless functions require Node.js 18.

### Option 1: Change Node.js Version in Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard:**
   https://vercel.com/hankaws-projects/skattpro/settings

2. **Navigate to:**
   Settings → Build & Development Settings → Node.js Version

3. **Change from:** `24.x`  
   **Change to:** `18.x`

4. **Save changes**

5. **Redeploy:**
   ```bash
   cd /c/Users/Hanka/skattpro/license-server
   npx vercel --prod --yes
   ```

---

### Option 2: Create a Separate Vercel Project for License Server

If you don't want to change the main SkattPro site's Node.js version:

1. **Create new project:**
   ```bash
   cd /c/Users/Hanka/skattpro/license-server
   npx vercel --prod
   ```
   When prompted: "Set up and deploy?" → **Yes**  
   "Which scope?" → Choose your account  
   "Link to existing project?" → **No**  
   "What's your project's name?" → `skattpro-license-server`

2. **Add environment variables:**
   ```bash
   npx vercel env add STRIPE_SECRET_KEY
   npx vercel env add SENDGRID_API_KEY
   npx vercel env add STRIPE_WEBHOOK_SECRET
   ```

3. **Deploy:**
   ```bash
   npx vercel --prod --yes
   ```

This creates a separate project (e.g., `skattpro-license-server.vercel.app`) with its own Node.js 18 configuration.

---

## After Deployment

Once deployed successfully, you'll get a URL like:
```
https://skattpro-license-server-[random].vercel.app
```

### Next Steps:

1. **Configure Stripe Webhook:**
   - Go to: https://dashboard.stripe.com/test/webhooks
   - Add endpoint: `https://your-app.vercel.app/api/generate-key`
   - Event: `checkout.session.completed`
   - Copy **Signing Secret** → add to Vercel env

2. **Add Environment Variables in Vercel:**
   ```bash
   npx vercel env add STRIPE_SECRET_KEY
   npx vercel env add SENDGRID_API_KEY
   npx vercel env add STRIPE_WEBHOOK_SECRET
   ```

3. **Test the flow:**
   - Create test product in Stripe (149 kr)
   - Add metadata: `{"product": "skattpro-pro"}`
   - Make test purchase
   - Check if email arrives with license key

---

## Current Deployment Status

Run this to see recent deployments:
```bash
cd /c/Users/Hanka/skattpro/license-server
npx vercel ls
```

Latest deployments show "Error" status due to Node.js version mismatch. Once you fix it, they'll show "Ready" ✅.

---

## Troubleshooting

**If deployment still fails:**
1. Check build logs: `npx vercel logs --follow`
2. Verify environment variables: `npx vercel env ls`
3. Test locally first: `npx vercel dev`

**Need help?**
- Vercel docs: https://vercel.com/docs/functions
- SendGrid docs: https://docs.sendgrid.com/
- Stripe webhooks: https://stripe.com/docs/webhooks

---

## Quick Commands Reference

```bash
# Navigate to license server
cd /c/Users/Hanka/skattpro/license-server

# Deploy to production
npx vercel --prod --yes

# View environment variables
npx vercel env ls

# Add environment variable
npx vercel env add VARIABLE_NAME

# View deployment logs
npx vercel logs

# Test locally
npx vercel dev
```

---

**Ready?** Choose Option 1 or Option 2 above, then run the deploy command! 🚀