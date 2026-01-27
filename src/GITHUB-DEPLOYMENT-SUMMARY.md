# 🚀 GITHUB DEPLOYMENT - QUICK START GUIDE

**The CPS Punisher - Production Deployment**

---

## ⚡ **FASTEST DEPLOYMENT PATH**

### **Total Time: ~30 minutes**

---

## 🎯 **STEP 1: PREPARE (5 minutes)**

### **A. Disable DEV_MODE** ⚠️ CRITICAL
Open `/App.tsx` line 81 and change:
```typescript
const DEV_MODE = false; // Set to false for production
```

### **B. Create Supabase Project**
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy Project URL and Anon Key
4. Run the SQL migration (see DEPLOYMENT.md)

---

## 🐙 **STEP 2: PUSH TO GITHUB (5 minutes)**

```bash
# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - The CPS Punisher v3.0"

# Create GitHub repo at github.com
# Then add remote:
git remote add origin https://github.com/YOUR_USERNAME/cps-punisher.git

# Push
git branch -M main
git push -u origin main
```

✅ **Your code is now on GitHub!**

---

## ☁️ **STEP 3: DEPLOY TO VERCEL (10 minutes)**

### **Option A: Deploy from GitHub (Easiest)**

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository `cps-punisher`
4. Configure:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Add Environment Variables:
   ```
   VITE_SUPABASE_URL = your_supabase_url
   VITE_SUPABASE_ANON_KEY = your_anon_key
   ```
6. Click "Deploy"

### **Option B: Deploy via CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

✅ **Your app is now live at [your-app].vercel.app!**

---

## 🌐 **STEP 4: CONNECT CUSTOM DOMAIN (10 minutes)**

### **A. Add Domain in Vercel**
1. Go to your Vercel project
2. Settings → Domains
3. Add domain: `cpspunisher.com`
4. Add domain: `www.cpspunisher.com`

### **B. Configure DNS at Your Registrar**

Add these DNS records:

**For cpspunisher.com:**
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

