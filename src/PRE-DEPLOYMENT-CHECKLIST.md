# ✅ PRE-DEPLOYMENT CHECKLIST - THE CPS PUNISHER

Complete this checklist before deploying to production.

---

## 🔴 **CRITICAL - MUST DO** 

### **1. Disable DEV_MODE** ⚠️ REQUIRED
- [ ] Open `/App.tsx`
- [ ] Find line 81: `const DEV_MODE = true;`
- [ ] Change to: `const DEV_MODE = false;`
- [ ] Save file
- [ ] **DO NOT SKIP THIS - Authentication will not work in production!**

### **2. Environment Variables Ready**
- [ ] Supabase URL copied
- [ ] Supabase Anon Key copied
- [ ] Google Analytics ID (optional)
- [ ] Sentry DSN (optional)
- [ ] All secrets ready to paste

### **3. Supabase Database Setup**
- [ ] Supabase project created
- [ ] Database table created (kv_store_a24eaa40)
- [ ] RLS policies enabled
- [ ] Authentication enabled
- [ ] Email provider configured

### **4. Domain Ready**
- [ ] cpspunisher.com purchased
- [ ] Access to domain registrar
- [ ] Ready to configure DNS

---

## 📋 **CODE REVIEW**

### **Security**
- [ ] No API keys hardcoded in source
- [ ] No sensitive data in code
- [ ] `.env` file in `.gitignore`
- [ ] Environment variables used correctly
- [ ] DEV_MODE set to `false`

### **Legal**
- [ ] Copyright notices present
- [ ] Legal disclaimers visible
- [ ] Footer disclaimer on all pages
- [ ] AI content disclaimer included

### **Features**
- [ ] All core features working locally
- [ ] Multi-case management tested
- [ ] Document upload tested
- [ ] Timeline tested
- [ ] Violation checker tested
- [ ] Criminal case component tested
- [ ] Community hub tested

---

## 🔨 **BUILD & TEST**

### **Local Build Test**
```bash
npm run build
```
- [ ] Build completes without errors
- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] dist/ folder created

### **Preview Production Build**
```bash
npm run preview
```
- [ ] App loads at localhost:4173
- [ ] Authentication works
- [ ] Navigation works
- [ ] All tabs accessible
- [ ] No console errors

### **Cross-Browser Testing**
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers

---

## 🐙 **GIT & GITHUB**

### **Repository Setup**
- [ ] GitHub repository created
- [ ] Repository is private (recommended)
- [ ] All files committed
- [ ] .gitignore includes .env
- [ ] README.md updated
- [ ] No sensitive data in repo

### **Git Commands**
```bash
git init
git add .
git commit -m "Initial commit - The CPS Punisher v3.0"
git remote add origin https://github.com/YOUR_USERNAME/cps-punisher.git
git push -u origin main
```

- [ ] Git initialized
- [ ] All files added
- [ ] Initial commit made
- [ ] Remote added
- [ ] Pushed to GitHub

---

## 🗄️ **SUPABASE CONFIGURATION**

### **Project Setup**
- [ ] Account created at supabase.com
- [ ] New project created
- [ ] Project name: "CPS Punisher"
- [ ] Region selected
- [ ] Database password saved securely

### **Database Migration**
- [ ] SQL executed in Supabase SQL Editor
- [ ] kv_store_a24eaa40 table created
- [ ] Indexes created
- [ ] RLS enabled
- [ ] Policies created
- [ ] Trigger created

### **Authentication**
- [ ] Email provider enabled
- [ ] OAuth providers configured (optional):
  - [ ] Google
  - [ ] GitHub
  - [ ] Facebook

### **API Credentials**
- [ ] Project URL copied: `https://xxxxx.supabase.co`
- [ ] Anon/Public Key copied
- [ ] Service Role Key NOT used in frontend
- [ ] Keys stored securely

---

## ☁️ **DEPLOYMENT PLATFORM**

### **Choose Platform** (Pick One)

#### **Option 1: Vercel (Recommended)** ✅
- [ ] Vercel account created
- [ ] Vercel CLI installed: `npm install -g vercel`
- [ ] Logged in: `vercel login`
- [ ] Ready to deploy

#### **Option 2: Netlify**
- [ ] Netlify account created
- [ ] Netlify CLI installed: `npm install -g netlify-cli`
- [ ] Logged in: `netlify login`
- [ ] Ready to deploy

---

## 🌐 **DOMAIN CONFIGURATION**

### **Domain Setup**
- [ ] cpspunisher.com registered
- [ ] Login credentials for registrar
- [ ] DNS management accessible
- [ ] Nameservers noted (if needed)

### **DNS Records Ready to Add**

For Vercel:
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

For Netlify:
```
Type: A
Name: @
Value: 75.2.60.5

Type: CNAME
Name: www
Value: your-site.netlify.app
```

- [ ] Ready to add DNS records
- [ ] 24-48 hours available for DNS propagation

---

## 📊 **MONITORING & ANALYTICS** (Optional)

### **Google Analytics**
- [ ] GA4 property created
- [ ] Measurement ID copied (G-XXXXXXXXXX)
- [ ] Ready to add to environment variables

### **Sentry Error Tracking**
- [ ] Sentry account created
- [ ] Project created (React)
- [ ] DSN copied
- [ ] Ready to add to environment variables

---

## 🔐 **SECURITY CHECKLIST**

