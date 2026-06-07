# SkattPro Improvement Plan - v1.0 Working Baseline

**Backup Tag:** `v1.0-working` (June 7, 2026)
**Status:** ✅ Core functionality working - kommune selection + tax calculation

---

## 🎯 Priority 1: Critical UX Fixes (This Week)

### 1.1 Default Values Missing
**Problem:** All fields show "0" - users must manually enter everything
**Fix:** Pre-fill with realistic defaults
- Income: 650,000 kr (average Norwegian salary)
- Minstefradrag: 98,000 kr (auto-calculated)
- Kommune: Pre-select Oslo or user's last choice

### 1.2 No Real-time Calculation
**Problem:** Users must click "Beregn skatt" to see results
**Fix:** Auto-calculate on any input change (like faktura-kalkulator.html)
```javascript
// Add to all inputs:
el.addEventListener('input', () => beregn());
```

### 1.3 Result Section Hidden Until Calculation
**Problem:** Users don't know what they'll get
**Fix:** Show sample results or placeholder with "Enter your income to see results"

---

## 🚀 Priority 2: Feature Parity with Competitors (Next 2 Weeks)

### 2.1 Comparison with CountryTaxCalc & Skatteetaten
| Feature | SkattPro | Competitor | Priority |
|---------|----------|------------|----------|
| Real-time calc | ❌ | ✅ | HIGH |
| Default values | ❌ | ✅ | HIGH |
| Save calculations | ✅ (localStorage) | ✅ | OK |
| Export PDF | ❌ | ✅ | MEDIUM |
| Export CSV/TXT | Mentioned but ? | ✅ | MEDIUM |
| Share via URL | ✅ | ✅ | OK |
| Historical rates | 2025-2026 | 2020-2026 | LOW |
| Mobile optimized | ✅ | ✅ | OK |

### 2.2 Must-Have Features
1. **PDF Export** - Users want to save/share results
2. **Side-by-side comparison** - Compare 2025 vs 2026 taxes
3. **Visual breakdown** - Pie chart of where taxes go
4. **Salary slider** - Drag to see how tax changes with income
5. **Email results** - Send calculation to yourself

---

## 💰 Priority 3: Pro Features (Monetization)

### 3.1 Current Pro Teaser
- Shows after 5 calculations (hard limit blocks users!)
- **Problem:** Alert is aggressive, blocks workflow
- **Fix:** Soft teaser with value prop, not a wall

### 3.2 Suggested Pro Features
1. **Unlimited calculations** (remove 5-calc limit)
2. **PDF/CSV export** (currently mentioned but maybe not working?)
3. **Multiple scenarios** - Save 5+ different income scenarios
4. **Year-over-year comparison** - See tax changes over time
5. **Advanced deductions** - Reise-fradrag, barnefradrag UI improvements
6. **API access** - For developers/accountants

### 3.3 Pricing Page Optimization
Current: `/ansatte-og-lonn/` 
**Issues:**
- Doesn't clearly communicate Pro value
- No comparison table (Free vs Pro)
- No testimonials/social proof

---

## 🎨 Priority 4: UX/UI Polish

### 4.1 Visual Improvements
1. **Progress indicator** - Show calculation steps
2. **Tooltips** - Explain terms like "trinnskatt", "trygdeavgift"
3. **Error states** - What if I enter 1 billion kr income?
4. **Loading states** - Show spinner while fetching kommuner
5. **Success feedback** - " Calculation complete!" animation

### 4.2 Accessibility
1. **Keyboard navigation** - Can I tab through all fields?
2. **Screen reader labels** - All inputs have aria-labels?
3. **Color contrast** - Check muted text readability
4. **Focus states** - Clear indicators for selected elements

### 4.3 Performance
1. **Lazy load** - Don't load 400+ kommuner upfront (use virtual scroll)
2. **Cache JSON** - kommuner.json should be cached aggressively
3. **Debounce calculations** - Don't recalc on every keystroke

---

## 📊 Priority 5: Analytics & SEO

### 5.1 Missing Tracking
- No analytics on conversion funnels
- Don't know where users drop off
- Can't measure Pro teaser effectiveness

### 5.2 SEO Opportunities
1. **Schema markup** - Already has FAQ, Organization ✅
2. **Blog content** - "How to reduce taxes in Norway 2026"
3. **Calculator embeds** - Let other sites embed SkattPro
4. **Local SEO** - Target "skattekalkulator [kommune]" keywords

---

## 🔧 Technical Debt

### 6.1 Code Quality Issues
1. **Duplicate code** - index.html vs faktura-kalkulator.html share logic
2. **No tests** - What if tax rates change?
3. **Hardcoded rates** - Should be config files
4. **Large inline script** - Should be modular

### 6.2 Suggested Refactor
```
skattpro/
├── src/
│   ├── js/
│   │   ├── calculator.js (core logic)
│   │   ├── kommuner.js (data loading)
│   │   └── export.js (PDF/TXT)
│   └── css/
│       └── main.css
├── index.html (thin wrapper)
└── tests/
    └── calculator.test.js
```

---

## 📈 Success Metrics

### Track These KPIs:
1. **Calculations per session** - Target: 3+
2. **Pro conversion rate** - Target: 2-5%
3. **Bounce rate** - Target: <40%
4. **Mobile vs Desktop** - Optimize for majority
5. **Average time on page** - Target: 2-4 minutes

---

## 🎯 Quick Wins (Implement Today)

1. ✅ **Add default income value** (5-10 min)
2. ✅ **Auto-calculate on input change** (15 min)
3. ✅ **Show loading state for kommuner** (10 min)
4. ✅ **Fix Pro teaser to be less aggressive** (20 min)
5. ✅ **Add "Copy results" button** (15 min)

---

## 📝 Implementation Order

**Week 1:** Quick wins + critical UX fixes
**Week 2:** PDF export + real-time calculation
**Week 3:** Pro features + pricing page redesign
**Week 4:** Analytics + SEO optimization

---

**Last Updated:** June 7, 2026
**Baseline Version:** v1.0-working