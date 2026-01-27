# 🚀 DEPLOYMENT GUIDE - THE CPS PUNISHER

Complete step-by-step guide to deploy The CPS Punisher to production with custom domain **cpspunisher.com**

---

## 📋 **PRE-DEPLOYMENT CHECKLIST**

Before deploying, ensure:

- [ ] DEV_MODE is set to `false` in `/App.tsx` (line 80)
- [ ] All environment variables are ready
- [ ] Supabase project is created and configured
- [ ] Custom domain is purchased (cpspunisher.com)
- [ ] Git repository is ready

---

## 🔧 **STEP 1: PREPARE THE CODE**

### **1.1 Disable Dev Mode**

Open `/App.tsx` and set:
```typescript
const DEV_MODE = false; // Set to false for production
```

### **1.2 Verify Build**
```bash
npm run build
```

Ensure no errors. The build output should be in `/dist`.

### **1.3 Test Production Build Locally**
```bash
npm run preview
```

Visit `http://localhost:4173` and test the app.

---

## 🗄️ **STEP 2: SETUP SUPABASE**

### **2.1 Create Supabase Project**

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization (or create one)
4. Set project details:
   - **Name:** CPS Punisher
   - **Database Password:** (secure password)
   - **Region:** (closest to your users)
5. Click "Create new project"

### **2.2 Get API Credentials**

1. Go to Project Settings > API
2. Copy these values:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **Anon/Public Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### **2.3 Setup Database**

1. Go to SQL Editor in Supabase Dashboard
2. Create new query
3. Paste and execute this SQL:

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

-- Create RLS policies
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

### **2.4 Configure Authentication**

