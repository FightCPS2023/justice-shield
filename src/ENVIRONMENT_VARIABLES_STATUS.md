# CPS Punisher - Environment Variables Status
# What's Already Configured vs. What You Need for Vercel Deployment

---

## ✅ ALREADY CONFIGURED (Hardcoded in Code)

### 1. Supabase Configuration
**Location:** `/utils/supabase/info.tsx`

```typescript
export const projectId = "rewgkrgmcmikivxjnfdq"
export const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Derived Values:**
- `VITE_SUPABASE_URL` = `https://rewgkrgmcmikivxjnfdq.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJld2drcmdtY21pa2l2eGpuZmRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NzIzMzQsImV4cCI6MjA3OTM0ODMzNH0.i-kP7mvSAU9hlpMBKVHesRQj90B9jm47luFMuvF4lhQ`
- `VITE_SUPABASE_PROJECT_ID` = `rewgkrgmcmikivxjnfdq`

**Status:** ✅ Working - These values are loaded from the file
**Action Required:** Add to Vercel as environment variables (for consistency and best practices)

---

### 2. Gemini AI API Key
**Location:** `/API_KEY_READY.md` (also stored in localStorage)

```
VITE_GEMINI_API_KEY = AIzaSyCq4oz9bOt7CadY4dgDpQqcwnXFoIRtB54
```

**Status:** ✅ Working locally via localStorage
**Action Required:** Add to Vercel environment variables for production

**How it currently works:**
- Users can enter API key in Settings tab
- Stored in browser localStorage
- Can also be set via console or `/activate-ai.html`

**For production deployment:**
- Add as Vercel environment variable
- App will use Vercel env var as default
- Users can still override with their own key in Settings

---

### 3. Stripe Price IDs
**Location:** `/utils/stripe-config.ts`

```typescript
export const STRIPE_PRICE_IDS = {
  essential_monthly: 'price_1SZChVLer5ye2GBih8C2Cn8U',
  essential_annual: 'price_1SZDqXLer5ye2GBi27cH4jsS',
  professional_monthly: 'price_1SZDlfLer5ye2GBidSCef53l',
  professional_annual: 'price_1SZDwnLer5ye2GBiqEl9SAba',
  attorney_monthly: 'price_1SZDnkLer5ye2GBisGCQtncE',
  attorney_annual: 'price_1SZDsSLer5ye2GBieHTotLLO',
  enterprise_monthly: 'price_1SZDpeLer5ye2GBi9gT16zyW',
  enterprise_annual: 'price_1SZDueLer5ye2GBiRifVwAeC',
};
```

**Status:** ✅ Configured - These are LIVE production price IDs
**Action Required:** None - Hardcoded in the file

---

## ⏳ MISSING - NEED TO ADD TO VERCEL

### 1. Stripe Publishable Key (REQUIRED)

**Variable Name:** `VITE_STRIPE_PUBLISHABLE_KEY`

**Where to Get It:**
1. Go to https://dashboard.stripe.com/apikeys
2. Copy the **Publishable key** (starts with `pk_live_...` or `pk_test_...`)

**For Production:**
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_ACTUAL_KEY_HERE
```

**For Testing:**
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_TEST_KEY_HERE
```

