# 🚀 SkattPro - Vercel Deployment Guide

**Status:** ✅ Ready to Deploy

---

## 📋 Pre-Deployment Checklist

- [x] Code pushed to GitHub: `https://github.com/Hankaws/skattpro`
- [x] `vercel.json` configured
- [x] API functions in `/api` folder
- [x] Static files (HTML) in root
- [x] `.gitignore` configured
- [x] `package.json` with dependencies

---

## 🔧 Step-by-Step Deployment

### Method 1: Vercel Dashboard (Easiest - Recommended)

**1. Go to Vercel**
- Visit: https://vercel.com/new
- Click "Import Git Repository"

**2. Connect GitHub**
- Select "GitHub" (if not connected, click "Connect GitHub")
- Authorize Vercel to access your GitHub repos
- Find and select `Hankaws/skattpro`

**3. Configure Project**
- **Framework Preset:** `Other`
- **Root Directory:** `./` (keep default)
- **Build Command:** Leave empty (no build needed)
- **Output Directory:** `./` (keep default)

**4. Environment Variables**
Click "Environment Variables" and add:
```
DATABASE_URL=postgresql://user:password@host:5432/skattpro
JWT_SECRET=your-secret-key-here-change-in-production
```
*(For alpha demo, these are optional - API will use mock data)*

**5. Deploy**
- Click "Deploy"
- Wait 2-3 minutes
- Get your live URL: `https://skattpro.vercel.app`

---

### Method 2: Vercel CLI (Alternative)

```bash
# 1. Navigate to project
cd C:\Users\Hanka\skattpro

# 2. Login to Vercel
npx vercel login

# 3. Link to GitHub repo
npx vercel link --repo

# 4. Deploy to production
npx vercel --prod
```

---

## 🎯 What Gets Deployed

### Static Files (Served directly)
- `dashboard.html` → `/dashboard.html`
- `create-invoice.html` → `/create-invoice.html`
- `index.html` → `/` (tax calculator)
- `review-queue.html` → `/review-queue.html`
- All CSS/JS from CDNs

### Serverless Functions (API)
- `/api/health.js` → `GET /api/health`
- `/api/dashboard.js` → `GET /api/dashboard/profit`
- `/api/invoices.js` → `POST /api/invoices/create`

---

## 🧪 After Deployment - Test Your Live Site

**1. Access Dashboard**
```
https://skattpro.vercel.app/dashboard.html
```

**2. Test API**
```
https://skattpro.vercel.app/api/health
```
Expected: `{"status":"ok","version":"0.5.0-alpha"}`

**3. Test Invoice Generator**
```
https://skattpro.vercel.app/create-invoice.html
```
- Fill in form
- Click "Lag faktura PDF"
- Should download PDF invoice

---

## 📊 Expected Results

### ✅ Working Features (Alpha)
- Dashboard UI with mock data
- Invoice generator (PDF download)
- Responsive design (mobile/desktop)
- Fast loading (Vercel CDN)
- HTTPS automatically

### ⏳ Coming Soon (Need Database)
- Real transaction data
- User authentication
- Saved invoices
- Receipt OCR
- AI categorization

---

## 🔍 Troubleshooting

### Issue: "Page not found" after deploy
**Fix:** 
- Check Vercel deployment logs
- Verify files are in root (not in subfolder)
- Ensure `vercel.json` is correct

### Issue: API returns 500 error
**Fix:**
- Check Vercel Functions logs
- Verify `package.json` has `@prisma/client` and `pdfkit`
- Add missing dependencies

### Issue: Dashboard shows "-" instead of numbers
**Fix:**
- API uses mock data by default
- For real data: Add `DATABASE_URL` env var
- For now: Refresh page or check browser console

---

## 🎉 Success Indicators

You'll know it worked when:
1. ✅ Can access `https://skattpro.vercel.app/dashboard.html`
2. ✅ Dashboard shows charts and numbers
3. ✅ Invoice generator creates PDFs
4. ✅ Mobile view works on phone
5. ✅ No errors in browser console

---

## 📱 Share Your Live Demo

Once deployed, share with alpha users:
- **URL:** `https://skattpro.vercel.app`
- **Demo credentials:** None needed (public alpha)
- **Features:** Dashboard + Invoice Generator

---

## 🔄 Automatic Updates

After initial deploy:
- Every `git push` → Vercel auto-deploys
- No manual steps needed
- Deploy logs at: `https://vercel.com/dashboard`
- Rollback available if needed

---

**Ready to deploy? Just follow Method 1 above!** 🚀

**Estimated time:** 5-10 minutes  
**Cost:** Free (Vercel Hobby tier)  
**Includes:** HTTPS, CDN, Auto-deploys, Analytics

---

**Questions?** Check Vercel docs: https://vercel.com/docs