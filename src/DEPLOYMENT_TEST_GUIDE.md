# How to Send a Test Version of Your CPS Case Defense Analyzer

## 🎯 Quick Overview

You have several options to share your app for testing:
1. **Figma Make Preview** (Easiest - Instant)
2. **Vercel/Netlify** (Recommended - Free, Professional)
3. **Direct Code Export** (Advanced - Full Control)
4. **Local Testing** (Team Members Only)

---

## Option 1: 📱 Figma Make Preview Share (Easiest)

### If Figma Make has built-in preview/share:

**Steps:**
1. Look for a "Preview" or "Share" button in Figma Make
2. Click "Share Preview Link" or "Generate Test Link"
3. Copy the generated URL
4. Send to testers via email/message

**Pros:**
- Instant sharing
- No deployment needed
- Auto-updates when you make changes

**Cons:**
- May have Figma Make branding
- Limited customization
- Requires Figma Make account for some features

---

## Option 2: 🚀 Deploy to Vercel (Recommended)

### Best for professional testing with custom domain

**Prerequisites:**
- GitHub account (free)
- Vercel account (free)

### Step-by-Step:

#### 1. Export Your Code from Figma Make

Click the **Export** or **Download Code** button in Figma Make to get your project files.

#### 2. Create a GitHub Repository

```bash
# In your terminal/command prompt:
cd path/to/your/exported/code

# Initialize git repository
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - CPS Defense Analyzer"

# Create repo on GitHub (github.com/new)
# Then connect and push:
git remote add origin https://github.com/YOUR_USERNAME/cps-defense-analyzer.git
git branch -M main
git push -u origin main
```

#### 3. Deploy to Vercel