1. Go to Authentication > Providers
2. Enable **Email** provider
3. Configure email templates (optional)
4. Enable OAuth providers (optional):
   - **Google:** Follow [Supabase Google Auth Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)
   - **GitHub:** Follow [Supabase GitHub Auth Guide](https://supabase.com/docs/guides/auth/social-login/auth-github)
   - **Facebook:** Follow [Supabase Facebook Auth Guide](https://supabase.com/docs/guides/auth/social-login/auth-facebook)

### **2.5 Configure Storage (Optional)**

If using file uploads:
1. Go to Storage
2. Create new bucket: `cps-documents`
3. Set to Private
4. Configure RLS policies

---

## 🐙 **STEP 3: SETUP GITHUB REPOSITORY**

### **3.1 Initialize Git (if not done)**
```bash
git init
git add .
git commit -m "Initial commit - The CPS Punisher v3.0"
```

### **3.2 Create GitHub Repository**

1. Go to [github.com](https://github.com)
2. Click "New Repository"
3. Set repository name: `cps-punisher`
4. Description: "Child Protective Services Case Defense Analyzer"
5. Choose **Private** (recommended for proprietary code)
6. Don't initialize with README (you already have one)
7. Click "Create repository"

### **3.3 Push to GitHub**
```bash
git remote add origin https://github.com/YOUR_USERNAME/cps-punisher.git
git branch -M main
git push -u origin main
```

---

## 🌐 **STEP 4: DEPLOY TO VERCEL (RECOMMENDED)**

### **4.1 Install Vercel CLI**
```bash
npm install -g vercel
```

### **4.2 Login to Vercel**
```bash
vercel login
```

### **4.3 Deploy**
```bash
vercel
```

Follow the prompts:
- **Set up and deploy?** Yes
- **Which scope?** Your account
- **Link to existing project?** No
- **Project name?** cps-punisher
- **Directory?** ./
- **Override settings?** No

### **4.4 Configure Environment Variables**

In Vercel Dashboard:
1. Go to your project
2. Go to Settings > Environment Variables
3. Add these variables:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX (optional)
VITE_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx (optional)
```

4. Redeploy:
```bash
vercel --prod
```

### **4.5 Setup Custom Domain**

In Vercel Dashboard:
1. Go to Settings > Domains
2. Add domain: `cpspunisher.com`
3. Add domain: `www.cpspunisher.com`
4. Vercel will show DNS records to configure

---

## 🌍 **STEP 5: CONFIGURE DNS FOR CUSTOM DOMAIN**

### **5.1 At Your Domain Registrar**

Add these DNS records:

#### **For Apex Domain (cpspunisher.com):**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600
```

#### **For WWW Subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

### **5.2 Wait for DNS Propagation**
- DNS changes can take 24-48 hours
- Check status: [dnschecker.org](https://dnschecker.org)

### **5.3 SSL Certificate**
- Vercel automatically provisions SSL (free)
- Usually ready within 24 hours
- Your site will be accessible at `https://cpspunisher.com`

---

## 🔄 **ALTERNATIVE: DEPLOY TO NETLIFY**

### **Option A: Deploy from GitHub**

1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" > "Import an existing project"
3. Connect to GitHub
4. Select `cps-punisher` repository
5. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
6. Add environment variables (same as Vercel)
7. Click "Deploy site"

### **Option B: Deploy via CLI**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize
netlify init

# Deploy
netlify deploy --prod
```

### **Custom Domain on Netlify**

1. Go to Domain Settings
2. Add custom domain: `cpspunisher.com`
3. Configure DNS records (similar to Vercel)

---

## 📊 **STEP 6: SETUP MONITORING (OPTIONAL)**

### **6.1 Google Analytics**

1. Go to [analytics.google.com](https://analytics.google.com)
2. Create new GA4 property
3. Copy Measurement ID (format: G-XXXXXXXXXX)
4. Add to environment variables: `VITE_GA_MEASUREMENT_ID`

### **6.2 Sentry Error Tracking**

1. Go to [sentry.io](https://sentry.io)
2. Create new project (React)
3. Copy DSN
4. Add to environment variables: `VITE_SENTRY_DSN`

---

## ✅ **STEP 7: POST-DEPLOYMENT VERIFICATION**

### **7.1 Test Core Features**
- [ ] Homepage loads correctly
- [ ] Sign up / Login works
- [ ] Create new case
- [ ] Upload document
- [ ] AI analysis works (if Gemini API configured)
- [ ] Timeline events
- [ ] Violation checker
- [ ] Criminal case component
- [ ] Community hub
- [ ] All tabs load properly

### **7.2 Test on Multiple Devices**
- [ ] Desktop (Chrome, Firefox, Safari)
- [ ] Tablet
- [ ] Mobile (iOS & Android)

### **7.3 Verify Security**
- [ ] HTTPS working (green lock icon)
- [ ] Authentication working
- [ ] Environment variables not exposed
- [ ] No console errors

### **7.4 Check Performance**
- [ ] Fast load times (< 3 seconds)
- [ ] Images optimized
- [ ] No broken links
- [ ] Lighthouse score > 90

---

## 🔄 **CONTINUOUS DEPLOYMENT**

### **Automatic Deployments**

With Vercel/Netlify + GitHub:
1. Every push to `main` branch auto-deploys
2. Preview deployments for pull requests
3. Rollback available if needed

### **Deploy Updates**
```bash
# Make changes
git add .
git commit -m "Update: description of changes"
git push origin main
```

Vercel/Netlify will automatically deploy.

---

## 🔐 **SECURITY CHECKLIST**

- [ ] DEV_MODE set to `false`
- [ ] Environment variables configured correctly
- [ ] Supabase RLS policies enabled
- [ ] HTTPS/SSL working
- [ ] No sensitive data in code
- [ ] `.env` file in `.gitignore`
- [ ] API keys secured
- [ ] Authentication working properly

---

## 📱 **CUSTOM DOMAIN FINAL SETUP**

Once DNS is propagated:

1. **Test both domains:**
   - `https://cpspunisher.com` ✅
   - `https://www.cpspunisher.com` ✅

2. **Redirect www to apex (optional):**
   - Configure in Vercel/Netlify settings

3. **Update all references:**
   - Social media links
   - Business cards
   - Email signatures
   - Marketing materials

---

## 🎉 **LAUNCH CHECKLIST**

- [ ] Code deployed to production
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Database configured
- [ ] Authentication working
- [ ] All features tested
- [ ] Mobile responsive
- [ ] Analytics configured
- [ ] Error tracking active
- [ ] Legal disclaimers visible
- [ ] Copyright notices present
- [ ] Help bot functional
- [ ] Community hub accessible

---

## 🆘 **TROUBLESHOOTING**

### **Issue: Build Fails**
```bash
# Clear and reinstall dependencies
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

### **Issue: Environment Variables Not Working**
- Redeploy after adding variables
- Check variable names (must start with `VITE_`)
- Verify no typos in values

### **Issue: Domain Not Working**
- Wait 24-48 hours for DNS propagation
- Verify DNS records are correct
- Check [dnschecker.org](https://dnschecker.org)
- Clear browser cache

### **Issue: Supabase Connection Failed**
- Verify project URL and anon key
- Check Supabase project status
- Ensure RLS policies are configured
- Test connection in browser console

### **Issue: 404 on Refresh**
- Ensure rewrites are configured (see vercel.json/netlify.toml)
- Check build output directory is `dist`

---

## 📞 **DEPLOYMENT SUPPORT**

### **Vercel Support**
- Docs: [vercel.com/docs](https://vercel.com/docs)
- Discord: [vercel.com/discord](https://vercel.com/discord)

### **Netlify Support**
- Docs: [docs.netlify.com](https://docs.netlify.com)
- Community: [answers.netlify.com](https://answers.netlify.com)

### **Supabase Support**
- Docs: [supabase.com/docs](https://supabase.com/docs)
- Discord: [supabase.com/discord](https://supabase.com/discord)

---

## 🎯 **POST-LAUNCH TASKS**

1. **Monitor Analytics**
   - User signups
   - Feature usage
   - Error rates

2. **Collect Feedback**
   - Help bot submissions
   - Community forum posts
   - Direct user feedback

3. **Plan Updates**
   - Bug fixes
   - Feature enhancements
   - Performance improvements

4. **Marketing**
   - Social media announcement
   - Blog post
   - Press release
   - SEO optimization

---

## 🚀 **YOU'RE LIVE!**

**Your app is now deployed at:**
- **Production URL:** `https://cpspunisher.com`
- **Vercel Dashboard:** [vercel.com/dashboard](https://vercel.com/dashboard)
- **GitHub Repository:** `https://github.com/YOUR_USERNAME/cps-punisher`

**Copyright © 2024 Darren Guay - All Rights Reserved**

---

## 📈 **NEXT STEPS**

1. ✅ Deploy to production
2. ✅ Configure custom domain
3. 🎯 Launch marketing campaign
4. 📊 Monitor user analytics
5. 🔄 Iterate based on feedback
6. 💰 Setup payment processing (Stripe)
7. 📱 Consider mobile app development

---

**🛡️ Fight Back. Defend Your Family. The CPS Punisher is LIVE!**
