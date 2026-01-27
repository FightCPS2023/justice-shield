# CPS Case Defense Analyzer - Deployment Guide

**Version:** 1.0  
**Last Updated:** November 24, 2025  
**Target:** Production Deployment

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Frontend Deployment](#frontend-deployment)
5. [Backend Deployment](#backend-deployment)
6. [Database Setup](#database-setup)
7. [Payment Integration](#payment-integration)
8. [AI Integration](#ai-integration)
9. [DNS & Domain Setup](#dns--domain-setup)
10. [SSL Certificates](#ssl-certificates)
11. [Monitoring & Logging](#monitoring--logging)
12. [Backup & Recovery](#backup--recovery)
13. [Security Checklist](#security-checklist)
14. [Post-Deployment](#post-deployment)
15. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This guide covers deploying the CPS Case Defense Analyzer to production. The application uses:

- **Frontend:** React app (Vercel/Netlify)
- **Backend:** Supabase (Database, Auth, Storage)
- **AI:** OpenAI GPT-4
- **Payment:** Stripe
- **Monitoring:** Sentry + Analytics

### **Deployment Architecture**

```
┌─────────────────────────────────────────────┐
│           CDN (Vercel/Netlify)              │
│         Frontend Static Assets              │
└─────────────┬───────────────────────────────┘
              │
              ↓
┌─────────────────────────────────────────────┐
│          Supabase Platform                  │
│  ┌──────────────────────────────────────┐   │
│  │  PostgreSQL Database                 │   │
│  │  - User data                         │   │
│  │  - Documents metadata                │   │
│  │  - Subscriptions                     │   │
│  └──────────────────────────────────────┘   │
│  ┌──────────────────────────────────────┐   │
│  │  Supabase Storage                    │   │
│  │  - PDF files                         │   │
│  │  - User uploads                      │   │
│  └──────────────────────────────────────┘   │
│  ┌──────────────────────────────────────┐   │
│  │  Edge Functions (Deno)               │   │
│  │  - API endpoints                     │   │
│  │  - Webhook handlers                  │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
              │
              ↓
┌─────────────────────────────────────────────┐
│         External Services                   │
│  - OpenAI (AI Analysis)                     │
│  - Stripe (Payments)                        │
│  - SendGrid (Email)                         │
│  - Sentry (Error Tracking)                  │
└─────────────────────────────────────────────┘
```

---

## ✅ Prerequisites

### **Required Accounts**

Before deployment, create accounts for:

- [ ] **Vercel** or **Netlify** (Frontend hosting)
- [ ] **Supabase** (Backend services)
- [ ] **Stripe** (Payment processing)
- [ ] **OpenAI** (AI API)
- [ ] **SendGrid** or **Postmark** (Email)
- [ ] **Sentry** (Error tracking - optional)
- [ ] **Google Analytics** (Analytics - optional)
- [ ] **Domain Registrar** (Domain name)

### **Required Tools**

Install these on your local machine:

```bash
# Node.js and npm
node --version  # Should be v18 or higher
npm --version   # Should be v9 or higher

# Git
git --version

# Supabase CLI (optional but recommended)
npm install -g supabase

# Vercel CLI (if using Vercel)
npm install -g vercel

# Netlify CLI (if using Netlify)
npm install -g netlify-cli
```

### **Access Requirements**

- [ ] GitHub account with repository access
- [ ] Production domain name purchased
- [ ] SSL certificate (handled by host)
- [ ] Team member access configured

---

## 🔧 Environment Setup

### **1. Clone Repository**

```bash
git clone https://github.com/your-org/cps-case-analyzer.git
cd cps-case-analyzer
```

### **2. Install Dependencies**

```bash
npm install
```

### **3. Environment Variables**

Create `.env.production` file in root:

```bash
# Frontend URL
VITE_APP_URL=https://app.cpsdefenseanalyzer.com

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Stripe (Public Key)
VITE_STRIPE_PUBLIC_KEY=pk_live_xxxxx

# OpenAI
VITE_OPENAI_API_KEY=sk-xxxxx  # Don't expose in frontend!

# Analytics
VITE_GA_TRACKING_ID=G-XXXXXXXXXX

# Sentry
VITE_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx

# Feature Flags
VITE_DEV_MODE=false
VITE_ENABLE_ANALYTICS=true
```

Create `.env.server` for Edge Functions:

```bash
# Supabase (Server)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# Stripe (Secret Key)
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# OpenAI
OPENAI_API_KEY=sk-xxxxx

# Email
SENDGRID_API_KEY=SG.xxxxx
FROM_EMAIL=noreply@cpsdefenseanalyzer.com

# App Settings
APP_URL=https://app.cpsdefenseanalyzer.com
```

### **4. Build Configuration**

Update `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['lucide-react', 'sonner'],
        },
      },
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
});
```

---

## 🚀 Frontend Deployment

### **Option A: Vercel (Recommended)**

#### **1. Install Vercel CLI**

```bash
npm install -g vercel
```

#### **2. Login to Vercel**

```bash
vercel login
```

#### **3. Deploy**

```bash
# First deployment (production)
vercel --prod

# Or link to existing project
vercel link
vercel --prod
```

#### **4. Configure Project Settings**

In Vercel Dashboard:

1. Go to **Project Settings** → **Environment Variables**
2. Add all variables from `.env.production`
3. Set **Build Command:** `npm run build`
4. Set **Output Directory:** `dist`
5. Set **Install Command:** `npm install`

#### **5. Configure Domain**

```bash
# Add custom domain
vercel domains add app.cpsdefenseanalyzer.com

# Verify DNS settings
vercel domains verify app.cpsdefenseanalyzer.com
```

#### **6. Enable Auto-Deployment**

In Vercel Dashboard:
1. Connect GitHub repository
2. Enable **Automatic Deployments** for `main` branch
3. Configure preview deployments for PRs

---

### **Option B: Netlify**

#### **1. Install Netlify CLI**

```bash
npm install -g netlify-cli
```

#### **2. Login to Netlify**

```bash
netlify login
```

#### **3. Deploy**

```bash
# Build locally
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

#### **4. Configure via `netlify.toml`**

Create `netlify.toml` in root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

#### **5. Configure Environment Variables**

In Netlify Dashboard:
1. Go to **Site Settings** → **Build & Deploy** → **Environment**
2. Add all variables from `.env.production`

#### **6. Configure Domain**

1. Go to **Domain Settings**
2. Add custom domain: `app.cpsdefenseanalyzer.com`
3. Configure DNS records as instructed

---

## 🗄️ Backend Deployment (Supabase)

### **1. Create Supabase Project**

1. Go to https://app.supabase.com
2. Click **New Project**
3. Choose organization
4. Set project name: `cps-defense-analyzer-prod`
5. Set database password (save securely!)
6. Choose region (closest to users)
7. Choose pricing plan (Pro recommended)

### **2. Configure Authentication**

In Supabase Dashboard → **Authentication** → **Settings**:

```
Site URL: https://app.cpsdefenseanalyzer.com
Redirect URLs:
  - https://app.cpsdefenseanalyzer.com/auth/callback
  - https://app.cpsdefenseanalyzer.com/*

Email Templates:
  - Customize confirmation email
  - Customize password reset email
  - Add company branding

JWT Expiry: 3600 seconds (1 hour)
Refresh Token Expiry: 604800 seconds (7 days)

Enable Email Provider:
  ✓ Enable email signup
  ✓ Enable email confirmations
```

### **3. Database Schema**

Run migrations in Supabase SQL Editor:

```sql
-- Users Table (extends auth.users)
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  user_type TEXT CHECK (user_type IN ('parent', 'attorney')),
  phone TEXT,
  state TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can only see their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Subscriptions Table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tier TEXT CHECK (tier IN ('free', 'premium', 'attorney')) DEFAULT 'free',
  status TEXT CHECK (status IN ('active', 'canceled', 'past_due')) DEFAULT 'active',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- User Data Table
CREATE TABLE public.user_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  documents JSONB,
  timeline_events JSONB,
  case_details JSONB,
  violations JSONB,
  last_saved TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own data" ON user_data
  FOR ALL USING (auth.uid() = user_id);

-- AI Usage Table
CREATE TABLE public.ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  credits_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, month)
);

ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage" ON ai_usage
  FOR SELECT USING (auth.uid() = user_id);

-- Forum Posts Table (Premium Feature)
CREATE TABLE public.forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT CHECK (category IN ('success-stories', 'legal-tips', 'general', 'q-and-a')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  reply_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view posts" ON forum_posts
  FOR SELECT USING (true);

CREATE POLICY "Users can create posts" ON forum_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_user_data_user_id ON user_data(user_id);
CREATE INDEX idx_ai_usage_user_month ON ai_usage(user_id, month);
CREATE INDEX idx_forum_posts_category ON forum_posts(category);
CREATE INDEX idx_forum_posts_created ON forum_posts(created_at DESC);
```

### **4. Storage Buckets**

In Supabase Dashboard → **Storage**:

```bash
# Create bucket for documents
Bucket name: documents
Public: false
File size limit: 10 MB
Allowed MIME types: application/pdf, image/*, text/plain

# Storage Policies
- Users can upload to their own folder
- Users can read from their own folder
- Users can delete from their own folder
```

Storage policies:

```sql
-- Policy for document uploads
CREATE POLICY "Users can upload own documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

### **5. Deploy Edge Functions**

```bash
# Login to Supabase
supabase login

# Link to project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy server

# Set secrets
supabase secrets set STRIPE_SECRET_KEY=sk_live_xxxxx
supabase secrets set OPENAI_API_KEY=sk-xxxxx
supabase secrets set SENDGRID_API_KEY=SG.xxxxx
```

---

## 💳 Payment Integration (Stripe)

### **1. Stripe Account Setup**

1. Create Stripe account at https://stripe.com
2. Complete business verification
3. Add bank account for payouts
4. Configure tax settings

### **2. Create Products and Prices**

In Stripe Dashboard → **Products**:

**Premium Tier:**
```
Name: Premium Monthly
Description: Unlimited uploads, enhanced AI, premium features
Price: $19.99/month
Billing Period: Monthly
```

**Attorney Suite:**
```
Name: Attorney Suite Monthly
Description: Professional AI, multi-client management, paralegal tools
Price: $99/month
Billing Period: Monthly
```

### **3. Configure Webhooks**

In Stripe Dashboard → **Developers** → **Webhooks**:

```
Endpoint URL: https://your-project.supabase.co/functions/v1/server/webhooks/stripe

Events to send:
  ✓ customer.subscription.created
  ✓ customer.subscription.updated
  ✓ customer.subscription.deleted
  ✓ invoice.payment_succeeded
  ✓ invoice.payment_failed
  ✓ customer.created
  ✓ customer.updated
```

Copy webhook signing secret and add to Edge Function secrets:

```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### **4. Test Payment Flow**

Use Stripe test mode:

```
Test Card: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

### **5. Enable Production Mode**

1. Complete Stripe activation checklist
2. Switch to live mode
3. Update API keys in environment variables
4. Test with real payment

---

## 🤖 AI Integration (OpenAI)

### **1. OpenAI Account Setup**

1. Create account at https://platform.openai.com
2. Add payment method
3. Set usage limits (recommended: $100/month initially)

### **2. Get API Key**

```bash
# In OpenAI Dashboard → API Keys
# Create new secret key
# Copy and save securely (shown only once)
```

### **3. Configure in Edge Function**

```bash
supabase secrets set OPENAI_API_KEY=sk-xxxxx
```

### **4. Implement AI Calls**

Update `supabase/functions/server/index.tsx`:

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
});

async function analyzeDocument(content: string, tier: string) {
  const systemPrompt = getAIPrompt(tier);
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: content }
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });
  
  return response.choices[0].message.content;
}
```

### **5. Set Usage Limits**

In Edge Function:

```typescript
// Check monthly credits
async function checkAICredits(userId: string, tier: string) {
  const limits = {
    free: 10,
    premium: 100,
    attorney: 1000,
  };
  
  const usage = await getMonthlyUsage(userId);
  
  if (usage >= limits[tier]) {
    throw new Error('Monthly AI credit limit reached');
  }
  
  return limits[tier] - usage;
}
```

---

## 🌐 DNS & Domain Setup

### **1. Purchase Domain**

Recommended registrars:
- Namecheap
- Google Domains
- Cloudflare

Example: `cpsdefenseanalyzer.com`

### **2. Configure DNS Records**

**For Vercel:**

```
Type    Name    Value                           TTL
A       @       76.76.21.21                     Auto
CNAME   www     cname.vercel-dns.com            Auto
CNAME   app     cname.vercel-dns.com            Auto
```

**For Netlify:**

```
Type    Name    Value                           TTL
A       @       75.2.60.5                       3600
CNAME   www     your-site.netlify.app           3600
CNAME   app     your-site.netlify.app           3600
```

### **3. Email DNS Records**

**For SendGrid:**

```
Type    Name                        Value                       TTL
CNAME   em1234                      u1234567.wl.sendgrid.net    3600
CNAME   s1._domainkey              s1.domainkey.u1234567...     3600
CNAME   s2._domainkey              s2.domainkey.u1234567...     3600
```

### **4. Verify DNS Propagation**

```bash
# Check DNS propagation
dig app.cpsdefenseanalyzer.com
nslookup app.cpsdefenseanalyzer.com

# Or use online tool
# https://dnschecker.org
```

---

## 🔒 SSL Certificates

### **Automatic SSL (Vercel/Netlify)**

Both platforms handle SSL automatically:

1. Add custom domain in dashboard
2. Wait for DNS verification (5-60 minutes)
3. SSL certificate issued automatically (Let's Encrypt)
4. Auto-renewal every 90 days

### **Manual SSL (if needed)**

```bash
# Using Let's Encrypt (Certbot)
sudo certbot certonly --manual -d app.cpsdefenseanalyzer.com
```

### **Force HTTPS**

Add to `netlify.toml` or Vercel config:

```toml
[[redirects]]
  from = "http://app.cpsdefenseanalyzer.com/*"
  to = "https://app.cpsdefenseanalyzer.com/:splat"
  status = 301
  force = true
```

---

## 📊 Monitoring & Logging

### **1. Sentry Setup (Error Tracking)**

```bash
npm install @sentry/react @sentry/vite-plugin
```

Configure in `main.tsx`:

```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: 'production',
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

### **2. Google Analytics**

Add to `index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### **3. Supabase Logs**

Access logs in Supabase Dashboard:
- **Logs** → **Edge Functions** (API logs)
- **Logs** → **Database** (Query logs)
- **Logs** → **Auth** (Authentication logs)

### **4. Uptime Monitoring**

Set up uptime monitoring:
- UptimeRobot (free)
- Pingdom
- StatusCake

Monitor these endpoints:
- `https://app.cpsdefenseanalyzer.com` (Frontend)
- `https://your-project.supabase.co/rest/v1/` (Backend health)

---

## 💾 Backup & Recovery

### **1. Database Backups**

Supabase Pro includes automatic daily backups.

**Manual backup:**

```bash
# Export database
pg_dump -h db.your-project.supabase.co \
  -U postgres \
  -d postgres \
  > backup_$(date +%Y%m%d).sql

# Restore from backup
psql -h db.your-project.supabase.co \
  -U postgres \
  -d postgres \
  < backup_20241124.sql
```

### **2. Storage Backups**

Download all user files:

```bash
# Using Supabase CLI
supabase storage download documents/ ./backup/documents/
```

### **3. Code Backups**

- GitHub repository (primary)
- Regular releases/tags
- Environment variables documented

### **4. Recovery Procedures**

Document recovery steps:

1. **Database corruption:** Restore from latest backup
2. **Function failure:** Redeploy from GitHub
3. **Storage loss:** Restore from backup
4. **Domain issues:** Update DNS records
5. **Complete failure:** Rebuild from documentation

---

## 🔐 Security Checklist

### **Pre-Deployment Security**

- [ ] All secrets stored in environment variables (never in code)
- [ ] `.env` files added to `.gitignore`
- [ ] Database Row Level Security (RLS) enabled
- [ ] API rate limiting configured
- [ ] CORS properly configured
- [ ] Input validation on all forms
- [ ] SQL injection prevention (use parameterized queries)
- [ ] XSS protection enabled
- [ ] CSRF tokens implemented
- [ ] File upload validation (type, size limits)
- [ ] Authentication tokens encrypted
- [ ] HTTPS enforced everywhere
- [ ] Security headers configured

### **Security Headers**

Add to `netlify.toml` or Vercel config:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "geolocation=(), microphone=(), camera=()"
    Strict-Transport-Security = "max-age=31536000; includeSubDomains"
```

### **Content Security Policy**

```typescript
Content-Security-Policy: 
  default-src 'self'; 
  script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; 
  style-src 'self' 'unsafe-inline'; 
  img-src 'self' data: https:; 
  font-src 'self' data:; 
  connect-src 'self' https://*.supabase.co https://api.openai.com;
```

---

## 🚦 Post-Deployment

### **1. Smoke Tests**

Test critical user flows:

- [ ] User can sign up
- [ ] User can log in
- [ ] User can upload document
- [ ] AI analysis works
- [ ] Timeline auto-generates
- [ ] Violations detected
- [ ] Payment flow works
- [ ] Email notifications sent
- [ ] Data persists after refresh
- [ ] Mobile responsive works

### **2. Performance Testing**

```bash
# Lighthouse audit
npm install -g lighthouse
lighthouse https://app.cpsdefenseanalyzer.com --view

# Load testing
npm install -g artillery
artillery quick --count 100 --num 10 https://app.cpsdefenseanalyzer.com
```

### **3. Analytics Verification**

- [ ] Google Analytics receiving data
- [ ] Sentry capturing errors
- [ ] Stripe webhooks working
- [ ] Email delivery confirmed
- [ ] Conversion tracking working

### **4. Documentation Update**

- [ ] API documentation updated with production URLs
- [ ] User manual reflects current features
- [ ] Team trained on deployment process
- [ ] Runbook created for common issues

### **5. Monitoring Setup**

Set up alerts for:
- Site downtime (>1 minute)
- Error rate >1%
- Payment failures
- Database performance issues
- API rate limit exceeded

---

## 🐛 Troubleshooting

### **Common Issues**

**Issue: Build fails on Vercel/Netlify**

```bash
# Check build logs
# Common causes:
- Missing environment variables
- TypeScript errors
- Module not found

# Solution:
1. Check all env vars are set
2. Run `npm run build` locally
3. Fix any TypeScript errors
4. Ensure all imports are correct
```

**Issue: API calls failing (401 Unauthorized)**

```bash
# Causes:
- Expired token
- Missing Authorization header
- Invalid token

# Solution:
1. Check token in localStorage
2. Verify Authorization header format
3. Try re-authenticating
4. Check Supabase JWT settings
```

**Issue: Database connection errors**

```bash
# Causes:
- Incorrect connection string
- Database sleeping (free tier)
- Connection pool exhausted

# Solution:
1. Verify SUPABASE_URL in env vars
2. Upgrade to Pro (no sleeping)
3. Implement connection pooling
```

**Issue: Stripe webhooks not received**

```bash
# Causes:
- Incorrect endpoint URL
- Missing webhook signature verification
- Wrong secret key

# Solution:
1. Check webhook URL in Stripe dashboard
2. Verify STRIPE_WEBHOOK_SECRET
3. Check Edge Function logs
4. Test with Stripe CLI
```

**Issue: AI analysis not working**

```bash
# Causes:
- Invalid OpenAI API key
- Rate limit exceeded
- Insufficient credits

# Solution:
1. Verify OPENAI_API_KEY
2. Check OpenAI usage dashboard
3. Add more credits
4. Implement fallback responses
```

### **Rollback Procedure**

If deployment fails:

**Vercel:**
```bash
# Rollback to previous deployment
vercel rollback
```

**Netlify:**
```bash
# In dashboard, go to Deploys
# Click on previous successful deploy
# Click "Publish deploy"
```

**Database:**
```bash
# Restore from backup
supabase db dump -f backup.sql
supabase db restore backup.sql
```

---

## 📋 Deployment Checklist

### **Pre-Deployment**

- [ ] All features tested locally
- [ ] Code reviewed and merged to `main`
- [ ] Environment variables documented
- [ ] Database migrations ready
- [ ] Secrets configured in production
- [ ] Domain DNS configured
- [ ] SSL certificate ready
- [ ] Backup procedures tested
- [ ] Monitoring tools configured
- [ ] Team notified of deployment

### **During Deployment**

- [ ] Frontend deployed to Vercel/Netlify
- [ ] Database schema migrated
- [ ] Edge Functions deployed
- [ ] Storage buckets configured
- [ ] DNS records updated
- [ ] SSL certificate verified
- [ ] Environment variables set
- [ ] Secrets configured
- [ ] Webhooks registered

### **Post-Deployment**

- [ ] Smoke tests passed
- [ ] Performance tests passed
- [ ] Analytics working
- [ ] Monitoring alerts configured
- [ ] Documentation updated
- [ ] Team trained
- [ ] Users notified (if applicable)
- [ ] Celebration! 🎉

---

## 📞 Support

### **Deployment Issues**

For deployment support:
- Review this guide
- Check platform documentation
- Contact DevOps team
- Create support ticket

### **Platform Support**

- **Vercel:** https://vercel.com/support
- **Netlify:** https://answers.netlify.com
- **Supabase:** https://supabase.com/support
- **Stripe:** https://support.stripe.com

---

## 🔄 Continuous Deployment

### **GitHub Actions Workflow**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

**Deployment Guide Version:** 1.0  
**Last Updated:** November 24, 2025  
**Maintained By:** DevOps Team

**Estimated Deployment Time:** 4-6 hours for complete setup

---

© 2025 CPS Case Defense Analyzer - Deployment Guide
