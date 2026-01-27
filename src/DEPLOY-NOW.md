# 🚀 DEPLOY THE CPS PUNISHER - STEP BY STEP

**This is a FRONTEND-ONLY app. Deploy to Vercel or Netlify, NOT Supabase Edge Functions.**

---

## ⚠️ IMPORTANT: What Went Wrong?

The 403 error you saw means you were trying to deploy to the wrong platform. This app should be deployed as a **static website**, not as a Supabase Edge Function.

**Correct deployment target:** Vercel or Netlify  
**Incorrect deployment target:** ❌ Supabase Edge Functions

---

## ✅ STEP 1: VERIFY DEV_MODE IS DISABLED

✅ **ALREADY DONE!** I just set `DEV_MODE = false` in `/App.tsx`

---

## ✅ STEP 2: BUILD THE APP LOCALLY

Test that everything builds correctly:

```bash
npm install
npm run build
```

Expected output:
- ✅ Build completes successfully
- ✅ `/dist` folder is created
- ✅ No errors in terminal

If you see errors, fix them before proceeding.

---

## ✅ STEP 3: SETUP SUPABASE (Database Only)

Supabase is ONLY used for authentication and data storage, NOT for hosting the app.

### A. Create Supabase Project

1. Go to https://supabase.com
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name:** CPS Punisher
   - **Database Password:** (create a secure password - save it!)
   - **Region:** (choose closest to your users)
5. Click "Create new project"
6. Wait 2-3 minutes for setup

### B. Get API Credentials