### **C. Wait for DNS Propagation**
- Usually takes 1-24 hours
- Check status at [dnschecker.org](https://dnschecker.org)
- SSL automatically provisioned by Vercel

✅ **Your app will be live at cpspunisher.com!**

---

## 🎉 **THAT'S IT - YOU'RE DEPLOYED!**

Your app is now:
- ✅ Live on production servers
- ✅ Backed by GitHub version control
- ✅ Automatic deployments on git push
- ✅ SSL/HTTPS enabled
- ✅ Custom domain (once DNS propagates)

---

## 📋 **ENVIRONMENT VARIABLES NEEDED**

| Variable | Where to Get It | Required |
|----------|----------------|----------|
| `VITE_SUPABASE_URL` | Supabase Project Settings → API | ✅ Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase Project Settings → API | ✅ Yes |
| `VITE_GA_MEASUREMENT_ID` | Google Analytics (optional) | ❌ No |
| `VITE_SENTRY_DSN` | Sentry.io (optional) | ❌ No |

---

## 🔄 **CONTINUOUS DEPLOYMENT**

Once setup, every time you push to GitHub:
```bash
git add .
git commit -m "Update: your changes"
git push origin main
```

Vercel automatically:
1. ✅ Detects the push
2. ✅ Runs build
3. ✅ Deploys to production
4. ✅ Updates your live site

---

## 📱 **QUICK COMMANDS**

### **Daily Development**
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

### **Git Commands**
```bash
git add .                              # Stage changes
git commit -m "Your message"           # Commit changes
git push origin main                   # Push to GitHub
```

### **Deployment**
```bash
vercel --prod        # Deploy to production
vercel logs          # View deployment logs
vercel domains ls    # List domains
```

---

## 🆘 **TROUBLESHOOTING**

### **Build Fails**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### **Environment Variables Not Working**
1. Check Vercel dashboard → Settings → Environment Variables
2. Redeploy: `vercel --prod`

### **Domain Not Working**
1. Wait 24-48 hours for DNS propagation
2. Check DNS at [dnschecker.org](https://dnschecker.org)
3. Verify DNS records match exactly

### **Authentication Not Working**
1. Verify DEV_MODE is `false`
2. Check Supabase environment variables
3. Verify Supabase RLS policies

---

## 📚 **COMPLETE DOCUMENTATION**

For detailed instructions, see:

- **📖 DEPLOYMENT.md** - Complete deployment guide
- **📋 PRE-DEPLOYMENT-CHECKLIST.md** - Full checklist
- **⌨️ COMMANDS.md** - All commands reference
- **📘 README.md** - Project overview

---

## 🎯 **RECOMMENDED PLATFORMS**

### **1. Vercel (RECOMMENDED) ⭐**
- ✅ Easiest setup
- ✅ Best for React/Vite
- ✅ Free SSL
- ✅ Auto deployments
- ✅ Great performance
- 🔗 [vercel.com](https://vercel.com)

### **2. Netlify**
- ✅ Also excellent
- ✅ Free tier generous
- ✅ Easy DNS management
- ✅ Good analytics
- 🔗 [netlify.com](https://netlify.com)

### **3. GitHub Pages**
- ✅ Free hosting
- ❌ More complex setup
- ❌ No server-side features
- 🔗 [pages.github.com](https://pages.github.com)

---

## 💰 **COST BREAKDOWN**

| Service | Cost | Required |
|---------|------|----------|
| **Vercel Hosting** | Free (Hobby) | ✅ Yes |
| **Supabase** | Free (up to 500MB) | ✅ Yes |
| **Domain (cpspunisher.com)** | ~$12/year | ✅ Yes |
| **Google Analytics** | Free | ❌ Optional |
| **Sentry (Errors)** | Free (5K events) | ❌ Optional |
| **Total Minimum** | **~$12/year** | |

---

## 🔐 **SECURITY REMINDERS**

### **Before Deploying:**
- [ ] ⚠️ DEV_MODE must be `false`
- [ ] 🔑 No API keys in source code
- [ ] 📝 `.env` in `.gitignore`
- [ ] 🔒 Supabase RLS policies enabled
- [ ] ✅ HTTPS will be automatic

### **After Deploying:**
- [ ] 🧪 Test authentication
- [ ] 🔍 Check console for errors
- [ ] 📱 Test on mobile
- [ ] 🌐 Verify SSL certificate
- [ ] 📊 Monitor error logs

---

## 🎓 **LEARNING RESOURCES**

### **Vercel**
- [Vercel Documentation](https://vercel.com/docs)
- [Deploy Vite App](https://vercel.com/docs/frameworks/vite)

### **Supabase**
- [Supabase Quickstart](https://supabase.com/docs/guides/getting-started)
- [Auth Documentation](https://supabase.com/docs/guides/auth)

### **GitHub**
- [GitHub Basics](https://docs.github.com/en/get-started)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)

---

## 🚀 **DEPLOYMENT TIMELINE**

| Task | Time | Status |
|------|------|--------|
| Disable DEV_MODE | 1 min | ⬜ |
| Setup Supabase | 5 min | ⬜ |
| Push to GitHub | 5 min | ⬜ |
| Deploy to Vercel | 10 min | ⬜ |
| Configure Domain | 5 min | ⬜ |
| DNS Propagation | 1-24 hours | ⬜ |
| **Total** | **~30 min + DNS** | |

---

## ✅ **DEPLOYMENT CHECKLIST**

Quick checklist:
- [ ] DEV_MODE = false
- [ ] Supabase project created
- [ ] Database table created
- [ ] Code on GitHub
- [ ] Deployed to Vercel
- [ ] Environment variables added
- [ ] Domain configured
- [ ] DNS records added
- [ ] Site tested
- [ ] SSL working

---

## 🎉 **SUCCESS!**

Once deployed, your app will be live at:

🌐 **Production URL:** `https://cpspunisher.com`

Test it:
1. Visit the URL
2. Sign up for an account
3. Create a case
4. Upload a document
5. Test all features

---

## 📞 **NEED HELP?**

### **Documentation:**
- See DEPLOYMENT.md for detailed instructions
- See PRE-DEPLOYMENT-CHECKLIST.md for full checklist
- See COMMANDS.md for all commands

### **Support:**
- **Vercel:** [vercel.com/support](https://vercel.com/support)
- **Supabase:** [supabase.com/support](https://supabase.com/support)
- **GitHub:** [support.github.com](https://support.github.com)

---

## 🏆 **YOU'VE GOT THIS!**

Follow these steps and you'll have a production app in under an hour!

**🛡️ Fight Back. Defend Your Family. Deploy with Confidence!**

**Copyright © 2024 Darren Guay - All Rights Reserved**

---

## 📊 **QUICK STATUS CHECK**

After deployment, verify:

```bash
# Check if site is live
curl -I https://cpspunisher.com

# Should return: HTTP/2 200
```

✅ **200 OK** = Success!  
❌ **Error** = Check DEPLOYMENT.md troubleshooting

---

**🚀 Ready to Deploy? Start with Step 1!**
