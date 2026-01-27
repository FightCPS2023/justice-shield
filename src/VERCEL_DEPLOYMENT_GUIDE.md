# Vercel Deployment Guide for CPS Punisher
# Deploy to Vercel & Connect Custom Domain cpspunisher.com

## Prerequisites
- Node.js installed (v18 or higher recommended)
- Git installed
- Vercel account (free tier works)
- Domain cpspunisher.com registered and accessible

---

## Step 1: Install Vercel CLI

Open your terminal and run:

```bash
npm install -g vercel
```

---

## Step 2: Navigate to Your Project Directory

```bash
cd /path/to/your/cps-punisher-project
```

---

## Step 3: Login to Vercel

```bash
vercel login
```

This will open a browser window for authentication. Follow the prompts to log in.

---

## Step 4: Deploy to Vercel

### First Deployment

Run this command in your project root:

```bash
vercel
```

You'll be prompted with several questions:

1. **Set up and deploy?** → Press `Y` (Yes)
2. **Which scope?** → Select your Vercel account
3. **Link to existing project?** → Press `N` (No) for first deployment
4. **What's your project's name?** → Type `cps-punisher` (or press Enter to accept default)
5. **In which directory is your code located?** → Press Enter (uses current directory `.`)
6. **Want to override the settings?** → Press `N` (No) - your vercel.json has the correct settings

Vercel will now:
- Install dependencies
- Build your project
- Deploy to a preview URL

You'll get a URL like: `https://cps-punisher-xyz123.vercel.app`

### Deploy to Production

Once you verify the preview works, deploy to production:

```bash
vercel --prod
```

This creates your production deployment at: `https://cps-punisher.vercel.app`

---

## Step 5: Connect Custom Domain (cpspunisher.com)

### Option A: Using Vercel CLI

```bash
vercel domains add cpspunisher.com
```

### Option B: Using Vercel Dashboard (Recommended for Custom Domains)

1. Go to https://vercel.com/dashboard
2. Click on your `cps-punisher` project
3. Click **Settings** → **Domains**
4. Click **Add Domain**
5. Enter: `cpspunisher.com`
6. Click **Add**

Vercel will provide DNS configuration instructions.

---

## Step 6: Configure DNS Records

You need to update your domain's DNS settings. Log into your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.) and add these records:

### For Root Domain (cpspunisher.com):

**Option 1: Using A Record (Recommended)**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600
```

**Option 2: Using CNAME (Alternative)**
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
TTL: 3600
```

### For WWW Subdomain (www.cpspunisher.com):

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

**Note:** DNS propagation can take 24-48 hours, but often happens within minutes.

---

## Step 7: Add WWW Redirect (Optional but Recommended)

After your domain is connected, go back to Vercel Dashboard:

1. **Settings** → **Domains**
2. Click **Add** again
3. Enter: `www.cpspunisher.com`
4. Select **Redirect to cpspunisher.com** (or vice versa, your preference)
5. Click **Add**

This ensures both `cpspunisher.com` and `www.cpspunisher.com` work.

---

## Step 8: Configure Environment Variables

Your app uses Supabase and Gemini AI. You need to add environment variables:

### Via Vercel CLI:

```bash
vercel env add VITE_SUPABASE_URL
# Paste your Supabase URL when prompted

vercel env add VITE_SUPABASE_ANON_KEY
# Paste your Supabase anon key when prompted

vercel env add VITE_GEMINI_API_KEY
# Paste your Gemini API key when prompted

vercel env add VITE_STRIPE_PUBLISHABLE_KEY
# Paste your Stripe publishable key when prompted
```

### Via Vercel Dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add each variable:
   - `VITE_SUPABASE_URL` → Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` → Your Supabase anon key
   - `VITE_GEMINI_API_KEY` → Your Gemini API key
   - `VITE_STRIPE_PUBLISHABLE_KEY` → Your Stripe publishable key
3. Select **Production**, **Preview**, and **Development** for each
4. Click **Save**

### Redeploy After Adding Environment Variables:

```bash
vercel --prod
```

---

## Step 9: Update Supabase Configuration

Your Supabase project needs to allow requests from your new domain.

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Scroll to **Site URL** and add:
   ```
   https://cpspunisher.com
   ```
5. Scroll to **Redirect URLs** and add:
   ```
   https://cpspunisher.com/**
   https://cpspunisher.com
   https://www.cpspunisher.com/**
   https://www.cpspunisher.com
   ```
6. Click **Save**

---

## Step 10: Verify Deployment

1. Visit `https://cpspunisher.com` (wait for DNS propagation)
2. Test login/signup functionality
3. Test document upload
4. Test AI analysis
5. Test payment flow (Stripe)
6. Check browser console for errors

