# 🎨 SkattPro UI - Quick Start Guide

**Version:** 0.5.0 Alpha  
**Status:** ✅ Production Ready

---

## 🚀 Getting Started

### Option 1: Development Mode (Recommended)

```bash
# 1. Install dependencies
cd ~/skattpro/ai-backend
npm install

# 2. Start the server (with hot reload)
npm run dev

# 3. Open dashboard in browser
# Option A: Manual
open http://localhost:3001/dashboard.html

# Option B: Use npm script (Mac/Linux)
npm run dashboard

# Option C: Windows
start http://localhost:3001/dashboard.html
```

### Option 2: Production Mode

```bash
# 1. Install and build
cd ~/skattpro/ai-backend
npm install --production

# 2. Start production server
npm start

# 3. Access dashboard
http://localhost:3001/dashboard.html
```

---

## 📱 Available UI Pages

### 1. **Økonomidashboard** (`/dashboard.html`)
**Purpose:** Real-time P&L, tax tracking, financial insights

**Features:**
- Income, expenses, profit summary
- Monthly trend charts (12 months)
- Category breakdown (doughnut chart)
- Forskuddsskatt tracker
- Payment schedule (4 quarters)
- Recent transactions table

**Access:** http://localhost:3001/dashboard.html

---

### 2. **Lag Faktura** (`/create-invoice.html`)
**Purpose:** Create professional PDF invoices

**Features:**
- Seller/buyer information forms
- Unlimited line items
- Automatic VAT calculation (25%)
- Payment terms (default 14 days)
- Professional PDF format
- Download or email

**Access:** http://localhost:3001/create-invoice.html

---

### 3. **Review Queue** (`/review-queue.html`)
**Purpose:** Manual categorization of uncertain transactions

**Features:**
- Low-confidence items highlighted
- AI suggestions with confidence %
- One-click categorization
- Batch review mode

**Access:** http://localhost:3001/review-queue.html

---

### 4. **Tax Calculator** (`/index.html` from root)
**Purpose:** Quick Norwegian tax calculation

**Features:**
- Income/expense input
- Kommune selection (400+)
- Forskuddsskatt calculation
- Payment schedule

**Access:** http://localhost:3001/index.html (from root `/skattpro/`)

---

## 🎨 UI Components

### Design System
- **Framework:** Tailwind CSS (CDN)
- **Charts:** Chart.js
- **Icons:** Heroicons (SVG)
- **Colors:** Purple/Blue gradient brand
- **Typography:** System fonts

### Mobile Responsiveness
All pages are fully responsive:
- **Mobile:** Single column, touch-friendly
- **Tablet:** 2-column layouts
- **Desktop:** Multi-column dashboards

### Color Coding
- 🟢 **Green** - Income, positive values
- 🔴 **Red** - Expenses, negative values
- 🔵 **Blue** - Profit, neutral info
- 🟣 **Purple** - Tax, SkattPro brand

---

## 🔌 API Integration

### Authentication (Required for Dashboard)

```javascript
// After login, store token
localStorage.setItem('skattpro_token', 'your-jwt-token');

// API calls include token
const response = await fetch('http://localhost:3001/api/dashboard/profit', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('skattpro_token')
  }
});
```

### Demo Mode

If no token exists, dashboard uses `demo-token` which returns mock data.

---

## 📊 Dashboard Data Flow

```
1. Page loads → loadDashboard() called
2. GET /api/dashboard/profit (with JWT)
3. Backend calculates:
   - Total income/expenses
   - Category breakdown
   - Monthly trends
   - Tax estimation
4. Frontend updates:
   - Summary cards
   - Charts (Chart.js)
   - Tax tracker
   - Transaction table
5. Auto-refresh available (manual button)
```

---

## 🧪 Testing the UI

### Test Dashboard

```bash
# 1. Start backend
npm run dev

# 2. Open dashboard
open http://localhost:3001/dashboard.html

# 3. Expected results:
✅ 4 summary cards (income, expenses, profit, tax)
✅ Monthly trend chart (bar chart)
✅ Category breakdown (doughnut chart)
✅ Tax tracker with payment schedule
✅ Recent transactions table
```

