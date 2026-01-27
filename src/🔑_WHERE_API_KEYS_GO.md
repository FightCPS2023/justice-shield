# 🔑 WHERE DO MY API KEYS GO?

## 📍 QUICK ANSWER

**Your API keys go in a `.env` file in your project root folder.**

```
your-project-folder/
├── .env  👈 PUT YOUR API KEYS HERE!
├── App.tsx
├── package.json
└── ... other files
```

---

## ✅ STEP-BY-STEP SETUP

### Step 1: Create the `.env` File

**Open your terminal in the project folder and run:**

```bash
# Mac/Linux
touch .env

# Windows (Command Prompt)
type nul > .env

# Windows (PowerShell)
New-Item .env
```

**Or just:**
- Open your code editor
- Create a new file named `.env` (exactly, no .txt extension)
- Save it in the **root folder** of your project

---

### Step 2: Add Your API Keys

**Copy this template and paste it into your `.env` file:**

```env
# ============================================
# THE CPS PUNISHER - API KEYS
# ============================================

# 🗄️ SUPABASE (Database & Authentication)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 🤖 GEMINI AI (Document Analysis)
VITE_GEMINI_API_KEY=AIzaSyCq4oz9bOt7CadY4dgDpQqcwnXFoIRtB54

# 💳 STRIPE (Payments) - Optional
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51XXXXXXXXXXXX

# 📊 GOOGLE ANALYTICS (Optional)
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# 🐛 SENTRY (Error Tracking) - Optional
VITE_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx

# ⚖️ COURTLISTENER (Legal Research) - Optional
VITE_COURTLISTENER_API_KEY=your-courtlistener-api-key
```

---

### Step 3: Replace with Your Actual Keys

**Now replace the placeholder values with your real API keys!**

**For CourtListener specifically, see "How to Get CourtListener API Key" below.**

---

## 🔑 HOW TO GET EACH API KEY

### 1️⃣ SUPABASE (Required - Database)

**What it's for:** User accounts, case data storage, authentication

**How to get it:**

1. **Go to:** https://supabase.com/dashboard
2. **Sign up** (free tier available)
3. **Create new project:**
   - Project name: "cps-punisher"
   - Database password: (create a strong password)
   - Region: Choose closest to you
4. **Wait 2 minutes** for project to set up
5. **Go to Settings** (⚙️ icon on left)
6. **Click "API"**
7. **Copy these 2 values:**
   - **Project URL** → Put in `VITE_SUPABASE_URL`
   - **anon public key** → Put in `VITE_SUPABASE_ANON_KEY`

**Example:**
```env
VITE_SUPABASE_URL=https://abcdefghijklmno.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1obyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjk...
```

**Time:** 5 minutes  
**Cost:** FREE  
**Status:** ✅ **READY TO USE** (you already have this from earlier setup)

---

### 2️⃣ GEMINI AI (Required - AI Analysis)

**What it's for:** Document analysis, AI-powered violation detection

**How to get it:**

1. **Go to:** https://aistudio.google.com/app/apikey
2. **Sign in** with your Google account
3. **Click "Create API Key"**
4. **Select or create a project**
5. **Copy the key** → Put in `VITE_GEMINI_API_KEY`

**Example:**
```env
VITE_GEMINI_API_KEY=AIzaSyCq4oz9bOt7CadY4dgDpQqcwnXFoIRtB54
```

**Time:** 2 minutes  
**Cost:** FREE (generous free tier)  
**Status:** ✅ **READY TO USE** (you already have this key!)

**Your key:** `AIzaSyCq4oz9bOt7CadY4dgDpQqcwnXFoIRtB54`

---

### 3️⃣ STRIPE (Optional - Payments)

**What it's for:** Processing subscription payments

**How to get it:**

1. **Go to:** https://dashboard.stripe.com/register
2. **Create account** (free to set up)
3. **Skip all the onboarding questions** (click "Skip for now")
4. **Go to Developers → API Keys**
5. **Copy "Publishable key"** (starts with `pk_test_`) → Put in `VITE_STRIPE_PUBLISHABLE_KEY`

**Example:**
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

**Time:** 5 minutes  
**Cost:** FREE (only pay when you make sales)  
**Status:** ⏳ **OPTIONAL** (can add later)

**Without Stripe:** App works but payments are disabled

---

### 4️⃣ GOOGLE ANALYTICS (Optional - Analytics)

**What it's for:** Tracking user behavior, page views, conversions

