# 🔧 FIX SUPABASE URL - GET YOUR OWN CREDENTIALS

**Problem:** The Supabase URL `https://rewgkrgmcmikivxjnfdq.supabase.co` doesn't work.  
**Solution:** Create your own Supabase project (5 minutes, FREE)  
**Time:** 5 minutes  
**Cost:** FREE

---

## 🚀 STEP-BY-STEP: CREATE YOUR SUPABASE PROJECT

### Step 1: Sign Up for Supabase (2 minutes)

1. **Go to:** https://app.supabase.com/sign-up

2. **Sign up with:**
   - GitHub (easiest), OR
   - Email address

3. **Verify your email** (if using email signup)

4. **You'll see the Supabase dashboard**

✅ FREE - No credit card required!

---

### Step 2: Create a New Project (3 minutes)

1. **Click** the green **"New Project"** button

2. **Fill in the form:**
   ```
   Organization: [Select your organization or create new]
   Name: cps-punisher
   Database Password: [CREATE A STRONG PASSWORD]
   Region: [Select closest to you - e.g., East US, West US, Europe]
   ```

   **⚠️ IMPORTANT:** Save your database password somewhere safe!
   ```
   Database Password: _________________________________
   ```

3. **Click** "Create new project"

4. **Wait ~2 minutes** for project to be provisioned
   - You'll see a loading screen
   - Coffee break! ☕

5. **Project is ready** when you see the project dashboard

---

### Step 3: Get Your API Credentials (1 minute)

1. **In your new project**, click **"Settings"** (⚙️ icon in left sidebar)

2. **Click** "API" in the settings menu

3. **Copy these TWO values:**

   **A. Project URL:**
   ```
   Look for: "Project URL"
   Copy the full URL (example: https://abcdefgh.supabase.co)
   
   Your Project URL: _________________________________
   ```

   **B. Anon/Public Key:**
   ```
   Look for: "Project API keys"
   Find: "anon" "public" key
   Click the copy icon
   
   Your Anon Key: _________________________________
   ```

✅ You now have YOUR working Supabase credentials!

---

## 📝 NOW: CREATE YOUR .env FILE

**Copy this template and replace with YOUR values:**

```env
# ============================================================================
# THE CPS PUNISHER - ENVIRONMENT VARIABLES
# ============================================================================

# ============================================================================
# DATABASE & AUTHENTICATION (SUPABASE) - REQUIRED
# ============================================================================
# Replace these with YOUR Supabase credentials from above!

VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_ACTUAL_KEY_HERE

# ============================================================================
# AI ANALYSIS (GOOGLE GEMINI) - REQUIRED FOR DOCUMENT ANALYSIS
# ============================================================================
# Get your free API key at: https://aistudio.google.com/app/apikey

VITE_GEMINI_API_KEY=your_gemini_api_key_here

# ============================================================================
# LEGAL RESEARCH (COURTLISTENER) - READY TO USE
# ============================================================================

VITE_COURTLISTENER_API_KEY=af0d9091a42930e5b9f90dd3bf9efad5c621357d

# ============================================================================
# PAYMENT PROCESSING (STRIPE) - OPTIONAL
# ============================================================================

VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here

# ============================================================================
# ANALYTICS & MONITORING - OPTIONAL
# ============================================================================

VITE_GOOGLE_ANALYTICS_ID=your_ga4_measurement_id_here
VITE_SENTRY_DSN=your_sentry_dsn_here
```

---

## ✅ VERIFICATION

After creating your .env file with YOUR credentials:

1. **Save the file** as `.env` in your project root

2. **Verify the file:**
   - Location: Same folder as `package.json`
   - Name: Exactly `.env` (not `.env.txt`)
   - Contents: Your actual Supabase URL and key

3. **Test the connection:**
   ```bash
   npm run dev
   ```

4. **Open browser:** http://localhost:5173

5. **Check console (F12):**
   - ✅ No Supabase connection errors = Success!
   - ❌ Still errors = See troubleshooting below

---

## 🐛 TROUBLESHOOTING

### "Project URL is not a valid URL"
- Make sure it starts with `https://`
- Should look like: `https://abcdefgh.supabase.co`
- No spaces before or after
- No quotes around it

### "Invalid API key"
- Make sure you copied the **anon/public** key (NOT the service_role key)
- Should start with: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`
- No spaces before or after
- No quotes around it

### "Can't connect to Supabase"
- Check internet connection
- Verify project is not paused (go to app.supabase.com)
- Make sure you're using YOUR project URL, not the old one
- Restart dev server: `npm run dev`

---

## 🎯 WHAT'S NEXT?

After your Supabase connection works:

1. ✅ **Create database tables** - Run SQL from `/📊_SUPABASE_DATABASE_SETUP.sql`
2. ✅ **Add Gemini API key** - For AI features
3. ✅ **Test the app** - Create account, create case
4. ✅ **Deploy** - When ready!

**Full guide:** See `/🚀_COMPLETE_SETUP_GUIDE_20_MINUTES.md`

---

## 📞 STILL STUCK?

**Common issue:** Using old/invalid Supabase credentials

**Solution:** 
1. Create a NEW Supabase project (steps above)
2. Use YOUR new credentials
3. Should work immediately!

**Can't create Supabase account?**
- Try different browser
- Clear cache and cookies
- Use incognito/private mode
- Try GitHub signup instead of email

---

## ✅ CHECKLIST

- [ ] Created Supabase account
- [ ] Created new Supabase project
- [ ] Saved database password
- [ ] Copied Project URL
- [ ] Copied Anon Key
- [ ] Created .env file in project root
- [ ] Added MY Supabase URL (not the old one)
- [ ] Added MY Anon Key (not the old one)
- [ ] Saved .env file
- [ ] Restarted dev server
- [ ] No connection errors

**All checked?** ✅ **You're ready for the next step!**

---

**Created:** January 11, 2026  
**For:** DARREN GUAY - The CPS Punisher  
**Purpose:** Get YOUR working Supabase credentials  
**Time:** 5 minutes total