### **Authentication**
- [ ] DEV_MODE disabled (CRITICAL!)
- [ ] Supabase auth configured
- [ ] Email provider working
- [ ] Password requirements set

### **Data Protection**
- [ ] HTTPS will be enabled (automatic with Vercel/Netlify)
- [ ] Environment variables secured
- [ ] No secrets in source code
- [ ] Database RLS policies enabled

### **Privacy**
- [ ] Privacy policy prepared (if needed)
- [ ] Terms of service prepared (if needed)
- [ ] Cookie policy prepared (if needed)
- [ ] GDPR compliance considered (if EU users)

---

## 📱 **RESPONSIVE DESIGN CHECK**

### **Desktop**
- [ ] 1920x1080 (Full HD)
- [ ] 1366x768 (Laptop)
- [ ] 1280x720 (HD)

### **Tablet**
- [ ] 768x1024 (iPad)
- [ ] 1024x768 (Landscape)

### **Mobile**
- [ ] 375x667 (iPhone SE)
- [ ] 390x844 (iPhone 12/13/14)
- [ ] 360x740 (Android)

---

## ♿ **ACCESSIBILITY CHECK**

- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] ARIA labels present
- [ ] Focus indicators visible
- [ ] Color contrast sufficient
- [ ] Alt text on images

---

## 📄 **CONTENT REVIEW**

### **Legal Text**
- [ ] Copyright © 2024 Darren Guay - All Rights Reserved
- [ ] Legal disclaimer visible
- [ ] AI content disclaimer present
- [ ] Footer disclaimer on all pages
- [ ] No attorney-client relationship notice

### **Help Content**
- [ ] Help bot functional
- [ ] FAQ sections complete
- [ ] Welcome tour working
- [ ] Quick tips present

---

## 🎯 **FINAL VERIFICATION**

### **Production Readiness**
- [ ] All features tested
- [ ] No console errors
- [ ] No broken links
- [ ] All images load
- [ ] Forms submit correctly
- [ ] Navigation works
- [ ] Search functions work
- [ ] File uploads work

### **Performance**
- [ ] Page load < 3 seconds
- [ ] Images optimized
- [ ] No unnecessary libraries
- [ ] Bundle size reasonable
- [ ] Lazy loading implemented

### **SEO (Optional)**
- [ ] Meta tags present
- [ ] Title tags descriptive
- [ ] Meta descriptions added
- [ ] Open Graph tags (social sharing)
- [ ] Sitemap generated
- [ ] robots.txt created

---

## 🚀 **DEPLOYMENT STEPS**

### **Step-by-Step**

1. **Disable DEV_MODE** ⚠️
   ```typescript
   const DEV_MODE = false;
   ```

2. **Build Project**
   ```bash
   npm run build
   ```

3. **Test Build**
   ```bash
   npm run preview
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "Production ready - DEV_MODE disabled"
   git push origin main
   ```

5. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

6. **Configure Environment Variables**
   - In Vercel dashboard
   - Add all required variables
   - Redeploy

7. **Setup Custom Domain**
   - Add cpspunisher.com in Vercel
   - Configure DNS records
   - Wait for DNS propagation

8. **Verify SSL**
   - Check https://cpspunisher.com
   - Green lock icon visible
   - Certificate valid

9. **Test Production Site**
   - All features work
   - Authentication works
   - No errors
   - Mobile responsive

10. **Launch! 🎉**

---

## 📝 **POST-DEPLOYMENT**

### **Immediate Tasks**
- [ ] Test all critical features
- [ ] Verify authentication
- [ ] Check mobile responsiveness
- [ ] Monitor error logs
- [ ] Test on multiple devices

### **Within 24 Hours**
- [ ] Check DNS propagation
- [ ] Verify SSL certificate
- [ ] Monitor analytics
- [ ] Check performance
- [ ] Review error rates

### **Within 1 Week**
- [ ] Gather user feedback
- [ ] Monitor usage patterns
- [ ] Identify issues
- [ ] Plan updates
- [ ] Marketing push

---

## 🆘 **EMERGENCY CONTACTS**

### **Platform Support**
- **Vercel:** https://vercel.com/support
- **Netlify:** https://www.netlify.com/support/
- **Supabase:** https://supabase.com/support
- **GitHub:** https://support.github.com

### **Documentation**
- **Deployment Guide:** See DEPLOYMENT.md
- **Commands Cheat Sheet:** See COMMANDS.md
- **README:** See README.md

---

## ✅ **FINAL CHECKLIST SUMMARY**

Before deploying, ensure:

- [ ] ⚠️ DEV_MODE = false (CRITICAL!)
- [ ] 🗄️ Supabase configured
- [ ] 🐙 Code on GitHub
- [ ] 🔑 Environment variables ready
- [ ] 🌐 Domain ready
- [ ] 🔨 Build successful
- [ ] 🧪 Tests passed
- [ ] 📱 Responsive design verified
- [ ] 🔐 Security checked
- [ ] 📄 Legal disclaimers present

---

## 🎉 **READY TO DEPLOY?**

If all checkboxes above are checked, you're ready!

Run:
```bash
./deploy.sh
```

Or manually:
```bash
npm run build && vercel --prod
```

---

**🛡️ Fight Back. Defend Your Family. Deploy with Confidence!**

**Copyright © 2024 Darren Guay - All Rights Reserved**