**Why it's needed:**
- Used to initialize Stripe.js on the frontend
- Required for payment checkout flow
- Safe to expose publicly (it's meant to be public)

**Add to Vercel:**
```bash
vercel env add VITE_STRIPE_PUBLISHABLE_KEY
# Paste your key when prompted
# Select: Production, Preview, Development
```

**Status:** ❌ Missing - Payment checkout won't work without this

---

## 📋 COMPLETE CHECKLIST FOR VERCEL DEPLOYMENT

### Required Environment Variables:

```bash
# 1. Supabase URL
vercel env add VITE_SUPABASE_URL
# Value: https://rewgkrgmcmikivxjnfdq.supabase.co

# 2. Supabase Anon Key
vercel env add VITE_SUPABASE_ANON_KEY
# Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJld2drcmdtY21pa2l2eGpuZmRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NzIzMzQsImV4cCI6MjA3OTM0ODMzNH0.i-kP7mvSAU9hlpMBKVHesRQj90B9jm47luFMuvF4lhQ

# 3. Gemini API Key
vercel env add VITE_GEMINI_API_KEY
# Value: AIzaSyCq4oz9bOt7CadY4dgDpQqcwnXFoIRtB54

# 4. Stripe Publishable Key (GET THIS FROM STRIPE DASHBOARD)
vercel env add VITE_STRIPE_PUBLISHABLE_KEY
# Value: pk_live_YOUR_KEY or pk_test_YOUR_KEY
```

### Optional Environment Variables:

```bash
# Google Analytics (optional)
vercel env add VITE_GA_MEASUREMENT_ID
# Value: G-XXXXXXXXXX

# Sentry Error Tracking (optional)
vercel env add VITE_SENTRY_DSN
# Value: https://xxxxx@sentry.io/xxxxx
```

---

## 🎯 QUICK DEPLOYMENT COMMAND SEQUENCE

**Option 1: Add all at once via Vercel Dashboard**
1. Go to https://vercel.com/dashboard
2. Click your project → Settings → Environment Variables
3. Add all 4 required variables
4. Select: Production, Preview, Development for each
5. Save and redeploy: `vercel --prod`

**Option 2: Add via CLI (one by one)**
```bash
# Deploy first
vercel --prod

# Add environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_GEMINI_API_KEY
vercel env add VITE_STRIPE_PUBLISHABLE_KEY

# Redeploy with new variables
vercel --prod
```

---

## 📝 COPY-PASTE VALUES FOR VERCEL

When Vercel prompts "What's the value?", paste these:

### VITE_SUPABASE_URL
```
https://rewgkrgmcmikivxjnfdq.supabase.co
```

### VITE_SUPABASE_ANON_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJld2drcmdtY21pa2l2eGpuZmRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NzIzMzQsImV4cCI6MjA3OTM0ODMzNH0.i-kP7mvSAU9hlpMBKVHesRQj90B9jm47luFMuvF4lhQ
```

### VITE_GEMINI_API_KEY
```
AIzaSyCq4oz9bOt7CadY4dgDpQqcwnXFoIRtB54
```

### VITE_STRIPE_PUBLISHABLE_KEY
```
YOUR_STRIPE_KEY_HERE
```
↑ **You need to get this from https://dashboard.stripe.com/apikeys**

---

## 🔐 SECURITY NOTES

### Safe to Expose (Public Keys):
- ✅ `VITE_SUPABASE_URL` - Public URL
- ✅ `VITE_SUPABASE_ANON_KEY` - Public anon key (RLS protected)
- ✅ `VITE_GEMINI_API_KEY` - Usage limited, can be regenerated
- ✅ `VITE_STRIPE_PUBLISHABLE_KEY` - Meant to be public

### NEVER Expose (Secret Keys):
- ❌ `SUPABASE_SERVICE_ROLE_KEY` - Full database access (backend only)
- ❌ `STRIPE_SECRET_KEY` - Process payments (backend only)
- ❌ `STRIPE_WEBHOOK_SECRET` - Verify webhooks (backend only)

**All environment variables prefixed with `VITE_` are bundled into the frontend JavaScript and visible to users. This is normal and expected for public API keys.**

---

## 🧪 HOW TO TEST LOCALLY (Optional)

If you want to test locally before deploying:

1. **Create `.env` file in project root:**
```bash
VITE_SUPABASE_URL=https://rewgkrgmcmikivxjnfdq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJld2drcmdtY21pa2l2eGpuZmRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NzIzMzQsImV4cCI6MjA3OTM0ODMzNH0.i-kP7mvSAU9hlpMBKVHesRQj90B9jm47luFMuvF4lhQ
VITE_GEMINI_API_KEY=AIzaSyCq4oz9bOt7CadY4dgDpQqcwnXFoIRtB54
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_TEST_KEY
```

2. **Run locally:**
```bash
npm run dev
```

3. **Test features:**
- Login/signup
- Document upload
- AI analysis
- Payment checkout

**Note:** `.env` file is in `.gitignore` and won't be committed to Git.

---

## ❓ WHY DO WE NEED TO ADD THESE TO VERCEL?

Even though some values are hardcoded in the codebase, it's best practice to:

1. **Separate config from code** - Makes it easier to change without redeploying
2. **Environment-specific values** - Use test keys in preview, live keys in production
3. **Security best practices** - Environment variables are the standard way
4. **Future flexibility** - Easy to rotate keys without code changes

**Bottom line:** The app will work with hardcoded values, but adding them as environment variables is the professional, production-ready approach.

---

## 🎯 WHAT TO DO NEXT

1. **Get your Stripe Publishable Key:**
   - Go to https://dashboard.stripe.com/apikeys
   - Copy the publishable key (starts with `pk_live_...` or `pk_test_...`)

2. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

3. **Add all 4 environment variables:**
   - Use the copy-paste values above
   - Get Stripe key from your dashboard

4. **Redeploy:**
   ```bash
   vercel --prod
   ```

5. **Test on cpspunisher.com:**
   - Login/signup
   - Upload document
   - AI analysis
   - Payment checkout

---

## 📞 NEED HELP?

### Can't find your Stripe key?
1. Login to https://dashboard.stripe.com
2. Click **Developers** in top nav
3. Click **API keys** in left sidebar
4. Copy the **Publishable key**

### Vercel environment variables not working?
1. Make sure they start with `VITE_` prefix
2. Redeploy after adding: `vercel --prod`
3. Check Vercel Dashboard → Settings → Environment Variables

### App still using hardcoded values?
- This is normal! The app will use hardcoded values as fallback
- Environment variables take precedence when set
- Both approaches work fine

---

**Copyright © 2024 DARREN GUAY. All Rights Reserved.**
**The CPS Punisher™** - Ready for Production Deployment