### Test Invoice Generator

```bash
# 1. Open invoice creator
open http://localhost:3001/create-invoice.html

# 2. Fill in form:
   - Seller: Your info
   - Buyer: Client info
   - 1-3 line items
   - Payment terms

# 3. Click "Lag faktura PDF"

# 4. Expected result:
✅ PDF downloads
✅ Professional format
✅ Correct VAT calculation
✅ All info included
```

---

## 🎯 Next UI Features to Build

### Priority P0 (This Week)
- [ ] **Login/Register UI** - Connect to auth API
- [ ] **Transaction Upload** - CSV/JSON batch import
- [ ] **Receipt Upload** - Camera/file upload with OCR preview
- [ ] **Data Export** - Download all data as CSV/PDF

### Priority P1 (Next Week)
- [ ] **Mobile App Shell** - Bottom navigation, PWA
- [ ] **Onboarding Tutorial** - First-time user guide
- [ ] **Notification Center** - In-app alerts
- [ ] **Settings Page** - User preferences

### Priority P2 (Post-Launch)
- [ ] **Invoice Templates** - Multiple design options
- [ ] **Client Portal** - Customers see their invoices
- [ ] **Analytics Page** - Advanced insights
- [ ] **Dark Mode** - User preference

---

## 🐛 Troubleshooting

### Dashboard Shows "-" Instead of Numbers

**Cause:** API not reachable or no data

**Fix:**
```bash
# Check backend is running
curl http://localhost:3001/api/health

# Should return: {"status":"ok"}

# If not running:
npm run dev
```

### Charts Not Rendering

**Cause:** Chart.js not loaded

**Fix:**
- Check internet connection (CDN)
- Or install locally: `npm install chart.js`
- Update import to use local file

### CORS Errors

**Cause:** Backend CORS not configured

**Fix:**
```javascript
// server-enhanced.js already has:
app.use(cors());
```

### Token Expired

**Cause:** JWT token expired (30 days)

**Fix:**
```javascript
// Clear and re-login
localStorage.removeItem('skattpro_token');
window.location.href = '/login.html';
```

---

## 📱 Mobile Testing

Test on actual devices:

```bash
# 1. Find your local IP
ipconfig getifaddr en0  # Mac
ipconfig               # Windows

# 2. Access from phone
http://YOUR-IP:3001/dashboard.html

# 3. Test:
- Responsive layout
- Touch interactions
- Form inputs
- Chart rendering
```

---

## 🎨 Customization

### Change Brand Colors

Edit `dashboard.html`:
```html
<!-- Find and modify -->
<div class="bg-gradient-to-br from-purple-600 to-blue-500">
  <!-- Change to your colors -->
  <div class="bg-gradient-to-br from-green-600 to-teal-500">
```

### Add New Charts

Add to `dashboard.html`:
```javascript
// New chart instance
const newChart = new Chart(ctx, {
  type: 'line',  // or 'bar', 'pie', etc.
  data: { ... },
  options: { ... }
});
```

---

## 🚀 Deployment

### Vercel (Recommended for Frontend)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
cd ~/skattpro
vercel

# 3. Follow prompts
# - Root directory: .
# - Build command: none (static)
# - Output directory: .

# 4. Get your URL
# https://skattpro.vercel.app
```

### Railway (Backend + Frontend)

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Deploy
cd ~/skattpro/ai-backend
railway init
railway up

# 4. Add environment variables
railway vars set DATABASE_URL="..."
railway vars set JWT_SECRET="..."

# 5. Get your URL
# https://your-app.railway.app
```

---

## 📞 Support

**Issues?**
- Check browser console for errors
- Verify backend is running (`/api/health`)
- Test with demo token first

**Feature requests?**
- Add to TODO.md in project root
- Prioritize with user feedback

---

**Happy coding! 🎨**  
**SkattPro UI Team**