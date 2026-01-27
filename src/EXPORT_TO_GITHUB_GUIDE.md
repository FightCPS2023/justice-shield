# 🚀 EXPORT TO GITHUB - COMPLETE GUIDE

## 📍 YOUR PROJECT FOLDER LOCATION

```
Desktop/
└── cps-punisher/          ← CREATE THIS FOLDER
    ├── src/
    │   ├── App.tsx
    │   ├── main.tsx
    │   ├── components/
    │   ├── supabase/
    │   ├── styles/
    │   └── imports/
    ├── public/
    ├── package.json
    ├── .gitignore
    └── README.md
```

---

## 🎯 OPTION 1: MANUAL COPY (EASIEST)

### Step 1: Create Folder
```bash
cd Desktop
mkdir cps-punisher
cd cps-punisher
```

### Step 2: Initialize Project
```bash
npm create vite@latest . -- --template react-ts
npm install
npm install @supabase/supabase-js recharts react-slick lucide-react sonner@2.0.3
```

### Step 3: Copy Files from Figma Make

**Copy each file from Figma Make and paste into your local folder:**

| From Figma Make | To Local Folder |
|-----------------|-----------------|
| `/App.tsx` | `src/App.tsx` |
| `/components/AuthForm.tsx` | `src/components/AuthForm.tsx` |
| `/components/ServerStatus.tsx` | `src/components/ServerStatus.tsx` |
| `/components/HelpBotButton.tsx` | `src/components/HelpBotButton.tsx` |
| `/styles/globals.css` | `src/styles/globals.css` |
| `/supabase/functions/server/index.tsx` | `src/supabase/functions/server/index.tsx` |
| *... all other files* | *... matching structure* |

### Step 4: Create .gitignore
```bash
echo "node_modules/
dist/
.env
.env.local
.DS_Store
*.log" > .gitignore
```

### Step 5: Create .env
```bash
echo "VITE_SUPABASE_URL=https://rewgkrgmcmikivxjnfdq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJld2drcmdtY21pa2l2eGpuZmRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NzIzMzQsImV4cCI6MjA3OTM0ODMzNH0.i-kP7mvSAU9hlpMBKVHesRQj90B9jm47luFMuvF4lhQ" > .env
```

### Step 6: Initialize Git
```bash
git init
git add .
git commit -m "Initial commit - The CPS Punisher"
```

### Step 7: Create GitHub Repo
1. Go to https://github.com/new
2. Name: `cps-punisher`
3. Make **PRIVATE**
4. Click "Create repository"

### Step 8: Push to GitHub
```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/cps-punisher.git
git branch -M main
git push -u origin main
```

Done! 🎉

---

## 🎯 OPTION 2: USE GITHUB DESKTOP (NO TERMINAL)

### Step 1: Download GitHub Desktop
- https://desktop.github.com
- Install and sign in

### Step 2: Create Folder Structure
- Create folder: `Desktop/cps-punisher/`
- Copy all files from Figma Make into this folder

### Step 3: Create Repository
1. Open GitHub Desktop
2. File → Add Local Repository
3. Choose `Desktop/cps-punisher`
4. Click "Create Repository"
5. Click "Publish Repository"
6. Name: `cps-punisher`
7. Make **PRIVATE**
8. Click "Publish"

Done! 🎉

---

## 📋 COMPLETE FILE LIST TO COPY

### Core Files (Required):
```
✅ /App.tsx
✅ /main.tsx (if exists)
✅ /index.html
✅ /styles/globals.css
✅ /package.json (create new or copy)
✅ /tsconfig.json
✅ /vite.config.ts
```

### Components (All):
```
✅ /components/AuthForm.tsx
✅ /components/ServerStatus.tsx
✅ /components/LoginDiagnostic.tsx
✅ /components/HelpBotButton.tsx
✅ /components/HelpBotModal.tsx
✅ /components/AdminChatViewer.tsx
✅ /components/DocumentAnalyzer.tsx
✅ /components/TimelineBuilder.tsx
✅ /components/ViolationChecker.tsx
✅ /components/DefenseStrategy.tsx
✅ /components/RightsGuide.tsx
✅ /components/EvidenceChecklist.tsx
✅ /components/CaseDetails.tsx
✅ /components/FederalLitigation.tsx
✅ /components/CommunityHub.tsx
✅ /components/AdvocateDirectory.tsx
✅ /components/ResourceHub.tsx
✅ /components/Pricing.tsx
✅ /components/MultiCaseManager.tsx
✅ /components/CalendarView.tsx
✅ /components/BulkDataExport.tsx
... all other components
```

