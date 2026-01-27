# 📋 COPY THIS TO PUBLISH BOX

**AI Instructions for Deploying The CPS Punisher App**

---

## CRITICAL REQUIREMENTS

**App Name:** The CPS Punisher - CPS Case Defense Analyzer
**Copyright:** DARREN GUAY (permanent, never change)
**Domain:** cpspunisher.com
**Features:** 320+ features including multi-case management, Federal Civil Rights tools, special access code system
**Special Access Code:** `CPSPUNISHER2024`

---

## ✅ DEPLOYMENT CHECKLIST

### 1. VERIFY VERCEL CONFIGURATION

Ensure `/vercel.json` contains:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 2. VERIFY BUILD SETTINGS

**Vercel Dashboard Settings:**
- Framework: **Vite**
- Build Command: **npm run build**
- Output Directory: **dist**
- Install Command: **npm install**
- Node Version: **18.x or higher**

### 3. CHECK FOR BUILD-BREAKING ERRORS

**JSX Syntax - Must Fix:**
- ❌ `<button>More ></button>` → ✅ `<button>More ></button>`
- ❌ `<span>< text</span>` → ✅ `<span>< text</span>`
- ❌ Adjacent elements without wrapper → ✅ Wrap in `<>...</>`
- ❌ `<path d= "..."` (space before =) → ✅ `<path d="..."`

**Safety Checks - Add to all .map():**
```typescript
{items?.map((item) => ...) ?? []}
// or
{(items || []).map((item) => ...)}
```

### 4. VERIFY CORE FILES EXIST

Required files:
- `/package.json` - Dependencies
- `/vite.config.ts` - Vite config
- `/vercel.json` - Deployment config
- `/App.tsx` - Main app (must have default export)
- `/index.html` - Entry point
- `/styles/globals.css` - Tailwind v4 styles
- `/contexts/SubscriptionContext.tsx` - Access control

### 5. CHECK IMPORT STATEMENTS

**Correct imports:**
- ✅ `import { toast } from "sonner@2.0.3"` (ONLY sonner needs version)
- ✅ `import { motion } from "motion/react"` (NOT framer-motion)
- ✅ All other packages: `import { X } from 'package-name'` (NO version)

### 6. PRESERVE SPECIAL FEATURES

**Must work after deployment:**
- Special Access Code button in header (Key icon)
- Code `CPSPUNISHER2024` unlocks all Enterprise features
- All 5 subscription tiers (Free, Essential, Professional, Attorney, Enterprise)
- Multi-case management system
- Federal Civil Rights Litigation section
- Community Hub & Attorney Directory
- Notarization service
- Dark mode toggle
- All 320+ features

### 7. VERIFY LEGAL DISCLAIMERS

**Must be visible:**
- Landing page disclaimer modal
- Footer disclaimer on every page
- AI content disclaimers where applicable
- Copyright: "© 2024 DARREN GUAY. All Rights Reserved."

### 8. DO NOT MODIFY

**Protected files - NEVER edit:**
- `/components/figma/ImageWithFallback.tsx`

**Protected content - NEVER change:**
- Copyright holder: DARREN GUAY
- Special access code: CPSPUNISHER2024
- Legal disclaimers

### 9. TYPOGRAPHY RULES

**DO NOT ADD** these Tailwind classes (unless requested):
- Font sizes: `text-xl`, `text-2xl`, etc.
- Font weights: `font-bold`, `font-semibold`, etc.
- Line heights: `leading-tight`, `leading-none`, etc.

Reason: `/styles/globals.css` has default typography.

---

## 🚀 BUILD COMMAND

The build process will:
1. Run `npm install`
2. Run `npm run build` (creates `/dist` folder)
3. Deploy contents of `/dist` folder
4. Make live at cpspunisher.com

**Expected outcome:** No errors, `/dist` folder created successfully.

---

## 🔍 POST-DEPLOYMENT TEST

After deployment, verify:
- ✅ Landing page loads
- ✅ Can create new case
- ✅ Special access code button in header
- ✅ Code `CPSPUNISHER2024` unlocks features
- ✅ Dark mode toggle works
- ✅ All navigation tabs accessible
- ✅ Federal Civil Rights section loads
- ✅ Community Hub accessible
- ✅ No 404 errors on page refresh
- ✅ Mobile responsive design works
- ✅ Copyright shows DARREN GUAY

---

## 🐛 COMMON ERRORS & FIXES

**Error:** "No Output Directory named 'dist' found"
**Fix:** Add to `/vercel.json`: `"outputDirectory": "dist"`

**Error:** Build fails with JSX syntax error
**Fix:** Escape special characters: `<` `>` `{'{'}` `{'}'}`

**Error:** "Cannot read properties of undefined"
**Fix:** Add safety checks: `items?.map(...) ?? []`

**Error:** 404 on page refresh
**Fix:** Add to `/vercel.json`:
```json
"rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
```

**Error:** Tailwind styles not working
**Fix:** Check `/styles/globals.css` has `@import "tailwindcss";`

---

## 🎯 SUCCESS CRITERIA

Deployment is successful when:
1. ✅ Build completes without errors
2. ✅ App loads at cpspunisher.com
3. ✅ All features work correctly
4. ✅ Special access code system functional
5. ✅ Multi-case management works
6. ✅ Legal disclaimers visible
7. ✅ Copyright shows DARREN GUAY
8. ✅ No console errors in browser
9. ✅ Mobile responsive
10. ✅ Dark mode works

---

## 📝 DOMAIN SETUP

For cpspunisher.com:
1. Go to Vercel → Project Settings → Domains
2. Add `cpspunisher.com` and `www.cpspunisher.com`
3. Update DNS records as instructed
4. Wait for SSL (automatic)

---

## 💡 QUICK REFERENCE

- **Framework:** Vite + React + TypeScript
- **Styling:** Tailwind CSS v4
- **Data Storage:** localStorage (no backend required)
- **Special Code:** `CPSPUNISHER2024`
- **Build Output:** `/dist` folder
- **Node Version:** 18.x+
- **Total Features:** 320+
- **Copyright:** DARREN GUAY

---

**IMPORTANT:** This app helps parents fight for their children. Ensure every feature works perfectly.

**Copyright © 2024 DARREN GUAY. All Rights Reserved.**

---

## 📋 FINAL CHECKLIST BEFORE DEPLOYING

Copy this checklist:

```
[ ] /vercel.json has "outputDirectory": "dist"
[ ] Build command is "npm run build"
[ ] Framework is set to "Vite"
[ ] No JSX syntax errors (escaped <, >, etc.)
[ ] All .map() calls have safety checks
[ ] Special access code system intact
[ ] Copyright shows DARREN GUAY
[ ] All legal disclaimers present
[ ] Protected files not modified
[ ] Import statements correct (sonner@2.0.3 only)
[ ] App.tsx has default export
[ ] Ready to deploy!
```

---

**END - Copy everything above this line to your publish box**
