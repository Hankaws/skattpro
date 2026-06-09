# Vercel Auto-Deploy Setup

## Option 1: Vercel GitHub Integration (Recommended - Easiest)

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select GitHub and authorize Vercel if prompted
4. Find `Hankaws/skattpro` in the repository list
5. Click "Import"
6. Keep default settings:
   - Framework Preset: Other
   - Root Directory: `./`
   - Build Command: `vercel build`
   - Output Directory: (leave blank for static)
7. Click "Deploy"

**Benefits:**
- Automatic deployments on every push to `main`
- Preview deployments for pull requests
- No manual token setup needed
- Vercel handles everything

---

## Option 2: GitHub Actions (Already Configured)

I've created `.github/workflows/deploy.yml` for you. To enable it:

### Step 1: Get Vercel Token
1. Go to https://vercel.com/account/tokens
2. Click "Create Token" → "Personal Token"
3. Name it `skattpro-github-actions`
4. Copy the token (starts with `...`)

### Step 2: Add GitHub Secret
```bash
# In repo: Settings → Secrets and variables → Actions → New repository secret
# Name: VERCEL_TOKEN
# Value: (paste your token from step 1)
```

Or via CLI:
```bash
gh secret set VERCEL_TOKEN --body "YOUR_VERCEL_TOKEN_HERE"
```

### Step 3: Enable Workflow
The workflow will automatically trigger on next push to `main`.

---

## Current Status

✅ **Vercel Project Linked:** `hankaws-projects/skattpro`
✅ **Environment Variables Set:**
   - DATABASE_URL (Dev + Prod)
   - JWT_SECRET (Dev + Prod)  
   - STRIPE_SECRET_KEY
   - SENDGRID_API_KEY
   - RESEND_API_KEY
   - STRIPE_WEBHOOK_SECRET
   - STRIPE_SECRET

✅ **Live URL:** https://skattpro.vercel.app
✅ **Custom Domain Ready:**Configure DNS for skattpro.no

---

## Quick Test

To verify setup works, make a small change and push:

```bash
cd ~/skattpro
echo "<!-- test -->" >> index.html
git add -A
git commit -m "test: trigger auto-deploy"
git push origin main
```

Then watch the deployment at:
- GitHub Actions: https://github.com/Hankaws/skattpro/actions
- Vercel Deployments: https://vercel.com/hankaws-projects/skattpro/deployments