**Via Vercel Website:**
1. Go to [vercel.com](https://vercel.com)
2. Sign up/login with GitHub
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: Vite (or auto-detect)
   - **Build Command**: `npm run build` or `vite build`
   - **Output Directory**: `dist`
6. Add **Environment Variables** (CRITICAL):
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
7. Click "Deploy"

**Via Vercel CLI:**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts and add environment variables
```

#### 4. Share Your Test URL

Vercel will give you a URL like:
```
https://cps-defense-analyzer.vercel.app
```

**Share this with testers!**

**Custom Domain (Optional):**
- In Vercel dashboard → Settings → Domains
- Add: `test.yourdefenseapp.com`

---

## Option 3: 🌐 Deploy to Netlify (Alternative)

Similar to Vercel but with different features.

### Quick Deploy:

#### Via Netlify CLI:
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Build your app
npm run build

# Deploy
netlify deploy --prod

# Set environment variables in Netlify dashboard
```

#### Via Netlify Website:
1. Go to [netlify.com](https://netlify.com)
2. Drag & drop your `dist` folder (after running `npm run build`)
3. Or connect GitHub repository
4. Add environment variables in Site Settings → Environment Variables

**Result:** Get URL like `https://cps-defense-analyzer.netlify.app`

---

## Option 4: 📦 Direct Code Export & Hosting

### For Advanced Users with Own Hosting

#### Export Code Package:

**Create a ZIP file:**
```bash
# Export from Figma Make, then:
cd your-project-folder

# Install dependencies
npm install

# Build production version
npm run build

# The 'dist' folder contains your deployable app
zip -r cps-analyzer-build.zip dist/
```

**Send the ZIP to your tester with instructions:**

```markdown
# CPS Defense Analyzer - Test Version

## Quick Setup:

1. Unzip the file
2. Host the contents on any web server
3. Access via: http://your-server/path-to-dist/

## OR use Python for quick local server:
cd dist
python3 -m http.server 8000
# Then visit: http://localhost:8000
```

---

## Option 5: 🏠 Local Testing (Team/Internal)

### For developers or technical testers

**Send them the repository:**

1. **Via GitHub:**
   ```bash
   # They clone:
   git clone https://github.com/YOUR_USERNAME/cps-defense-analyzer.git
   cd cps-defense-analyzer
   
   # Install dependencies:
   npm install
   
   # Create .env file with:
   VITE_SUPABASE_URL=your_url
   VITE_SUPABASE_ANON_KEY=your_key
   
   # Run dev server:
   npm run dev
   
   # Access: http://localhost:5173
   ```

2. **Via ZIP File:**
   - Export code from Figma Make
   - ZIP the entire project folder
   - Send via email/cloud storage
   - Include `.env.example` file with instructions

---

## 🔐 Handling Supabase Backend

### CRITICAL: Your app uses Supabase backend

You have **3 options** for testing:

### Option A: Shared Test Environment (Recommended)

**Use your existing Supabase project:**

1. In Supabase Dashboard → Settings → API
2. Get your credentials:
   - Project URL: `https://xxxxx.supabase.co`
   - Anon/Public Key: `eyJhbG...`
   - Service Role Key (KEEP SECRET)

3. Add to deployment environment variables:
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbG...
   ```

4. Enable Row Level Security in Supabase to protect data
5. Testers will share the same database (separate by user accounts)

### Option B: Separate Test Database

**Create a staging Supabase project:**

1. Go to [supabase.com](https://supabase.com)
2. Create new project: "cps-analyzer-staging"
3. Run your database migrations
4. Get new credentials
5. Use these credentials in test deployment

**Pros:**
- Test data separate from production
- Safe to break things
- Can reset anytime

### Option C: Mock/Demo Mode

**Disable backend for pure demo:**

In your `App.tsx`, update:

```typescript
// Set to true for demo without backend
const DEV_MODE = true;
const DEMO_MODE = true; // Add this

// Then in your app, skip API calls if DEMO_MODE is true
```

**Pros:**
- No backend setup needed
- Fast for UI/UX testing
- Works anywhere

**Cons:**
- No real data persistence
- Limited feature testing

---

## 📧 Sending Test Invitations

### Email Template for Testers:

```markdown
Subject: CPS Defense Analyzer - Test Version Ready

Hi [Name],

I'm excited to share the test version of the CPS Case Defense Analyzer!

🔗 Test Link: https://cps-defense-analyzer.vercel.app

📋 Test Account:
- Create your own account via the app
- OR use: test@example.com / TestPass123

🎯 What to Test:
1. Upload CPS documents in the Documents tab
2. Check violation detection accuracy
3. Try the AI-powered defense strategies
4. Test the new Bulk Data features (Premium tabs)
5. Generate case analysis podcasts

🆕 New Features (Premium - Already Unlocked):
- Citation Network Visualization
- AI Semantic Search
- Advanced Analytics Dashboard
- Offline Mode
- Bulk Data Import

⏰ Timeline: Please test by [DATE] and send feedback

📝 Feedback: 
- Use the feedback form in the app
- OR email me directly
- OR comment in [Shared Doc Link]

🐛 Report Bugs:
- What you did
- What you expected
- What actually happened
- Screenshots if possible

🙏 Thank You!
Your feedback will help improve this tool for parents fighting CPS cases.

Questions? Just reply to this email.

Best,
[Your Name]

---
⚠️ Important: This is a TEST VERSION. Do not use for actual legal cases yet.
Always consult with a qualified attorney for legal advice.
```

---

## 🧪 Creating a Test Checklist

**Provide testers with a structured checklist:**

### Test Checklist for CPS Defense Analyzer

**Basic Functionality:**
- [ ] App loads successfully
- [ ] Can create account / login
- [ ] State selection works
- [ ] Can switch between tabs

**Document Management:**
- [ ] Upload PDF document
- [ ] Paste text document
- [ ] AI analysis runs
- [ ] Violations detected automatically
- [ ] Timeline events extracted

**Core Features:**
- [ ] Timeline visualization works
- [ ] Violation checker shows all options
- [ ] Defense strategies generate
- [ ] Rights guide is readable
- [ ] Evidence checklist saves

**Premium Features:**
- [ ] Virtual case binder organizes documents
- [ ] Violation report generates
- [ ] Case podcast plays
- [ ] Document generator creates motions
- [ ] Attorney dashboard shows analytics

**NEW Bulk Data Features:**
- [ ] Bulk Data tab loads
- [ ] Can view available datasets
- [ ] Citation Network visualizes
- [ ] Semantic search returns results
- [ ] Analytics charts display
- [ ] Offline mode caches data

**Mobile Testing:**
- [ ] Responsive on phone
- [ ] Tabs accessible
- [ ] Forms usable
- [ ] Documents readable

**Accessibility:**
- [ ] Screen reader compatible
- [ ] Keyboard navigation works
- [ ] High contrast mode readable

---

## 🎨 Branding Your Test Version

### Add Test Environment Indicator

In `App.tsx`, add a banner:

```typescript
// At the top of your app
{process.env.NODE_ENV !== 'production' && (
  <div className="bg-yellow-500 text-black text-center py-2 font-bold">
    ⚠️ TEST VERSION - Not for Production Use
  </div>
)}
```

### Add Feedback Button

```typescript
<Button 
  onClick={() => window.open('https://forms.gle/YOUR_FORM_ID', '_blank')}
  className="fixed bottom-4 right-4 z-50"
>
  📝 Send Feedback
</Button>
```

---

## 📊 Tracking Test Usage

### Add Analytics (Optional)

**Google Analytics:**
```typescript
// Add to your index.html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

**Or use Vercel Analytics:**
- Enable in Vercel dashboard → Analytics
- Automatically tracks page views, visitors

---

## 🔒 Security Considerations for Test Version

### ⚠️ CRITICAL: Before sharing publicly

1. **Remove Sensitive Data:**
   - Check for hardcoded API keys
   - Remove real user data
   - Use test Stripe keys

2. **Enable Authentication:**
   - Require login for all features
   - Or set up test accounts

3. **Rate Limiting:**
   - Prevent abuse of AI features
   - Limit API calls

4. **Add Legal Disclaimers:**
   - "Test version only"
   - "Not for legal advice"
   - "Data may be reset"

5. **Monitor Usage:**
   - Set up error tracking (Sentry)
   - Monitor API costs
   - Watch database usage

---

## 🚦 Deployment Checklist

Before sending to testers:

### Pre-Deploy:
- [ ] DEV_MODE set to false (or create TEST_MODE)
- [ ] Environment variables configured
- [ ] Build completes without errors
- [ ] Test locally first
- [ ] Database migrations run
- [ ] Supabase backend deployed

### Post-Deploy:
- [ ] Test the deployed URL yourself
- [ ] Check all major features work
- [ ] Verify auth flow works
- [ ] Test payment/subscription gates
- [ ] Check mobile responsiveness
- [ ] Test in different browsers
- [ ] Verify AI features work

### Documentation:
- [ ] Create test account credentials
- [ ] Write testing instructions
- [ ] Prepare feedback form
- [ ] Set up bug tracking

---

## 🎯 Recommended Approach

**For your CPS Defense Analyzer, I recommend:**

### Step 1: Deploy to Vercel (Free)
```bash
# Quick 5-minute setup
1. Export code from Figma Make
2. Push to GitHub
3. Connect to Vercel
4. Add Supabase environment variables
5. Get URL: https://cps-analyzer.vercel.app
```

### Step 2: Create Test Accounts
- Create 3-5 test accounts with different permission levels
- Pre-populate with sample case data
- Document credentials

### Step 3: Send to Small Group First
- 3-5 trusted users
- Get detailed feedback
- Fix critical bugs

### Step 4: Broader Testing
- Send to 20-30 users
- Use feedback form
- Iterate based on feedback

---

## 📞 Support During Testing

### Set Up Support Channel

**Option 1: Email**
- Create: test-support@yourapp.com
- Monitor daily during test period

**Option 2: Discord/Slack**
- Create test server
- Channels: #bugs, #feedback, #questions
- Be active during business hours

**Option 3: Google Form**
- Quick feedback collection
- Structured bug reports

---

## 🎉 Quick Start (TL;DR)

**Fastest way to send test version:**

```bash
# 1. Export from Figma Make

# 2. Push to GitHub
git init
git add .
git commit -m "Test version"
# Create repo on github.com
git remote add origin YOUR_REPO_URL
git push -u origin main

# 3. Deploy to Vercel
# Go to vercel.com → Import from GitHub
# Add environment variables:
#   VITE_SUPABASE_URL
#   VITE_SUPABASE_ANON_KEY

# 4. Get your test URL
# https://your-app.vercel.app

# 5. Share with testers!
```

**Total time: 15 minutes** ⚡

---

## 🆘 Troubleshooting

### Common Issues:

**"App won't load after deployment"**
- Check environment variables are set
- Verify build completed successfully
- Check browser console for errors

**"Supabase not connecting"**
- Verify SUPABASE_URL is correct
- Check ANON_KEY is valid
- Ensure backend functions deployed

**"Features not working"**
- Check if DEV_MODE needs to be true
- Verify subscription checks
- Test with premium account

**"Slow loading"**
- Check bundle size
- Verify API response times
- Test internet connection

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [Supabase Documentation](https://supabase.com/docs)
- [GitHub Pages Guide](https://pages.github.com)

---

## ✅ Final Checklist

Before sending test version:

- [ ] App deployed and accessible
- [ ] Test yourself thoroughly
- [ ] Environment variables set
- [ ] Authentication working
- [ ] Test accounts created
- [ ] Feedback mechanism ready
- [ ] Legal disclaimers visible
- [ ] Mobile responsive
- [ ] Instructions written
- [ ] Support channel established

---

**You're ready to send your test version! 🚀**

Need help with any specific deployment option? Let me know!