---

## Continuous Deployment

### Automatic Deployments via Git (Recommended)

If you connect your project to GitHub:

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Ready for production"
   git push origin main
   ```

2. Connect to Vercel:
   - Go to Vercel Dashboard → **Settings** → **Git**
   - Connect your GitHub repository
   - **Every push to `main` branch will auto-deploy to production**

### Manual Deployments

Whenever you make changes:

```bash
# Test locally first
npm run dev

# Build and test
npm run build
npm run preview

# Deploy to production
vercel --prod
```

---

## Common Issues & Solutions

### Issue: "Build failed"
**Solution:** Check build logs in terminal. Common causes:
- Missing dependencies: Run `npm install` locally
- TypeScript errors: Run `npm run build` locally to see errors
- Environment variables missing: Add them in Vercel dashboard

### Issue: "Cannot read environment variables"
**Solution:** Ensure environment variables:
1. Start with `VITE_` prefix (required for Vite)
2. Are added in Vercel dashboard
3. Redeploy after adding: `vercel --prod`

### Issue: "404 on page refresh"
**Solution:** Already handled by your `vercel.json` rewrites config

### Issue: "Supabase auth not working"
**Solution:** 
1. Check Supabase **Site URL** and **Redirect URLs** include your domain
2. Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct

### Issue: "Domain not connecting"
**Solution:**
1. Verify DNS records are correct
2. Wait 24-48 hours for DNS propagation
3. Use `dig cpspunisher.com` or `nslookup cpspunisher.com` to check DNS
4. Try clearing browser cache

---

## Quick Reference Commands

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy preview
vercel

# Deploy production
vercel --prod

# Add domain
vercel domains add cpspunisher.com

# Add environment variable
vercel env add VARIABLE_NAME

# View deployment logs
vercel logs

# List all deployments
vercel ls

# Check project info
vercel inspect

# Remove a deployment
vercel remove [deployment-url]
```

---

## Performance Optimization (Already Configured)

Your `vercel.json` includes:
- ✅ Automatic SPA routing (all routes → index.html)
- ✅ Cache headers for static assets (1 year)
- ✅ Security headers (XSS, clickjacking protection)
- ✅ Vite framework optimization

---

## Post-Deployment Checklist

- [ ] App loads at cpspunisher.com
- [ ] Both cpspunisher.com and www.cpspunisher.com work
- [ ] HTTPS is enabled (automatic via Vercel)
- [ ] Login/Signup works
- [ ] Document uploads work
- [ ] AI analysis works
- [ ] Stripe payments work
- [ ] All environment variables are set
- [ ] Supabase redirects are configured
- [ ] No console errors in browser
- [ ] Mobile responsive design works
- [ ] All 315+ features function correctly

---

## Support & Monitoring

### View Build Logs:
```bash
vercel logs --follow
```

### View Deployment URL:
```bash
vercel ls
```

### Rollback to Previous Deployment:
1. Go to Vercel Dashboard → **Deployments**
2. Find working deployment
3. Click **⋯** → **Promote to Production**

---

## Cost Estimate

**Vercel Free Tier Includes:**
- ✅ Unlimited deployments
- ✅ Custom domain (cpspunisher.com)
- ✅ Automatic HTTPS
- ✅ 100 GB bandwidth/month
- ✅ Serverless Functions (100 GB-hours)

**Your app should run fine on the free tier** unless you get massive traffic (100k+ visitors/month).

If you exceed limits, Vercel Pro is $20/month with 1TB bandwidth.

---

## Next Steps After Deployment

1. **Set up monitoring:** Consider adding Sentry or LogRocket
2. **Analytics:** Add Google Analytics or Plausible
3. **SEO:** Update meta tags in `/index.html`
4. **Social media:** Create Facebook/Twitter cards
5. **Legal:** Update Terms of Service with live domain
6. **Marketing:** Update all marketing materials with cpspunisher.com

---

## Emergency Contact

If deployment fails completely:
1. Check Vercel Status: https://www.vercel-status.com/
2. Check Supabase Status: https://status.supabase.com/
3. Review deployment logs: `vercel logs`
4. Revert to last working deployment in Vercel Dashboard

---

**Copyright © 2024 DARREN GUAY. All Rights Reserved.**
**The CPS Punisher™** - Professional CPS Defense Analyzer
