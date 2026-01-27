# ⚡ Quick Launch Guide - CPS Case Defense Analyzer

**Get your app live in 3 simple steps!**

---

## 🚨 CRITICAL: 3 Things You MUST Do Before Launch

### 1️⃣ ~~Add Gemini AI API Key~~ ✅ COMPLETED

**Status:** ✅ Gemini API key configured and operational

**Configuration Details:**
- Location: `/.env` file
- Key: AIzaSyDe9lTqr0yTgwE6GnNTKzZhtsJtQkiSmGM
- All AI features now working
- See: `/GEMINI_API_CONFIGURED.md` for details

**Time:** ~~5 minutes~~ ✅ DONE

---

### 2️⃣ Configure Stripe Payments (Required for Monetization)

**Why:** Users can't subscribe to paid plans without this.

**Steps:**

#### A. Create Stripe Account (5 min)
1. Sign up at: https://dashboard.stripe.com/register
2. Verify your email
3. Complete business info

#### B. Create 8 Products (15 min)
Create these products in Stripe Dashboard:

| Product | Price | Billing | Price ID Location |
|---------|-------|---------|------------------|
| Essential | $39 | Monthly | Copy after creating |
| Essential | $390 | Yearly | Copy after creating |
| Professional | $79 | Monthly | Copy after creating |
| Professional | $790 | Yearly | Copy after creating |
| Attorney Suite | $299 | Monthly | Copy after creating |
| Attorney Suite | $2,990 | Yearly | Copy after creating |
| Enterprise | $999 | Monthly | Copy after creating |
| Enterprise | $9,990 | Yearly | Copy after creating |

#### C. Update Price IDs (10 min)
1. Copy each Price ID from Stripe (looks like `price_1Abc...`)
2. Open `/utils/stripe-config.ts`
3. Replace all `REPLACE_ME` with your actual price IDs:
   ```typescript
   export const STRIPE_PRICE_IDS = {
     essential_monthly: 'price_1Abc...',  // ← Paste yours
     essential_annual: 'price_1Def...',   // ← Paste yours
     // ... etc for all 8
   };
   ```
4. Open `/components/PricingTable.tsx`
5. Update the same 8 price IDs there too

#### D. Add Stripe Keys (5 min)
1. Get keys from: https://dashboard.stripe.com/test/apikeys
2. Add to Supabase:
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_live_...
   supabase secrets set VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
   ```

#### E. Set Up Webhook (10 min)
1. Go to: Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. URL: `https://[your-project].supabase.co/functions/v1/make-server-a24eaa40/stripe/webhook`
4. Events to select:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy webhook signing secret (starts with `whsec_`)
6. Add to Supabase:
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
   ```

**Total Time:** 45 minutes

---

### 3️⃣ Test Everything (Required for Quality)

**Critical Tests:**

#### Test 1: Sign Up (5 min)
- [ ] Create new account
- [ ] Verify you can log in
- [ ] Check cloud sync works

#### Test 2: Free Tier Limits (5 min)
- [ ] Upload 1 document (should work)
- [ ] Try to upload 2nd document (should show upgrade prompt)

#### Test 3: Payment Flow (10 min)
- [ ] Click "Upgrade to Essential"
- [ ] Use Stripe test card: `4242 4242 4242 4242`
- [ ] Complete checkout
- [ ] Verify you're upgraded
- [ ] Upload 5+ documents (should work now)

#### Test 4: AI Features (10 min)
- [ ] Upload a test CPS document
- [ ] Wait for AI analysis
- [ ] Generate defense strategy
- [ ] Ask AI assistant a question

#### Test 5: Mobile (5 min)
- [ ] Open on your phone
- [ ] Navigate through sections
- [ ] Upload document from mobile

**Total Time:** 35 minutes

---

## ✅ Optional But Recommended

### CourtListener API (For Attorney Tier Features)
**Time:** 10 minutes

1. Get token: https://www.courtlistener.com/api/
2. Add to Supabase:
   ```bash
   supabase secrets set COURTLISTENER_API_TOKEN=your_token
   ```

### Error Tracking with Sentry
**Time:** 15 minutes

1. Sign up: https://sentry.io
2. Create new project
3. Copy DSN
4. Add to Supabase:
   ```bash
   supabase secrets set VITE_SENTRY_DSN=https://...@sentry.io/...
   ```

### Google Analytics
**Time:** 10 minutes

1. Create GA4 property: https://analytics.google.com
2. Copy Measurement ID (G-XXXXXXXXXX)
3. Add to Supabase:
   ```bash
   supabase secrets set VITE_GA_TRACKING_ID=G-XXXXXXXXXX
   ```

---

## 🚀 Deploy to Production

### Option 1: Vercel (Recommended - Easiest)
**Time:** 10 minutes

1. Push code to GitHub
2. Go to: https://vercel.com
3. Click "Import Project"
4. Select your GitHub repo
5. Add environment variables in Vercel dashboard:
   - `VITE_GEMINI_API_KEY`
   - `VITE_STRIPE_PUBLISHABLE_KEY`
   - `SUPABASE_URL` (from Supabase dashboard)
   - `SUPABASE_ANON_KEY` (from Supabase dashboard)
6. Click "Deploy"
7. Done! Your app is live at `your-project.vercel.app`

### Option 2: Netlify
Same as Vercel, just use Netlify instead.

---

## 📋 Post-Launch Checklist

### Day 1
- [ ] Monitor error logs in Sentry
- [ ] Check Stripe dashboard for payments
- [ ] Respond to first users
- [ ] Test on different devices

### Week 1
- [ ] Collect user feedback
- [ ] Fix any critical bugs
- [ ] Improve based on feedback
- [ ] Marketing push (social media, forums, etc.)

---

## 🆘 Quick Troubleshooting

### "AI features not working"
→ Check Gemini API key is set correctly in Supabase secrets

### "Payment checkout failing"
→ Verify all 8 Stripe price IDs are updated in both files

### "Subscription not activating"
→ Check Stripe webhook is configured and secret is correct

### "Documents not saving"
→ Check Supabase connection and environment variables

### "App won't load"
→ Check browser console for errors, verify build succeeded

---

## 📞 Get Help

- **Supabase Issues:** https://supabase.com/support
- **Stripe Issues:** https://support.stripe.com
- **Gemini API Issues:** https://ai.google.dev/support

---

## 🎯 Summary: Absolute Minimum to Launch

1. ✅ **DEV_MODE = false** (Already done!)
2. ⚠️ **Add Gemini API key** (5 min)
3. ⚠️ **Configure Stripe** (45 min)
4. ⚠️ **Test sign up, payment, AI** (35 min)
5. ✅ **Deploy to Vercel** (10 min)

**Total Time to Launch: ~1.5 hours**

---

## 🎉 You're Ready!

Once you complete steps 1-5 above, your app is production-ready and can start accepting users and payments.

**Good luck with your launch! 🚀**