1. In Supabase dashboard, go to **Project Settings** → **API**
2. Copy these two values:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **Anon/Public Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (long string)
3. Save them in a text file (you'll need them soon)

### C. Create Database Table

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Paste this SQL code:

```sql
-- Create KV Store Table
CREATE TABLE IF NOT EXISTS kv_store_a24eaa40 (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_kv_store_key ON kv_store_a24eaa40(key);

-- Enable Row Level Security
ALTER TABLE kv_store_a24eaa40 ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users
CREATE POLICY "Enable read access for authenticated users" 
ON kv_store_a24eaa40 FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Enable insert for authenticated users" 
ON kv_store_a24eaa40 FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" 
ON kv_store_a24eaa40 FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Enable delete for authenticated users" 
ON kv_store_a24eaa40 FOR DELETE 
TO authenticated 
USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
CREATE TRIGGER update_kv_store_updated_at BEFORE UPDATE
ON kv_store_a24eaa40 FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

4. Click "Run" button
5. You should see "Success. No rows returned"

### D. Enable Authentication

1. Go to **Authentication** → **Providers**
2. Make sure **Email** is enabled (should be by default)
3. Optional: Enable OAuth providers (Google, GitHub, etc.)

✅ **Supabase setup complete!**

---

## ✅ STEP 4: DEPLOY TO VERCEL (RECOMMENDED)

### Option A: Deploy from Web Interface (Easiest)

1. **Push code to GitHub first:**
   ```bash
   git init
   git add .
   git commit -m "Ready for deployment"
   git branch -M main
   ```

2. **Create GitHub repository:**
   - Go to https://github.com
   - Click "New repository"
   - Name: `cps-punisher`
   - Visibility: Private (recommended)
   - Don't initialize with README
   - Click "Create repository"

3. **Push to GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/cps-punisher.git
   git push -u origin main
   ```

4. **Deploy to Vercel:**
   - Go to https://vercel.com
   - Sign up or log in (can use GitHub account)
   - Click "Add New..." → "Project"
   - Import your `cps-punisher` repository
   - Configure:
     - **Framework Preset:** Vite (auto-detected)
     - **Root Directory:** ./
     - **Build Command:** `npm run build`
     - **Output Directory:** `dist`
   - Click "Deploy"

5. **Add Environment Variables:**
   - While deploying, click "Environment Variables"
   - Add these variables:
     ```
     VITE_SUPABASE_URL = your_supabase_project_url
     VITE_SUPABASE_ANON_KEY = your_supabase_anon_key
     ```
   - Click "Deploy"

6. **Wait for deployment** (2-3 minutes)

7. **Test your site:**
   - Vercel will give you a URL like: `https://cps-punisher.vercel.app`
   - Click it to visit your live app!

### Option B: Deploy via CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? cps-punisher
# - In which directory? ./
# - Override settings? No

# Add environment variables in dashboard
# Then deploy to production:
vercel --prod
```

---

## ✅ STEP 5: CONFIGURE CUSTOM DOMAIN (cpspunisher.com)

### A. Add Domain in Vercel

1. In Vercel dashboard, go to your project
2. Go to **Settings** → **Domains**
3. Add domain: `cpspunisher.com`
4. Add domain: `www.cpspunisher.com`

### B. Configure DNS at Your Registrar

Vercel will show you the DNS records to add. They will be:

**For cpspunisher.com (Apex domain):**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600
```

**For www.cpspunisher.com:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

### C. Add Records at Your Domain Registrar

1. Log into your domain registrar (where you bought cpspunisher.com)
2. Find DNS settings
3. Add the A record for the apex domain
4. Add the CNAME record for www
5. Save changes

### D. Wait for DNS Propagation

- DNS changes can take 1-48 hours (usually 1-4 hours)
- Check status at: https://dnschecker.org
- SSL certificate will be automatically provisioned by Vercel

---

## ✅ STEP 6: VERIFY DEPLOYMENT

### Test These Features:

1. **Visit your site:** `https://cps-punisher.vercel.app` (or your custom domain once DNS propagates)

2. **Test authentication:**
   - Click "Sign Up"
   - Create account with email
   - Should receive verification email
   - Log in successfully

3. **Test core features:**
   - Create a new case
   - Upload a document
   - Add timeline event
   - Check violation checker
   - Test criminal case tab
   - Browse community hub

4. **Test on mobile:**
   - Open on your phone
   - Should be responsive
   - All features should work

---

## ✅ STEP 7: CONTINUOUS DEPLOYMENT

Once connected to GitHub, every push auto-deploys!

```bash
# Make changes to your code
# ... edit files ...

# Commit and push
git add .
git commit -m "Update: description of changes"
git push origin main

# Vercel automatically:
# 1. Detects the push
# 2. Builds the app
# 3. Deploys to production
# 4. Your site updates in ~2 minutes!
```

---

## 🆘 TROUBLESHOOTING

### Issue: Build fails on Vercel

**Solution:**
```bash
# Test build locally first
npm run build

# If it fails locally, fix the errors
# Then push again
git add .
git commit -m "Fix build errors"
git push origin main
```

### Issue: Environment variables not working

**Solution:**
1. Go to Vercel dashboard
2. Settings → Environment Variables
3. Make sure variables are added for "Production"
4. Redeploy: Dashboard → Deployments → Three dots → Redeploy

### Issue: Authentication not working

**Solutions:**
- ✅ Verify DEV_MODE is `false` in `/App.tsx`
- ✅ Check environment variables in Vercel
- ✅ Verify Supabase project URL is correct
- ✅ Check browser console for errors

### Issue: 404 on page refresh

**Solution:**
- Vercel should handle this automatically with the `vercel.json` config
- If still happening, check that `vercel.json` exists and has the rewrites

### Issue: Domain not working after 48 hours

**Solution:**
1. Check DNS records at https://dnschecker.org
2. Verify records match exactly what Vercel shows
3. Clear browser cache
4. Try incognito/private browsing
5. Contact Vercel support if still not working

---

## 📊 YOUR DEPLOYMENT CHECKLIST

- [ ] DEV_MODE set to `false` ✅ (Already done)
- [ ] Code builds locally without errors
- [ ] Supabase project created
- [ ] Database table created
- [ ] Supabase credentials saved
- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables added to Vercel
- [ ] Deployment successful
- [ ] Site tested and working
- [ ] Custom domain configured (optional)
- [ ] DNS records added (optional)
- [ ] SSL certificate active (optional)

---

## 🎯 WHAT YOU SHOULD SEE

### Successful Deployment:

✅ Vercel build completes  
✅ Site accessible at vercel.app URL  
✅ No console errors  
✅ Sign up/login works  
✅ Can create cases  
✅ Can upload documents  
✅ All tabs load correctly  

### Your Live URLs:

- **Vercel URL:** `https://cps-punisher.vercel.app`
- **Custom Domain:** `https://cpspunisher.com` (once DNS propagates)

---

## 💡 PRO TIPS

1. **Always test locally first:**
   ```bash
   npm run build && npm run preview
   ```

2. **Use environment variables for all secrets** - never hardcode API keys

3. **Enable Vercel Analytics** in project settings for usage stats

4. **Set up Sentry** (optional) for error tracking

5. **Monitor your Supabase usage** - free tier has limits

6. **Keep your dependencies updated:**
   ```bash
   npm outdated
   npm update
   ```

---

## 🚀 QUICK COMMAND REFERENCE

```bash
# Local development
npm run dev              # Start dev server
npm run build           # Build for production
npm run preview         # Preview production build

# Git
git add .               # Stage changes
git commit -m "msg"     # Commit
git push origin main    # Push to GitHub (auto-deploys)

# Vercel CLI
vercel login           # Login
vercel                 # Deploy to preview
vercel --prod          # Deploy to production
vercel logs            # View logs
vercel env ls          # List environment variables
```

---

## ✅ YOU'RE DONE!

Your app is now:
- ✅ Deployed to production
- ✅ Accessible globally
- ✅ HTTPS/SSL secured
- ✅ Auto-deploys on git push
- ✅ Backed by Supabase database

**Live at:** `https://cps-punisher.vercel.app`

(And at `https://cpspunisher.com` once DNS propagates)

---

## 📞 NEED HELP?

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Vercel Support:** https://vercel.com/support
- **Supabase Discord:** https://supabase.com/discord

---

**🛡️ Fight Back. Defend Your Family. You're Live!**

**Copyright © 2024 Darren Guay - All Rights Reserved**
