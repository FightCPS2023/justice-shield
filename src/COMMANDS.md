# 🚀 DEPLOYMENT COMMANDS CHEAT SHEET

Quick reference for all deployment commands.

---

## 📦 **INITIAL SETUP**

### Install Dependencies
```bash
npm install
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Run Development Server
```bash
npm run dev
```

---

## 🐙 **GIT & GITHUB**

### Initialize Git Repository
```bash
git init
```

### Add All Files
```bash
git add .
```

### Commit Changes
```bash
git commit -m "Initial commit - The CPS Punisher v3.0"
```

### Add Remote Repository
```bash
git remote add origin https://github.com/YOUR_USERNAME/cps-punisher.git
```

### Push to GitHub
```bash
git branch -M main
git push -u origin main
```

### Push Updates
```bash
git add .
git commit -m "Update: your message here"
git push origin main
```

---

## ☁️ **VERCEL DEPLOYMENT**

### Install Vercel CLI
```bash
npm install -g vercel
```

### Login to Vercel
```bash
vercel login
```

### Deploy (First Time)
```bash
vercel
```

### Deploy to Production
```bash
vercel --prod
```

### Check Deployment Status
```bash
vercel ls
```

### View Logs
```bash
vercel logs
```

### Add Domain
```bash
vercel domains add cpspunisher.com
```

### List Domains
```bash
vercel domains ls
```

### Remove Deployment
```bash
vercel rm [deployment-url]
```

---

## 🌐 **NETLIFY DEPLOYMENT**

### Install Netlify CLI
```bash
npm install -g netlify-cli
```

### Login to Netlify
```bash
netlify login
```

### Initialize Project
```bash
netlify init
```

### Deploy to Production
```bash
netlify deploy --prod
```

### Deploy Draft
```bash
netlify deploy
```

### Open Site
```bash
netlify open
```

### View Logs
```bash
netlify logs
```

### Link to Custom Domain
```bash
netlify domains:add cpspunisher.com
```

---

## 🗄️ **SUPABASE**

### Login to Supabase
```bash
npx supabase login
```

### Initialize Supabase
```bash
npx supabase init
```

### Link to Project
```bash
npx supabase link --project-ref your-project-ref
```

### Run Migrations
```bash
npx supabase db push
```

### Generate Types
```bash
npx supabase gen types typescript --project-id your-project-id > src/types/supabase.ts
```

---

## 🔍 **TESTING & DEBUGGING**

### Run Tests (if configured)
```bash
npm test
```

### Check Build Size
```bash
npm run build
du -sh dist/
```

### Analyze Bundle
```bash
npm run build -- --mode analyze
```

### Lint Code
```bash
npm run lint
```

### Format Code
```bash
npm run format
```

---

## 🌍 **DNS & DOMAIN**

### Check DNS Propagation
```bash
# Using dig
dig cpspunisher.com

# Using nslookup
nslookup cpspunisher.com

# Check globally
# Visit: https://dnschecker.org
```

### Verify SSL Certificate
```bash
openssl s_client -connect cpspunisher.com:443 -servername cpspunisher.com
```

---

## 🔐 **ENVIRONMENT VARIABLES**

### Set Vercel Environment Variable
```bash
vercel env add VITE_SUPABASE_URL
```

### List Environment Variables
```bash
vercel env ls
```

### Pull Environment Variables
```bash
vercel env pull
```

---

## 📊 **MONITORING**

### View Vercel Analytics
```bash
vercel analytics
```

### View Deployment Logs
```bash
vercel logs [deployment-url]
```

### Check Site Status
```bash
curl -I https://cpspunisher.com
```

---

## 🔄 **ROLLBACK**

### List Deployments
```bash
vercel ls
```

### Promote Previous Deployment
```bash
vercel promote [deployment-url]
```

### Rollback on Netlify
```bash
netlify rollback
```

---

## 🧹 **CLEANUP**

### Clear Node Modules
```bash
rm -rf node_modules package-lock.json
```

### Clear Build
```bash
rm -rf dist
```

### Clear Cache
```bash
npm cache clean --force
```

### Fresh Install
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 🚀 **ONE-COMMAND DEPLOYMENT**

### Deploy Script (Unix/Mac)
```bash
chmod +x deploy.sh
./deploy.sh
```

### Build and Deploy to Vercel
```bash
npm run build && vercel --prod
```

### Build and Deploy to Netlify
```bash
npm run build && netlify deploy --prod
```

---

## 📱 **USEFUL COMMANDS**

### Check Node Version
```bash
node --version
```

### Check npm Version
```bash
npm --version
```

### Update npm
```bash
npm install -g npm@latest
```

### Check Project Size
```bash
du -sh .
```

### Count Lines of Code
```bash
find src -name '*.tsx' -o -name '*.ts' | xargs wc -l
```

### Search for TODOs
```bash
grep -r "TODO" src/
```

---

## 🔧 **TROUBLESHOOTING**

### Fix Permission Issues
```bash
chmod +x deploy.sh
chmod +x *.sh
```

### Reset Git
```bash
git reset --hard HEAD
git clean -fd
```

### Force Push (BE CAREFUL!)
```bash
git push -f origin main
```

### Remove Remote
```bash
git remote remove origin
```

### View All Branches
```bash
git branch -a
```

### Delete Branch
```bash
git branch -d branch-name
```

---

## 🎯 **QUICK WORKFLOW**

### Daily Development
```bash
# 1. Pull latest changes
git pull origin main

# 2. Make changes
# ... edit files ...

# 3. Test locally
npm run dev

# 4. Build and test
npm run build
npm run preview

# 5. Commit and push
git add .
git commit -m "Update: description"
git push origin main

# 6. Auto-deploys via GitHub Actions
# Or manually:
vercel --prod
```

---

## 📚 **USEFUL LINKS**

- **Vercel Docs:** https://vercel.com/docs
- **Netlify Docs:** https://docs.netlify.com
- **Supabase Docs:** https://supabase.com/docs
- **Vite Docs:** https://vitejs.dev
- **React Docs:** https://react.dev

---

## 🆘 **EMERGENCY COMMANDS**

### Site Down - Quick Redeploy
```bash
vercel --prod --force
```

### Revert to Last Working Version
```bash
vercel ls
vercel promote [previous-deployment-url]
```

### Clear All Vercel Deployments
```bash
vercel rm $(vercel ls | awk '{print $1}' | tail -n +2)
```

---

## 💡 **PRO TIPS**

1. **Always test locally** before deploying
2. **Use git tags** for versioning: `git tag v1.0.0`
3. **Keep .env files secure** - never commit them
4. **Use environment variables** for all secrets
5. **Monitor your deployments** with analytics
6. **Set up alerts** for errors (Sentry)
7. **Backup your database** regularly
8. **Document changes** in commit messages
9. **Test on multiple devices** after deployment
10. **Keep dependencies updated**: `npm outdated`

---

**🛡️ Fight Back. Defend Your Family.**

**Copyright © 2024 Darren Guay - All Rights Reserved**