### Server Files:
```
✅ /supabase/functions/server/index.tsx
✅ /supabase/functions/server/stripe.tsx
✅ /supabase/functions/server/bulk-data.tsx
✅ /supabase/functions/server/calendar.tsx
✅ /supabase/functions/server/community.tsx
```

### UI Components:
```
✅ /components/ui/button.tsx
✅ /components/ui/card.tsx
✅ /components/ui/input.tsx
✅ /components/ui/textarea.tsx
✅ /components/ui/select.tsx
✅ /components/ui/tabs.tsx
✅ /components/ui/dialog.tsx
✅ /components/ui/badge.tsx
✅ /components/ui/alert.tsx
... all other UI components
```

### Utils & Other:
```
✅ /utils/supabase/info.tsx
✅ /imports/ (all files)
```

---

## 🔧 CONFIGURATION FILES TO CREATE

### 1. `.gitignore`
```
node_modules/
dist/
.env
.env.local
.DS_Store
*.log
.vscode/
.idea/
coverage/
build/
```

### 2. `.env` (DON'T COMMIT!)
```
VITE_SUPABASE_URL=https://rewgkrgmcmikivxjnfdq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJld2drcmdtY21pa2l2eGpuZmRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NzIzMzQsImV4cCI6MjA3OTM0ODMzNH0.i-kP7mvSAU9hlpMBKVHesRQj90B9jm47luFMuvF4lhQ
VITE_STRIPE_PUBLIC_KEY=your_stripe_key_here
```

### 3. `README.md`
```markdown
# The CPS Punisher

Case Defense Analyzer for Parents Fighting CPS

## Features
- Document Management
- Timeline Builder
- Violation Checker
- Defense Strategies
- Federal Litigation Tools
- Community Hub

## Setup
npm install
npm run dev

## Deploy
npm run build

## Owner
© 2024 Darren Guay. All Rights Reserved.
```

---

## 📦 PACKAGE.JSON

Create `package.json`:

```json
{
  "name": "cps-punisher",
  "version": "1.0.0",
  "description": "The CPS Punisher - Case Defense Analyzer",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/supabase-js": "^2.39.0",
    "recharts": "^2.10.0",
    "react-slick": "^0.29.0",
    "lucide-react": "^0.300.0",
    "sonner": "2.0.3",
    "react-hook-form": "7.55.0",
    "@stripe/stripe-js": "^2.4.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/react-slick": "^0.23.12",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "tailwindcss": "^4.0.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32"
  },
  "author": "Darren Guay",
  "license": "PROPRIETARY"
}
```

---

## 🚀 DEPLOYMENT (After GitHub)

### To Vercel:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set custom domain
vercel domains add cpspunisher.com
```

### To Netlify:
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod

# Set custom domain in Netlify dashboard
```

---

## ✅ CHECKLIST

- [ ] Created `cps-punisher/` folder
- [ ] Initialized with `npm create vite`
- [ ] Installed dependencies
- [ ] Copied all files from Figma Make
- [ ] Created `.gitignore`
- [ ] Created `.env` (with secrets)
- [ ] Initialized git (`git init`)
- [ ] Created GitHub repo (PRIVATE!)
- [ ] Pushed to GitHub (`git push`)
- [ ] Verified files on GitHub
- [ ] Ready to deploy!

---

## 🆘 TROUBLESHOOTING

### "Git not found"
Install Git: https://git-scm.com/downloads

### "npm not found"
Install Node.js: https://nodejs.org

### "Permission denied"
```bash
sudo chown -R $USER .
```

### "GitHub authentication failed"
Use Personal Access Token instead of password:
https://github.com/settings/tokens

---

## 📞 QUICK COMMANDS

```bash
# Create folder
mkdir cps-punisher && cd cps-punisher

# Initialize
npm create vite@latest . -- --template react-ts && npm install

# Install deps
npm i @supabase/supabase-js recharts react-slick lucide-react sonner@2.0.3

# Create .gitignore
echo "node_modules/\ndist/\n.env" > .gitignore

# Initialize git
git init && git add . && git commit -m "Initial commit"

# Push to GitHub (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/cps-punisher.git
git push -u origin main
```

---

## 🎉 YOU'RE DONE!

Your code is now on GitHub and ready to deploy to cpspunisher.com!

Next step: Deploy to Vercel/Netlify

---

**Created:** December 5, 2024  
**For:** The CPS Punisher - GitHub Export Guide  
**Owner:** Darren Guay