**How to get it:**

1. **Go to:** https://analytics.google.com
2. **Sign in** with Google account
3. **Create property:**
   - Property name: "CPS Punisher"
   - Select web platform
4. **Copy Measurement ID** (format: `G-XXXXXXXXXX`)

**Example:**
```env
VITE_GA_MEASUREMENT_ID=G-ABC123DEF4
```

**Time:** 5 minutes  
**Cost:** FREE  
**Status:** ⏳ **OPTIONAL** (nice to have)

---

### 5️⃣ SENTRY (Optional - Error Tracking)

**What it's for:** Tracking bugs and errors in production

**How to get it:**

1. **Go to:** https://sentry.io/signup
2. **Create account** (free tier available)
3. **Create new project:**
   - Platform: React
   - Project name: "cps-punisher"
4. **Copy the DSN** (looks like a URL)

**Example:**
```env
VITE_SENTRY_DSN=https://abc123def456@o789012.ingest.sentry.io/3456789
```

**Time:** 5 minutes  
**Cost:** FREE (up to 5K errors/month)  
**Status:** ⏳ **OPTIONAL** (helps find bugs)

---

### 6️⃣ COURTLISTENER (Optional - Legal Research)

**What it's for:** Searching millions of court opinions and case law

**How to get it:**

1. **Go to:** https://www.courtlistener.com/api/
2. **Create free account**
3. **Go to Account → API**
4. **Generate API key**
5. **Copy the key**

**Example:**
```env
VITE_COURTLISTENER_API_KEY=abc123def456ghi789jkl012
```

**Time:** 3 minutes  
**Cost:** FREE  
**Status:** ⏳ **OPTIONAL** (enhances legal research)

**Without CourtListener:** Basic search still works (limited to 100 results/day)

---

## 📁 FILE STRUCTURE

**Your `.env` file should be in the root folder:**

```
cps-punisher/
├── .env                    👈 PUT IT HERE!
├── .gitignore
├── App.tsx
├── index.html
├── package.json
├── vite.config.ts
├── components/
├── utils/
└── ... other files
```

**NOT here:**
- ❌ `/components/.env`
- ❌ `/utils/.env`
- ❌ `/public/.env`
- ❌ `/src/.env`

---

## ⚙️ FOR VERCEL DEPLOYMENT

**When you deploy to Vercel, you add API keys differently:**

### Option 1: Vercel Dashboard (Easiest)

1. Go to **Vercel Dashboard**
2. Select your project
3. Go to **Settings → Environment Variables**
4. Add each variable:
   - Name: `VITE_SUPABASE_URL`
   - Value: `https://your-project.supabase.co`
   - Click **Save**
5. Repeat for all variables
6. **Redeploy** your project

### Option 2: Vercel CLI

```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_GEMINI_API_KEY
vercel env add VITE_STRIPE_PUBLISHABLE_KEY
```

---

## 🔒 SECURITY BEST PRACTICES

### ✅ DO:

- ✅ Keep `.env` file in project root
- ✅ Add `.env` to `.gitignore` (already done)
- ✅ Use `VITE_` prefix for client-side variables
- ✅ Restart dev server after changing `.env`
- ✅ Create `.env.example` with dummy values for reference

### ❌ DON'T:

- ❌ Commit `.env` to GitHub
- ❌ Share `.env` file publicly
- ❌ Put API keys directly in code
- ❌ Use production keys in development
- ❌ Share secret keys (only publishable keys)

---

## 🧪 TESTING YOUR SETUP

### Test if API keys are working:

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Open browser console** (F12)

3. **Check for these messages:**
   ```
   ✅ Google Analytics initialized
   ✅ Sentry error tracking initialized
   ✅ Gemini API configured
   ✅ Supabase configured
   ```

4. **Test Gemini AI:**
   - Upload a document
   - Click "Analyze with AI"
   - Should get AI analysis results

5. **Test Supabase:**
   - Try signing up
   - Should create account successfully

---

## 🆘 TROUBLESHOOTING

### Problem: "API key not found" error

**Solutions:**
1. Check `.env` file is in **root folder**
2. Check spelling: `VITE_GEMINI_API_KEY` (exact)
3. **Restart dev server** (important!)
4. Check for extra spaces: `VITE_GEMINI_API_KEY=abc123` (no spaces around `=`)

### Problem: Environment variables are `undefined`

