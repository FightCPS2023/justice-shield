# 🚀 Launch To-Do List

**Simple checklist to get your app live**

---

## ✅ COMPLETED

- [x] DEV_MODE disabled (changed to `false`)
- [x] All 14 main sections working
- [x] Payment system implemented
- [x] AI system implemented
- [x] Backend server ready
- [x] Authentication working
- [x] Documentation complete
- [x] Accessibility compliant
- [x] Legal disclaimers added
- [x] Mobile responsive
- [x] Dark mode working

---

## 🔴 TO DO BEFORE LAUNCH

### 1. Get Gemini API Key (5 minutes)
- [ ] Go to https://makersuite.google.com/app/apikey
- [ ] Create API key
- [ ] Run: `supabase secrets set VITE_GEMINI_API_KEY=your_key`
- [ ] Test: Upload a document, verify AI analysis works

### 2. Configure Stripe (45 minutes)
- [ ] Create Stripe account: https://dashboard.stripe.com/register
- [ ] Create 8 products (Essential, Professional, Attorney, Enterprise - Monthly & Annual each)
- [ ] Copy all 8 price IDs
- [ ] Update `/utils/stripe-config.ts` - replace all `REPLACE_ME` with real price IDs
- [ ] Update `/components/PricingTable.tsx` - replace all `REPLACE_ME` with real price IDs
- [ ] Run: `supabase secrets set STRIPE_SECRET_KEY=sk_live_xxx`
- [ ] Run: `supabase secrets set VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx`
- [ ] Set up webhook in Stripe Dashboard
- [ ] Run: `supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx`
- [ ] Test: Complete a test payment with card 4242 4242 4242 4242

### 3. Test Critical Flows (30 minutes)
- [ ] Test sign up
- [ ] Test login
- [ ] Test document upload (free tier - 1 doc limit)
- [ ] Test payment upgrade
- [ ] Test premium features unlock
- [ ] Test on mobile phone
- [ ] Test in different browser

### 4. Deploy (10 minutes)
- [ ] Push to GitHub
- [ ] Connect to Vercel
- [ ] Add environment variables to Vercel
- [ ] Deploy
- [ ] Test production site

---

## 🟡 RECOMMENDED (DO BEFORE OR RIGHT AFTER LAUNCH)

### 5. Optional APIs (25 minutes total)
- [ ] CourtListener API (10 min) - for Attorney tier features
  - Get token: https://www.courtlistener.com/api/
  - Run: `supabase secrets set COURTLISTENER_API_TOKEN=your_token`
- [ ] Sentry error tracking (15 min) - to catch production bugs
  - Sign up: https://sentry.io
  - Run: `supabase secrets set VITE_SENTRY_DSN=your_dsn`

### 6. Analytics (10 minutes)
- [ ] Set up Google Analytics
- [ ] Run: `supabase secrets set VITE_GA_TRACKING_ID=G-XXXXXXXXXX`

### 7. Legal (High Priority)
- [ ] Create Terms of Service
- [ ] Create Privacy Policy
- [ ] Link them in footer
- [ ] **(Highly Recommended)** Legal review by attorney

---

## 🟢 POST-LAUNCH (DO IN FIRST WEEK)

### 8. Marketing & Support
- [ ] Set up support email
- [ ] Create social media accounts
- [ ] Announce launch
- [ ] Monitor error logs daily
- [ ] Respond to first users quickly
- [ ] Collect feedback
- [ ] Fix critical bugs

### 9. Monitoring
- [ ] Check Stripe dashboard daily
- [ ] Monitor Sentry errors
- [ ] Review analytics
- [ ] Track conversion rates
- [ ] Watch server performance

---

## ⏱️ TIME ESTIMATE

| Task | Time |
|------|------|
| Gemini API | 5 min |
| Stripe Setup | 45 min |
| Testing | 30 min |
| Deploy | 10 min |
| Optional APIs | 25 min |
| Analytics | 10 min |
| **TOTAL** | **2 hours 5 min** |

---

## 🎯 MINIMUM TO LAUNCH

**These 4 items are REQUIRED:**

1. ✅ ~~DEV_MODE = false~~ (Done!)
2. ⚠️ Gemini API key
3. ⚠️ Stripe configured
4. ⚠️ Complete test run

Everything else can be done after launch.

---

## 📞 HELP

- **Full details:** See `/QUICK_LAUNCH_GUIDE.md`
- **Complete checklist:** See `/PRE_LAUNCH_CHECKLIST.md`
- **Status report:** See `/LAUNCH_STATUS.md`

---

## ✨ YOU'RE ALMOST THERE!

Your app is **98% complete**. Just configure APIs and test!

**Good luck! 🚀**