**Solutions:**
1. All client-side variables MUST start with `VITE_`
2. Restart dev server after editing `.env`
3. Check `.env` file exists in root (not in subfolder)

### Problem: "Invalid API key" error

**Solutions:**
1. Copy-paste key again (no extra spaces)
2. Check key hasn't been deleted/revoked
3. Try regenerating the API key

### Problem: Changes not taking effect

**Solution:**
1. Stop dev server (Ctrl+C)
2. Run `npm run dev` again
3. Hard refresh browser (Ctrl+Shift+R)

---

## 📋 QUICK CHECKLIST

Before you deploy:

- [ ] `.env` file created in root folder
- [ ] `VITE_SUPABASE_URL` added
- [ ] `VITE_SUPABASE_ANON_KEY` added
- [ ] `VITE_GEMINI_API_KEY` added (already have: `AIzaSyCq4oz9bOt7CadY4dgDpQqcwnXFoIRtB54`)
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY` added (optional)
- [ ] `.env` is in `.gitignore`
- [ ] Dev server restarted
- [ ] Tested AI analysis (works?)
- [ ] Tested sign up (works?)

---

## 📚 ADDITIONAL RESOURCES

**Full guides:**
- `/ENVIRONMENT_VARIABLES_GUIDE.md` - Complete env vars guide
- `/ACTIVATION_CHECKLIST.md` - Full activation checklist
- `/GEMINI_SETUP.md` - Detailed Gemini setup
- `/SUPABASE_SETUP_GUIDE.md` - Detailed Supabase setup

**API Documentation:**
- Supabase: https://supabase.com/docs
- Gemini: https://ai.google.dev/docs
- Stripe: https://stripe.com/docs/api
- CourtListener: https://www.courtlistener.com/api/

---

## 💡 PRO TIPS

### Tip 1: Use `.env.example` for Team Sharing

Create `.env.example` with dummy values:

```env
# Example configuration - Copy to .env and replace with real values
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
VITE_GEMINI_API_KEY=YOUR_GEMINI_KEY_HERE
```

This can be committed to GitHub safely!

### Tip 2: Different Keys for Dev/Production

```env
# Development
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_123...

# Production (in Vercel)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_456...
```

### Tip 3: Check What's Loaded

Add this to your code temporarily:

```typescript
console.log('Loaded env vars:', {
  supabase: !!import.meta.env.VITE_SUPABASE_URL,
  gemini: !!import.meta.env.VITE_GEMINI_API_KEY,
  stripe: !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
});
```

---

## 🎯 MINIMUM TO START

**To get the app running, you ONLY need:**

1. ✅ `VITE_SUPABASE_URL`
2. ✅ `VITE_SUPABASE_ANON_KEY`
3. ✅ `VITE_GEMINI_API_KEY`

**Everything else is optional and can be added later!**

---

## ✅ EXAMPLE COMPLETE `.env` FILE

```env
# ============================================
# THE CPS PUNISHER - PRODUCTION CONFIG
# ============================================

# Database & Auth (REQUIRED)
VITE_SUPABASE_URL=https://abcdefghij.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWoiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcwNjgwMDAwMCwiZXhwIjoyMDIyMzc2MDAwfQ.abc123def456ghi789

# AI Analysis (REQUIRED)
VITE_GEMINI_API_KEY=AIzaSyCq4oz9bOt7CadY4dgDpQqcwnXFoIRtB54

# Payments (OPTIONAL)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51abc123def456ghi789

# Analytics (OPTIONAL)
VITE_GA_MEASUREMENT_ID=G-ABC123DEF4

# Error Tracking (OPTIONAL)
VITE_SENTRY_DSN=https://abc123@o789.ingest.sentry.io/456

# Legal Research (OPTIONAL)
VITE_COURTLISTENER_API_KEY=your-key-here
```

---

## 🚀 READY TO GO!

Once you've added your API keys:

1. **Restart dev server:**
   ```bash
   npm run dev
   ```

2. **Test the app:**
   - Sign up → Should work
   - Upload document → Should analyze with AI
   - Check features → Should load

3. **Deploy to Vercel:**
   - Add same variables to Vercel dashboard
   - Deploy!

**You're all set! 🎉**

---

*Last Updated: January 9, 2026*  
*File Location: `/🔑_WHERE_API_KEYS_GO.md`*  
*Gemini API Key: `AIzaSyCq4oz9bOt7CadY4dgDpQqcwnXFoIRtB54`*  
*Status: READY TO USE*